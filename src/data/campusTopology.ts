import { ZoneNode, GraphEdge } from '../types';

export const INITIAL_ZONES: ZoneNode[] = [
  {
    id: 'main-gate',
    code: 'GATE',
    name: 'Main Gate',
    type: 'gate',
    x: 100,
    y: 380,
    baseRisk: 0.35,
    isChargingHub: true,
    lastVisitedTick: 0,
    visitCount: 1,
    activeIncidentId: null,
    description: 'Primary university security gateway with automated barrier scanners and rapid inductive charging dock Alpha.'
  },
  {
    id: 'parking-zone',
    code: 'PKG',
    name: 'Parking Zone',
    type: 'parking',
    x: 140,
    y: 170,
    baseRisk: 0.65,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Multi-acre transit parking area. High vehicle turnover with night surveillance priority.'
  },
  {
    id: 'admission-block',
    code: 'ADM',
    name: 'Admission Block',
    type: 'academic',
    x: 230,
    y: 520,
    baseRisk: 0.3,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Central administrative concourse, visitor reception, and executive university counseling halls.'
  },
  {
    id: 'central-library',
    code: 'LIB',
    name: 'Central Library',
    type: 'library',
    x: 360,
    y: 310,
    baseRisk: 0.25,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: '9-story university central library, digital research repositories, and quiet study wings.'
  },
  {
    id: 'cse-block',
    code: 'CSE',
    name: 'CSE Block',
    type: 'academic',
    x: 480,
    y: 140,
    baseRisk: 0.4,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'School of Computer Science & Engineering, high-density server rooms, and robotics laboratories.'
  },
  {
    id: 'unihospital',
    code: 'HOSP',
    name: 'UniHospital',
    type: 'hospital',
    x: 370,
    y: 650,
    baseRisk: 0.75,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: '24/7 super-specialty campus hospital, trauma center, and emergency ambulance dispatch lane.'
  },
  {
    id: 'dsr-block',
    code: 'DSR',
    name: 'DSR Block',
    type: 'research',
    x: 620,
    y: 220,
    baseRisk: 0.6,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Division of Student Research, innovation incubation center, and rapid fabrication prototyping labs.'
  },
  {
    id: 'unipolis',
    code: 'UNIP',
    name: 'Unipolis',
    type: 'sports',
    x: 550,
    y: 440,
    baseRisk: 0.45,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Massive open-air grand amphitheater & cultural dome hosting university mega-events for 15,000+ people.'
  },
  {
    id: 'main-food-court',
    code: 'MFC',
    name: 'Main Food Court',
    type: 'substation',
    x: 740,
    y: 350,
    baseRisk: 0.5,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Multi-cuisine central campus dining hub, food kiosks, and high-density student congregation zone.'
  },
  {
    id: 'unimall',
    code: 'MALL',
    name: 'UniMall',
    type: 'gate',
    x: 820,
    y: 540,
    baseRisk: 0.55,
    isChargingHub: true,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Four-story student lifestyle mall, convenience stores, and fast-charging auxiliary depot Beta.'
  },
  {
    id: 'boys-hostels',
    code: 'BH',
    name: 'Boys Hostels',
    type: 'hostel',
    x: 940,
    y: 170,
    baseRisk: 0.55,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'Multi-block male residential towers housing over 8,000 students with dedicated athletic grounds.'
  },
  {
    id: 'girls-hostels',
    code: 'GH',
    name: 'Girls Hostels',
    type: 'hostel',
    x: 960,
    y: 390,
    baseRisk: 0.8,
    isChargingHub: false,
    lastVisitedTick: 0,
    visitCount: 0,
    activeIncidentId: null,
    description: 'High-security female residential complex with biometric turnstiles and 24/7 CCTV surveillance ring.'
  }
];

export const INITIAL_EDGES: GraphEdge[] = [
  // Western Arterial
  { id: 'e1', from: 'main-gate', to: 'parking-zone', distance: 180, type: 'arterial' },
  { id: 'e2', from: 'main-gate', to: 'admission-block', distance: 160, type: 'arterial' },
  { id: 'e3', from: 'main-gate', to: 'central-library', distance: 280, type: 'arterial' },

  // North Sector Loop
  { id: 'e4', from: 'parking-zone', to: 'cse-block', distance: 320, type: 'perimeter' },
  { id: 'e5', from: 'central-library', to: 'cse-block', distance: 190, type: 'walkway' },
  { id: 'e6', from: 'cse-block', to: 'dsr-block', distance: 170, type: 'walkway' },

  // South Medical & Admin
  { id: 'e7', from: 'admission-block', to: 'unihospital', distance: 190, type: 'arterial' },
  { id: 'e8', from: 'admission-block', to: 'central-library', distance: 210, type: 'walkway' },
  { id: 'e9', from: 'unihospital', to: 'unipolis', distance: 260, type: 'arterial' },

  // Central Hub Connections
  { id: 'e10', from: 'central-library', to: 'unipolis', distance: 210, type: 'walkway' },
  { id: 'e11', from: 'dsr-block', to: 'main-food-court', distance: 180, type: 'walkway' },
  { id: 'e12', from: 'unipolis', to: 'main-food-court', distance: 190, type: 'walkway' },

  // Eastern Residential & UniMall
  { id: 'e13', from: 'dsr-block', to: 'boys-hostels', distance: 290, type: 'perimeter' },
  { id: 'e14', from: 'boys-hostels', to: 'girls-hostels', distance: 230, type: 'perimeter' },
  { id: 'e15', from: 'main-food-court', to: 'girls-hostels', distance: 220, type: 'walkway' },
  { id: 'e16', from: 'main-food-court', to: 'unimall', distance: 170, type: 'walkway' },
  { id: 'e17', from: 'girls-hostels', to: 'unimall', distance: 190, type: 'perimeter' },
  { id: 'e18', from: 'unimall', to: 'unihospital', distance: 340, type: 'arterial' }
];

