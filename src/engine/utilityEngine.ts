import { ZoneNode, Agent, Incident, UtilityWeights, UtilityScoreDetail, PatrolStrategy } from '../types';
import { AdjacencyMap, findShortestPath } from './pathfinding';
import { FIXED_ROUTE_SEQUENCE } from '../data/campusTopology';

export interface DecisionResult {
  nextZoneId: string;
  reason: string;
  score: number;
  breakdown?: {
    coverage: number;
    urgency: number;
    risk: number;
    incident: number;
    dist: number;
    batteryPenalty: number;
  };
  scoreDetails?: UtilityScoreDetail[];
}

/**
 * Mathematical Utility Function:
 * U(z_i, A_k, t) = w_C * C(z_i) 
 *                + w_U * ((t - T_last) / T_max) 
 *                + w_R * R(z_i) 
 *                + w_A * I(z_i) 
 *                - (dist(z_curr, z_i) / D_max) * w_dist 
 *                - P_batt(A_k)
 */
export function calculateZoneUtility(
  zone: ZoneNode,
  agent: Agent,
  currentTick: number,
  weights: UtilityWeights,
  adjacencyMap: AdjacencyMap,
  maxDistance: number,
  otherAgents: Agent[],
  activeIncidents: Incident[]
): UtilityScoreDetail {
  const T_max = 250; // Reference maximum starvation window (ticks)
  const D_max = maxDistance > 0 ? maxDistance : 800;

  // 1. Coverage Gain Term C(z_i): 1.0 if never visited, decays if visited very recently
  let coverageGain = 0;
  if (zone.visitCount === 0) {
    coverageGain = 1.0;
  } else {
    const elapsed = Math.max(0, currentTick - zone.lastVisitedTick);
    // Sigmoidal recovery from 0.05 to 1.0 as time elapses
    coverageGain = Math.min(1.0, 0.05 + 0.95 * (1 - Math.exp(-elapsed / 80)));
  }
  const termCoverage = weights.wC * coverageGain;

  // 2. Revisit Urgency Term (t - T_last) / T_max
  const elapsedSinceVisit = Math.max(0, currentTick - zone.lastVisitedTick);
  const normalizedUrgency = Math.min(2.5, elapsedSinceVisit / T_max);
  const termUrgency = weights.wU * normalizedUrgency;

  // 3. Static Base Risk Term R(z_i)
  const termRisk = weights.wR * zone.baseRisk;

  // 4. Incident Multiplier I(z_i)
  let incidentVal = 0;
  const zoneIncident = activeIncidents.find(inc => inc.zoneId === zone.id && inc.status !== 'cleared');
  if (zoneIncident) {
    if (zoneIncident.severity === 'critical') incidentVal = 2.4;
    else if (zoneIncident.severity === 'high') incidentVal = 1.8;
    else if (zoneIncident.severity === 'medium') incidentVal = 1.3;
    else incidentVal = 1.0;
  }
  const termIncident = weights.wA * incidentVal;

  // 5. Shortest Path Distance Cost dist(z_curr, z_i) / D_max
  const pathResult = findShortestPath(agent.currentNodeId, zone.id, adjacencyMap);
  const distCost = (pathResult.totalDistance / D_max) * weights.wDist;

  // 6. Multi-Agent Dispersion Penalty (coordination: prevent all agents bunching up on the same target)
  let coordinationPenalty = 0;
  const isTargetedByOther = otherAgents.some(
    other => other.id !== agent.id && other.targetNodeId === zone.id
  );
  if (isTargetedByOther && !zoneIncident) {
    coordinationPenalty = 1.5; // encourage taking alternate zones
  }

  // 7. Battery Penalty Term P_batt(A_k)
  let batteryPenalty = 0;
  const isLowBattery = agent.battery <= weights.wBatt;
  
  if (isLowBattery) {
    if (zone.isChargingHub) {
      // Strong pull towards charging hub when low on juice
      const deficit = (weights.wBatt - agent.battery) / weights.wBatt;
      batteryPenalty = - (4.0 + deficit * 6.0); // negative penalty = positive incentive!
    } else {
      // Severe penalty for going to non-charging zones when battery critical
      const deficit = (weights.wBatt - agent.battery) / Math.max(1, weights.wBatt);
      batteryPenalty = 5.0 + deficit * 10.0;
    }
  } else {
    // If battery is healthy (> threshold), slightly deprioritize sitting at charging hub if other zones need attention
    if (zone.isChargingHub && zone.id === agent.currentNodeId && agent.battery > 90) {
      batteryPenalty = 1.2;
    }
  }

  // Final Composite Score
  const totalScore = (
    termCoverage + 
    termUrgency + 
    termRisk + 
    termIncident - 
    distCost - 
    coordinationPenalty - 
    batteryPenalty
  );

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    totalScore: Number(totalScore.toFixed(3)),
    coverageTerm: Number(termCoverage.toFixed(3)),
    revisitTerm: Number(termUrgency.toFixed(3)),
    riskTerm: Number(termRisk.toFixed(3)),
    incidentTerm: Number(termIncident.toFixed(3)),
    distCost: Number(distCost.toFixed(3)),
    batteryPenalty: Number(batteryPenalty.toFixed(3))
  };
}

/**
 * Decide next zone for an agent under the active strategy
 */
