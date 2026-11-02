export type ZoneType = 
  | 'gate' 
  | 'hostel' 
  | 'hospital' 
  | 'academic' 
  | 'parking' 
  | 'library' 
  | 'research' 
  | 'substation' 
  | 'sports';

export interface ZoneNode {
  id: string;
  code: string;
  name: string;
  type: ZoneType;
  x: number; // Campus X coordinate (0 - 1000)
  y: number; // Campus Y coordinate (0 - 650)
  baseRisk: number; // 0.0 to 1.0 (static security rating)
  isChargingHub?: boolean; // Can agents recharge here (e.g. Main Gate, Solar Substation)
  lastVisitedTick: number; // Simulation tick of last scan
  visitCount: number;
  activeIncidentId: string | null;
  description: string;
}

export interface GraphEdge {
  id: string;
  from: string; // Zone ID
  to: string; // Zone ID
  distance: number; // Edge length / travel cost
  type: 'arterial' | 'perimeter' | 'walkway' | 'loop';
}

export type AgentStatus = 
  | 'patrolling' 
  | 'en_route' 
  | 'responding' 
  | 'charging' 
  | 'low_battery' 
  | 'docked';

export interface UtilityScoreDetail {
  zoneId: string;
  zoneName: string;
  totalScore: number;
  coverageTerm: number;
  revisitTerm: number;
  riskTerm: number;
  incidentTerm: number;
  distCost: number;
  batteryPenalty: number;
}

export interface Agent {
  id: string;
  name: string;
  callsign: string;
  color: string;
  x: number;
  y: number;
  currentNodeId: string;
  targetNodeId: string;
  plannedPath: string[]; // sequence of zone IDs
  pathProgress: number; // 0 to 1 along current segment
  speed: number; // units per tick
  heading: number; // angle in degrees
  battery: number; // 0 to 100%
  maxBattery: number;
  batteryDrainRate: number; // % per move tick
  status: AgentStatus;
  trail: Array<{ x: number; y: number; alpha: number }>;
  totalDistance: number;
  totalSteps: number;
  incidentsCleared: number;
  lastDecisionTick: number;
  currentScoreDetails?: UtilityScoreDetail[];
}

export type PatrolStrategy = 'utility' | 'fixed' | 'random';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Incident {
  id: string;
  title: string;
  zoneId: string;
  zoneName: string;
  severity: IncidentSeverity;
  createdTick: number;
  createdTime: string;
  status: 'active' | 'responding' | 'cleared';
  assignedAgentId: string | null;
  resolvedTick?: number;
  elapsedTicks: number;
  description: string;
}

export interface UtilityWeights {
  wC: number; // Coverage weight (w1)
  wU: number; // Revisit urgency weight (w2)
  wR: number; // Incident risk weight (w3)
  wA: number; // Emergency alert priority weight (w4)
  wBatt: number; // Battery return threshold (% 15-40)
  wDist: number; // Distance penalty weight
}

export interface DecisionLogEntry {
  id: string;
  tick: number;
  timestamp: string;
  agentId: string;
  agentName: string;
  strategy: PatrolStrategy;
  sourceZone: string;
  targetZone: string;
  targetZoneName: string;
  score: number;
  reason: string;
  formulaComponents?: {
    coverage: number;
    urgency: number;
    risk: number;
    incident: number;
    dist: number;
    batteryPenalty: number;
  };
}

export interface StrategyMetrics {
  strategy: PatrolStrategy;
  coverageRate: number; // % of zones patrolled within recent window
  avgRevisitInterval: number; // average ticks between visits
  avgIncidentResponseTime: number; // ticks from creation to agent arrival
  totalEnergyEfficiency: number; // coverage points achieved per 100% battery drained
  totalIncidentsCleared: number;
  totalIncidentsCreated: number;
  totalDistanceTraveled: number;
  ticksActive: number;
}

export interface SimulationState {
  isRunning: boolean;
  tick: number;
  speedMultiplier: number;
  activeStrategy: PatrolStrategy;
  agents: Agent[];
  fleetSize: number;
  zones: ZoneNode[];
  edges: GraphEdge[];
  incidents: Incident[];
  decisionLogs: DecisionLogEntry[];
  weights: UtilityWeights;
  metrics: Record<PatrolStrategy, StrategyMetrics>;
  coverageHistory: Array<{
    tick: number;
    utility: number;
    fixed: number;
    random: number;
  }>;
  selectedZoneId: string | null;
  selectedAgentId: string | null;
  isEmergencyHalt: boolean;
  activeLayers: {
    routes: boolean;
    riskZones: boolean;
    nodeLabels: boolean;
    connectionPaths: boolean;
    heatmap: boolean;
    trails: boolean;
  };
}