export const INITIAL_AGENTS = [
  {
    id: 'agent-1',
    name: 'Sentinel Alpha-1',
    callsign: 'S-01',
    color: '#06b6d4', // cyan
    x: 100,
    y: 380,
    currentNodeId: 'main-gate',
    targetNodeId: 'cse-block',
    plannedPath: ['main-gate', 'central-library', 'cse-block'],
    pathProgress: 0,
    speed: 3.2,
    heading: 45,
    battery: 100,
    maxBattery: 100,
    batteryDrainRate: 0.12,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  },
  {
    id: 'agent-2',
    name: 'Vanguard Bravo-2',
    callsign: 'V-02',
    color: '#3b82f6', // blue
    x: 100,
    y: 380,
    currentNodeId: 'main-gate',
    targetNodeId: 'unihospital',
    plannedPath: ['main-gate', 'admission-block', 'unihospital'],
    pathProgress: 0,
    speed: 3.0,
    heading: 135,
    battery: 95,
    maxBattery: 100,
    batteryDrainRate: 0.11,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  },
  {
    id: 'agent-3',
    name: 'Specter Charlie-3',
    callsign: 'C-03',
    color: '#a855f7', // purple
    x: 820,
    y: 540,
    currentNodeId: 'unimall',
    targetNodeId: 'girls-hostels',
    plannedPath: ['unimall', 'girls-hostels'],
    pathProgress: 0,
    speed: 3.4,
    heading: 315,
    battery: 98,
    maxBattery: 100,
    batteryDrainRate: 0.13,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  },
  {
    id: 'agent-4',
    name: 'Recon Delta-4',
    callsign: 'D-04',
    color: '#10b981', // emerald
    x: 100,
    y: 380,
    currentNodeId: 'main-gate',
    targetNodeId: 'parking-zone',
    plannedPath: ['main-gate', 'parking-zone'],
    pathProgress: 0,
    speed: 2.8,
    heading: 0,
    battery: 100,
    maxBattery: 100,
    batteryDrainRate: 0.10,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  },
  {
    id: 'agent-5',
    name: 'Titan Echo-5',
    callsign: 'E-05',
    color: '#f97316', // orange
    x: 820,
    y: 540,
    currentNodeId: 'unimall',
    targetNodeId: 'main-food-court',
    plannedPath: ['unimall', 'main-food-court'],
    pathProgress: 0,
    speed: 3.1,
    heading: 225,
    battery: 92,
    maxBattery: 100,
    batteryDrainRate: 0.12,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  },
  {
    id: 'agent-6',
    name: 'Aegis Foxtrot-6',
    callsign: 'F-06',
    color: '#ec4899', // pink
    x: 100,
    y: 380,
    currentNodeId: 'main-gate',
    targetNodeId: 'unipolis',
    plannedPath: ['main-gate', 'central-library', 'unipolis'],
    pathProgress: 0,
    speed: 3.0,
    heading: 90,
    battery: 100,
    maxBattery: 100,
    batteryDrainRate: 0.11,
    status: 'patrolling' as const,
    trail: [],
    totalDistance: 0,
    totalSteps: 0,
    incidentsCleared: 0,
    lastDecisionTick: 0
  }
];

export const FIXED_ROUTE_SEQUENCE: string[] = [
  'main-gate',
  'parking-zone',
  'cse-block',
  'dsr-block',
  'boys-hostels',
  'girls-hostels',
  'unimall',
  'main-food-court',
  'unipolis',
  'unihospital',
  'admission-block',
  'central-library',
  'main-gate'
];

export const INCIDENT_TEMPLATES = [
  {
    title: 'Perimeter Turnstile Breach Detected',
    severity: 'critical' as const,
    description: 'Unauthorized access gate pushed without verified student RFID badge swipe.',
    recommendedZones: ['girls-hostels', 'boys-hostels', 'parking-zone']
  },
  {
    title: 'Emergency Medical SOS Activated',
    severity: 'critical' as const,
    description: 'Student emergency blue-light telephone kiosk pressed. Immediate dispatch required.',
    recommendedZones: ['unihospital', 'unipolis', 'main-food-court']
  },
  {
    title: 'Unattended Delivery Package Alert',
    severity: 'medium' as const,
    description: 'Autonomous AI optical sensor flagged an unattended crate in common thoroughfare.',
    recommendedZones: ['main-food-court', 'unimall', 'central-library']
  },
  {
    title: 'Late-Night Loitering Detection',
    severity: 'low' as const,
    description: 'Thermal camera tracking gathering past curfew hours.',
    recommendedZones: ['parking-zone', 'unipolis', 'admission-block']
  },
  {
    title: 'Server Room Climate Alarm',
    severity: 'high' as const,
    description: 'Emergency HVAC trip in datacenter corridor; inspection required.',
    recommendedZones: ['cse-block', 'dsr-block', 'central-library']
  },
  {
    title: 'Fire Escape Door Tamper',
    severity: 'high' as const,
    description: 'Rear emergency push-bar triggered in public concourse.',
    recommendedZones: ['unimall', 'unihospital', 'main-gate']
  }
];