export function decideNextTarget(
  strategy: PatrolStrategy,
  agent: Agent,
  zones: ZoneNode[],
  currentTick: number,
  weights: UtilityWeights,
  adjacencyMap: AdjacencyMap,
  maxDistance: number,
  otherAgents: Agent[],
  activeIncidents: Incident[]
): DecisionResult {
  // If agent's battery is critical (e.g. <= 15%), override to nearest charging hub immediately
  if (agent.battery <= 15 && !zones.find(z => z.id === agent.currentNodeId)?.isChargingHub) {
    const chargingHubs = zones.filter(z => z.isChargingHub);
    let nearestHub = chargingHubs[0];
    let minD = Infinity;
    for (const hub of chargingHubs) {
      const p = findShortestPath(agent.currentNodeId, hub.id, adjacencyMap);
      if (p.totalDistance < minD) {
        minD = p.totalDistance;
        nearestHub = hub;
      }
    }
    return {
      nextZoneId: nearestHub.id,
      reason: `EMERGENCY BATTERY FAILSAFE: Battery at ${Math.round(agent.battery)}% (threshold ${weights.wBatt}%). Rerouted to charging dock ${nearestHub.name}.`,
      score: 99.0,
      breakdown: {
        coverage: 0,
        urgency: 0,
        risk: 0,
        incident: 0,
        dist: 0,
        batteryPenalty: -99.0
      }
    };
  }

  // Strategy 1: UTILITY-BASED AI
  if (strategy === 'utility') {
    // Score all zones
    const scores: UtilityScoreDetail[] = zones
      .filter(z => z.id !== agent.currentNodeId || (agent.battery <= weights.wBatt && z.isChargingHub))
      .map(zone => calculateZoneUtility(
        zone,
        agent,
        currentTick,
        weights,
        adjacencyMap,
        maxDistance,
        otherAgents,
        activeIncidents
      ));

    // Sort descending by total score
    scores.sort((a, b) => b.totalScore - a.totalScore);
    const best = scores[0];

    if (!best) {
      return {
        nextZoneId: zones[0].id,
        reason: 'Fallback selection',
        score: 0
      };
    }

    const targetZone = zones.find(z => z.id === best.zoneId)!;
    const activeAlert = activeIncidents.find(i => i.zoneId === best.zoneId && i.status !== 'cleared');

    let reason = '';
    if (agent.battery <= weights.wBatt && targetZone.isChargingHub) {
      reason = `Battery low (${Math.round(agent.battery)}%). Returned to ${best.zoneName} for fast induction charging.`;
    } else if (activeAlert) {
      reason = `ALERT INTERCEPT: Prioritizing ${best.zoneName} due to active ${activeAlert.severity.toUpperCase()} incident (Utility score: ${best.totalScore}).`;
    } else if (best.revisitTerm > best.coverageTerm && best.revisitTerm > 1.2) {
      reason = `Revisit starvation elevated at ${best.zoneName} (Urgency +${best.revisitTerm}, Total score: ${best.totalScore}).`;
    } else if (best.riskTerm > 0.8) {
      reason = `High base risk profile at ${best.zoneName} prompted preventative sweep (Risk +${best.riskTerm}).`;
    } else {
      reason = `Optimal utility dispatch to ${best.zoneName} (Score: ${best.totalScore}).`;
    }

    return {
      nextZoneId: best.zoneId,
      reason,
      score: best.totalScore,
      breakdown: {
        coverage: best.coverageTerm,
        urgency: best.revisitTerm,
        risk: best.riskTerm,
        incident: best.incidentTerm,
        dist: best.distCost,
        batteryPenalty: best.batteryPenalty
      },
      scoreDetails: scores
    };
  }

  // Strategy 2: FIXED ROUTE
  if (strategy === 'fixed') {
    // Find current node index in sequence
    const currIdx = FIXED_ROUTE_SEQUENCE.indexOf(agent.currentNodeId);
    let nextIdx = (currIdx + 1) % FIXED_ROUTE_SEQUENCE.length;
    if (currIdx === -1) nextIdx = 0;
    
    const nextZoneId = FIXED_ROUTE_SEQUENCE[nextIdx];
    const targetZone = zones.find(z => z.id === nextZoneId)!;

    return {
      nextZoneId,
      reason: `FIXED PATROL: Stepping to waypoint #${nextIdx + 1} (${targetZone?.name || nextZoneId}) in deterministic route loop.`,
      score: 50.0
    };
  }

  // Strategy 3: RANDOM PATROL
  if (strategy === 'random') {
    const neighbors = adjacencyMap[agent.currentNodeId] || [];
    let nextZoneId = agent.currentNodeId;

    if (neighbors.length > 0) {
      const randomIndex = Math.floor(Math.random() * neighbors.length);
      nextZoneId = neighbors[randomIndex].to;
    } else {
      // Pick any other zone randomly
      const otherZones = zones.filter(z => z.id !== agent.currentNodeId);
      nextZoneId = otherZones[Math.floor(Math.random() * otherZones.length)].id;
    }

    const targetZone = zones.find(z => z.id === nextZoneId)!;

    return {
      nextZoneId,
      reason: `STOCHASTIC WALK: Picked random adjacent branch to ${targetZone?.name || nextZoneId}.`,
      score: 25.0
    };
  }

  return {
    nextZoneId: zones[0].id,
    reason: 'Default routing',
    score: 0
  };
}

