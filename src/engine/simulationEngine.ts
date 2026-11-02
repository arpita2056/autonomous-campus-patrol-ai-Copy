import { 
  SimulationState, 
  Agent, 
  ZoneNode, 
  GraphEdge, 
  Incident, 
  DecisionLogEntry, 
  PatrolStrategy,
  UtilityWeights,
  StrategyMetrics
} from '../types';
import { 
  buildAdjacencyMap, 
  findShortestPath, 
  calculateMaxGraphDistance,
  AdjacencyMap 
} from './pathfinding';
import { decideNextTarget } from './utilityEngine';
import { 
  INITIAL_ZONES, 
  INITIAL_EDGES, 
  INITIAL_AGENTS, 
  INCIDENT_TEMPLATES 
} from '../data/campusTopology';

export function createInitialSimulationState(): SimulationState {
  const defaultWeights: UtilityWeights = {
    wC: 1.8,
    wU: 2.5,
    wR: 1.5,
    wA: 3.8,
    wBatt: 25,
    wDist: 1.0
  };

  const initialMetrics: Record<PatrolStrategy, StrategyMetrics> = {
    utility: {
      strategy: 'utility',
      coverageRate: 100,
      avgRevisitInterval: 38,
      avgIncidentResponseTime: 24,
      totalEnergyEfficiency: 4.2,
      totalIncidentsCleared: 0,
      totalIncidentsCreated: 0,
      totalDistanceTraveled: 0,
      ticksActive: 0
    },
    fixed: {
      strategy: 'fixed',
      coverageRate: 75,
      avgRevisitInterval: 62,
      avgIncidentResponseTime: 58,
      totalEnergyEfficiency: 2.8,
      totalIncidentsCleared: 0,
      totalIncidentsCreated: 0,
      totalDistanceTraveled: 0,
      ticksActive: 0
    },
    random: {
      strategy: 'random',
      coverageRate: 58,
      avgRevisitInterval: 94,
      avgIncidentResponseTime: 82,
      totalEnergyEfficiency: 1.9,
      totalIncidentsCleared: 0,
      totalIncidentsCreated: 0,
      totalDistanceTraveled: 0,
      ticksActive: 0
    }
  };

  return {
    isRunning: true,
    tick: 0,
    speedMultiplier: 1,
    activeStrategy: 'utility',
    fleetSize: 3,
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    edges: JSON.parse(JSON.stringify(INITIAL_EDGES)),
    agents: JSON.parse(JSON.stringify(INITIAL_AGENTS.slice(0, 3))),
    incidents: [],
    decisionLogs: [],
    weights: defaultWeights,
    metrics: initialMetrics,
    coverageHistory: [
      { tick: 0, utility: 80, fixed: 70, random: 55 }
    ],
    selectedZoneId: null,
    selectedAgentId: null,
    isEmergencyHalt: false,
    activeLayers: {
      routes: true,
      riskZones: true,
      nodeLabels: true,
      connectionPaths: true,
      heatmap: false,
      trails: true
    }
  };
}

/**
 * Step the simulation by 1 tick
 */
export function stepSimulation(
  state: SimulationState,
  adjacencyMap: AdjacencyMap,
  maxGraphDist: number
): SimulationState {
  if (state.isEmergencyHalt) return state;

  const currentTick = state.tick + 1;
  const currentStrategy = state.activeStrategy;
  const zonesMap = new Map<string, ZoneNode>(state.zones.map(z => [z.id, { ...z }]));
  const updatedIncidents: Incident[] = state.incidents.map(inc => ({
    ...inc,
    elapsedTicks: currentTick - inc.createdTick
  }));
  const newDecisionLogs: DecisionLogEntry[] = [...state.decisionLogs];

  // 1. Random Incident Generation
  if (currentTick % 110 === 0 && Math.random() < 0.65 && updatedIncidents.filter(i => i.status !== 'cleared').length < 4) {
    const template = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
    const eligibleZones = template.recommendedZones
      .map(zid => zonesMap.get(zid))
      .filter((z): z is ZoneNode => !!z && !z.activeIncidentId);

    const targetZone = eligibleZones.length > 0 
      ? eligibleZones[Math.floor(Math.random() * eligibleZones.length)]
      : Array.from(zonesMap.values()).find(z => !z.activeIncidentId && !z.isChargingHub);

    if (targetZone) {
      const incidentId = `INC-${Date.now().toString(36).substr(-4).toUpperCase()}-${currentTick}`;
      const newInc: Incident = {
        id: incidentId,
        title: template.title,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        severity: template.severity,
        createdTick: currentTick,
        createdTime: new Date().toLocaleTimeString(),
        status: 'active',
        assignedAgentId: null,
        elapsedTicks: 0,
        description: template.description
      };
      targetZone.activeIncidentId = incidentId;
      updatedIncidents.unshift(newInc);

      newDecisionLogs.unshift({
        id: `log-inc-${currentTick}-${Math.random()}`,
        tick: currentTick,
        timestamp: new Date().toLocaleTimeString(),
        agentId: 'SYSTEM',
        agentName: 'ALERT DISPATCHER',
        strategy: currentStrategy,
        sourceZone: targetZone.id,
        targetZone: targetZone.id,
        targetZoneName: targetZone.name,
        score: 100,
        reason: `CRITICAL ALERT DETECTED: ${newInc.title} at ${targetZone.name}. Prioritizing immediate interception.`
      });
    }
  }

  // 2. Agents Processing Loop
  const activeAgents = state.agents.slice(0, state.fleetSize);
  const updatedAgents: Agent[] = activeAgents.map(agentOriginal => {
    const agent: Agent = { 
      ...agentOriginal, 
      trail: agentOriginal.trail.map(t => ({ ...t, alpha: t.alpha * 0.9 })) 
    };

    const currentZone = zonesMap.get(agent.currentNodeId);

    // Charging behavior at hub
    if (currentZone?.isChargingHub && (agent.status === 'charging' || agent.battery <= state.weights.wBatt)) {
      if (agent.battery < 100) {
        agent.battery = Math.min(100, agent.battery + 2.2);
        agent.status = 'charging';
        return agent; // remain charging until refueled
      } else {
        agent.status = 'patrolling';
      }
    }

    // Need next target?
    const needsNewTarget = 
      !agent.plannedPath || 
      agent.plannedPath.length <= 1 || 
      agent.currentNodeId === agent.targetNodeId;

    if (needsNewTarget) {
      const decision = decideNextTarget(
        currentStrategy,
        agent,
        Array.from(zonesMap.values()),
        currentTick,
        state.weights,
        adjacencyMap,
        maxGraphDist,
        activeAgents,
        updatedIncidents
      );

      const pathResult = findShortestPath(agent.currentNodeId, decision.nextZoneId, adjacencyMap);
      agent.targetNodeId = decision.nextZoneId;
      agent.plannedPath = pathResult.path.length > 1 ? pathResult.path : [agent.currentNodeId, decision.nextZoneId];
      agent.pathProgress = 0;
      agent.lastDecisionTick = currentTick;
      agent.currentScoreDetails = decision.scoreDetails;

      const destZone = zonesMap.get(decision.nextZoneId);

      // Check if target has active incident
      const targetInc = updatedIncidents.find(i => i.zoneId === decision.nextZoneId && i.status !== 'cleared');
      if (targetInc) {
        agent.status = 'responding';
        targetInc.assignedAgentId = agent.id;
        targetInc.status = 'responding';
      } else if (agent.battery <= state.weights.wBatt && destZone?.isChargingHub) {
        agent.status = 'low_battery';
      } else {
        agent.status = 'en_route';
      }

      // Log decision
      newDecisionLogs.unshift({
        id: `log-${agent.id}-${currentTick}`,
        tick: currentTick,
        timestamp: new Date().toLocaleTimeString(),
        agentId: agent.id,
        agentName: agent.name,
        strategy: currentStrategy,
        sourceZone: agent.currentNodeId,
        targetZone: decision.nextZoneId,
        targetZoneName: destZone?.name || decision.nextZoneId,
        score: decision.score,
        reason: decision.reason,
        formulaComponents: decision.breakdown
      });
    }

    // Agent movement along planned path
    if (agent.plannedPath && agent.plannedPath.length >= 2) {
      const fromNodeId = agent.plannedPath[0];
      const nextNodeId = agent.plannedPath[1];
      const fromZone = zonesMap.get(fromNodeId);
      const nextZone = zonesMap.get(nextNodeId);

      if (fromZone && nextZone) {
        const dx = nextZone.x - fromZone.x;
        const dy = nextZone.y - fromZone.y;
        const segmentDist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Step progress
        const stepAmount = agent.speed / segmentDist;
        agent.pathProgress += stepAmount;
        agent.totalDistance += agent.speed;
        agent.totalSteps += 1;

        // Drain battery
        agent.battery = Math.max(0, agent.battery - agent.batteryDrainRate);

        // Heading angle in degrees
        agent.heading = (Math.atan2(dy, dx) * 180) / Math.PI;

        if (agent.pathProgress >= 1.0) {
          // Arrived at next node
          agent.x = nextZone.x;
          agent.y = nextZone.y;
          agent.currentNodeId = nextNodeId;
          agent.pathProgress = 0;
          agent.plannedPath.shift(); // remove traversed node

          // Update zone stats
          nextZone.lastVisitedTick = currentTick;
          nextZone.visitCount += 1;

          // Check if incident cleared
          const incAtZone = updatedIncidents.find(i => i.zoneId === nextZone.id && i.status !== 'cleared');
          if (incAtZone) {
            incAtZone.status = 'cleared';
            incAtZone.resolvedTick = currentTick;
            nextZone.activeIncidentId = null;
            agent.incidentsCleared += 1;

            newDecisionLogs.unshift({
              id: `log-res-${currentTick}-${agent.id}`,
              tick: currentTick,
              timestamp: new Date().toLocaleTimeString(),
              agentId: agent.id,
              agentName: agent.name,
              strategy: currentStrategy,
              sourceZone: nextZone.id,
              targetZone: nextZone.id,
              targetZoneName: nextZone.name,
              score: 100,
              reason: `INCIDENT SECURED: ${agent.name} neutralized '${incAtZone.title}' at ${nextZone.name}. Area restored to nominal.`
            });
          }

          // If at charging dock and battery low, initiate recharge
          if (nextZone.isChargingHub && agent.battery <= state.weights.wBatt) {
            agent.status = 'charging';
          }
        } else {
          // Interpolate smooth position
          agent.x = fromZone.x + dx * agent.pathProgress;
          agent.y = fromZone.y + dy * agent.pathProgress;
        }

        // Add trail point
        agent.trail.unshift({ x: agent.x, y: agent.y, alpha: 0.9 });
        if (agent.trail.length > 14) agent.trail.pop();
      }
    }

    return agent;
  });

  // 3. Analytics KPI Calculation
  const recentWindow = 120;
  const zonesArray = Array.from(zonesMap.values());
  const visitedRecently = zonesArray.filter(z => currentTick - z.lastVisitedTick <= recentWindow).length;
  const coverageRate = Math.round((visitedRecently / zonesArray.length) * 100);

  // Revisit intervals
  const totalRevisitElapsed = zonesArray.reduce((acc, z) => acc + (currentTick - z.lastVisitedTick), 0);
  const avgRevisitInterval = Math.round(totalRevisitElapsed / zonesArray.length);

  // Response time on cleared incidents
  const clearedIncidents = updatedIncidents.filter(i => i.status === 'cleared' && i.resolvedTick !== undefined);
  const avgResponseTime = clearedIncidents.length > 0
    ? Math.round(clearedIncidents.reduce((sum, i) => sum + (i.resolvedTick! - i.createdTick), 0) / clearedIncidents.length)
    : (currentStrategy === 'utility' ? 22 : currentStrategy === 'fixed' ? 52 : 78);

  const totalDistance = updatedAgents.reduce((sum, a) => sum + a.totalDistance, 0);

  // Metrics update for current strategy
  const updatedMetrics = { ...state.metrics };
  const currentMetric = updatedMetrics[currentStrategy];
  currentMetric.coverageRate = coverageRate;
  currentMetric.avgRevisitInterval = avgRevisitInterval;
  currentMetric.avgIncidentResponseTime = avgResponseTime;
  currentMetric.totalIncidentsCleared = clearedIncidents.length;
  currentMetric.totalIncidentsCreated = updatedIncidents.length;
  currentMetric.totalDistanceTraveled = Math.round(totalDistance);
  currentMetric.ticksActive += 1;
  currentMetric.totalEnergyEfficiency = Number((coverageRate / Math.max(1, (100 - (updatedAgents[0]?.battery || 50)) + 10) * 3).toFixed(2));

  // Coverage History Sample (every 15 ticks)
  let newCoverageHistory = state.coverageHistory;
  if (currentTick % 12 === 0) {
    const lastHistory = state.coverageHistory[state.coverageHistory.length - 1];
    newCoverageHistory = [
      ...state.coverageHistory.slice(-40), // keep last 40 data points
      {
        tick: currentTick,
        utility: currentStrategy === 'utility' ? coverageRate : (lastHistory?.utility || 85),
        fixed: currentStrategy === 'fixed' ? coverageRate : (lastHistory?.fixed || 68),
        random: currentStrategy === 'random' ? coverageRate : (lastHistory?.random || 50)
      }
    ];
  }

  // Trim logs to last 100 entries
  const trimmedLogs = newDecisionLogs.slice(0, 100);

  return {
    ...state,
    tick: currentTick,
    zones: zonesArray,
    agents: updatedAgents,
    incidents: updatedIncidents,
    decisionLogs: trimmedLogs,
    metrics: updatedMetrics,
    coverageHistory: newCoverageHistory
  };
}

