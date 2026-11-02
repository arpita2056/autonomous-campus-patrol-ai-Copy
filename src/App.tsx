import React, { useState, useEffect, useMemo } from 'react';
import { 
  SimulationState, 
  PatrolStrategy, 
  UtilityWeights 
} from './types';
import { 
  createInitialSimulationState, 
  stepSimulation 
} from './engine/simulationEngine';
import { 
  buildAdjacencyMap, 
  calculateMaxGraphDistance, 
  findShortestPath 
} from './engine/pathfinding';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { StrategyControlPanel } from './components/StrategyControlPanel';
import { FleetTelemetryPanel } from './components/FleetTelemetryPanel';
import { IncidentAndLogPanel } from './components/IncidentAndLogPanel';
import { AnalyticsBenchmarkSuite } from './components/AnalyticsBenchmarkSuite';
import { ZoneDetailsModal } from './components/ZoneDetailsModal';
import { DroneCameraModal } from './components/DroneCameraModal';
import { INCIDENT_TEMPLATES, INITIAL_AGENTS } from './data/campusTopology';
import { ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { soundFX } from './utils/audio';

export function App() {
  const [simState, setSimState] = useState<SimulationState>(() => createInitialSimulationState());
  const [activeView, setActiveView] = useState<'ops' | 'analytics'>('ops');
  const [inspectZoneId, setInspectZoneId] = useState<string | null>(null);
  const [droneCameraAgentId, setDroneCameraAgentId] = useState<string | null>(null);

  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    soundFX.playClick();
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Cached adjacency graph and max campus distance
  const adjacencyMap = useMemo(() => buildAdjacencyMap(simState.edges), [simState.edges]);
  const maxGraphDistance = useMemo(() => calculateMaxGraphDistance(simState.zones, adjacencyMap), [simState.zones, adjacencyMap]);

  // Faster simulation tick loop: down to 5ms at 20x speed
  useEffect(() => {
    if (!simState.isRunning || simState.isEmergencyHalt) return;

    const intervalMs = Math.max(5, Math.floor(80 / simState.speedMultiplier));

    const timer = setInterval(() => {
      setSimState(prev => stepSimulation(prev, adjacencyMap, maxGraphDistance));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simState.isRunning, simState.isEmergencyHalt, simState.speedMultiplier, adjacencyMap, maxGraphDistance]);

  // Actions
  const handleTogglePlayPause = () => {
    soundFX.playClick();
    setSimState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleSingleStep = () => {
    soundFX.playClick();
    setSimState(prev => stepSimulation(prev, adjacencyMap, maxGraphDistance));
  };

  const handleToggleHalt = () => {
    soundFX.playAlert();
    setSimState(prev => ({
      ...prev,
      isEmergencyHalt: !prev.isEmergencyHalt,
      isRunning: prev.isEmergencyHalt ? true : false
    }));
  };

  const handleReset = () => {
    soundFX.playClick();
    setSimState(createInitialSimulationState());
  };

  const handleSelectStrategy = (strat: PatrolStrategy) => {
    soundFX.playDispatch();
    setSimState(prev => ({
      ...prev,
      activeStrategy: strat,
      decisionLogs: [
        {
          id: `log-strat-change-${Date.now()}`,
          tick: prev.tick,
          timestamp: new Date().toLocaleTimeString(),
          agentId: 'SYSTEM',
          agentName: 'LPU PATROL COMMAND',
          strategy: strat,
          sourceZone: 'HQ',
          targetZone: 'LPU-CAMPUS',
          targetZoneName: 'All University Sectors',
          score: 100,
          reason: `Fleet patrol doctrine reconfigured to: ${strat.toUpperCase()}. Swarm rerouting initiated.`
        },
        ...prev.decisionLogs
      ]
    }));
  };

  const handleSetFleetSize = (size: number) => {
    soundFX.playClick();
    setSimState(prev => {
      let newAgents = [...prev.agents];
      if (size > newAgents.length) {
        newAgents = INITIAL_AGENTS.slice(0, size);
      }
      return {
        ...prev,
        fleetSize: size,
        agents: newAgents
      };
    });
  };

  const handleUpdateWeights = (newWeights: Partial<UtilityWeights>) => {
    setSimState(prev => ({
      ...prev,
      weights: { ...prev.weights, ...newWeights }
    }));
  };

  const handleResetDefaultWeights = () => {
    soundFX.playClick();
    setSimState(prev => ({
      ...prev,
      weights: {
        wC: 1.8,
        wU: 2.5,
        wR: 1.5,
        wA: 3.8,
        wBatt: 25,
        wDist: 1.0
      }
    }));
  };

  const handleToggleLayer = (layer: keyof SimulationState['activeLayers']) => {
    soundFX.playClick();
    setSimState(prev => ({
      ...prev,
      activeLayers: {
        ...prev.activeLayers,
        [layer]: !prev.activeLayers[layer]
      }
    }));
  };

  const handleSetSpeed = (speed: number) => {
    setSimState(prev => ({ ...prev, speedMultiplier: speed }));
  };

  const handleTriggerAlert = () => {
    soundFX.playAlert();
    setSimState(prev => {
      const template = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
      const availableZones = prev.zones.filter(z => !z.activeIncidentId && !z.isChargingHub);
      const targetZone = availableZones[Math.floor(Math.random() * availableZones.length)] || prev.zones[1];

      const incId = `INC-${Date.now().toString(36).substr(-4).toUpperCase()}-${prev.tick}`;
      const newInc = {
        id: incId,
        title: template.title,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        severity: template.severity,
        createdTick: prev.tick,
        createdTime: new Date().toLocaleTimeString(),
        status: 'active' as const,
        assignedAgentId: null,
        elapsedTicks: 0,
        description: template.description
      };

      const updatedZones = prev.zones.map(z => z.id === targetZone.id ? { ...z, activeIncidentId: incId } : z);

      return {
        ...prev,
        zones: updatedZones,
        incidents: [newInc, ...prev.incidents],
        decisionLogs: [
          {
            id: `log-manual-${Date.now()}`,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString(),
            agentId: 'OPERATOR',
            agentName: 'LPU SECURITY',
            strategy: prev.activeStrategy,
            sourceZone: targetZone.id,
            targetZone: targetZone.id,
            targetZoneName: targetZone.name,
            score: 100,
            reason: `SIMULATION INCIDENT DETECTED: '${newInc.title}' at ${targetZone.name}. Autonomous agents responding.`
          },
          ...prev.decisionLogs
        ]
      };
    });
  };

  const handleClearIncident = (incidentId: string) => {
    soundFX.playResolved();
    setSimState(prev => {
      const inc = prev.incidents.find(i => i.id === incidentId);
      if (!inc) return prev;

      return {
        ...prev,
        zones: prev.zones.map(z => z.id === inc.zoneId ? { ...z, activeIncidentId: null } : z),
        incidents: prev.incidents.map(i => i.id === incidentId ? { ...i, status: 'cleared', resolvedTick: prev.tick } : i),
        decisionLogs: [
          {
            id: `log-cleared-${Date.now()}`,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString(),
            agentId: 'COMMAND',
            agentName: 'MANUAL CLEAR',
            strategy: prev.activeStrategy,
            sourceZone: inc.zoneId,
            targetZone: inc.zoneId,
            targetZoneName: inc.zoneName,
            score: 100,
            reason: `INCIDENT RESOLVED: Alert '${inc.title}' neutralized and cleared by operator.`
          },
          ...prev.decisionLogs
        ]
      };
    });
  };

  const handleDispatchAgentToZone = (agentId: string, zoneId: string) => {
    soundFX.playDispatch();
    setSimState(prev => {
      const targetZone = prev.zones.find(z => z.id === zoneId);
      if (!targetZone) return prev;

      const pathRes = findShortestPath(
        prev.agents.find(a => a.id === agentId)?.currentNodeId || prev.zones[0].id,
        zoneId,
        adjacencyMap
      );

      const updatedAgents = prev.agents.map(agent => {
        if (agent.id === agentId) {
          return {
            ...agent,
            targetNodeId: zoneId,
            plannedPath: pathRes.path,
            pathProgress: 0,
            status: targetZone.activeIncidentId ? ('responding' as const) : ('en_route' as const)
          };
        }
        return agent;
      });

      return {
        ...prev,
        agents: updatedAgents,
        decisionLogs: [
          {
            id: `log-dispatch-${Date.now()}`,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString(),
            agentId,
            agentName: prev.agents.find(a => a.id === agentId)?.name || agentId,
            strategy: prev.activeStrategy,
            sourceZone: prev.agents.find(a => a.id === agentId)?.currentNodeId || '',
            targetZone: zoneId,
            targetZoneName: targetZone.name,
            score: 95,
            reason: `DIRECT DISPATCH: Unit rerouted to ${targetZone.name}. Shortest path active.`
          },
          ...prev.decisionLogs
        ]
      };
    });
  };

  const handleTriggerZoneIncident = (zoneId: string) => {
    soundFX.playAlert();
    setSimState(prev => {
      const targetZone = prev.zones.find(z => z.id === zoneId);
      if (!targetZone) return prev;

      const template = INCIDENT_TEMPLATES[0];
      const incId = `INC-${Date.now().toString(36).substr(-4).toUpperCase()}-${prev.tick}`;
      const newInc = {
        id: incId,
        title: template.title,
        zoneId: targetZone.id,
        zoneName: targetZone.name,
        severity: 'high' as const,
        createdTick: prev.tick,
        createdTime: new Date().toLocaleTimeString(),
        status: 'active' as const,
        assignedAgentId: null,
        elapsedTicks: 0,
        description: template.description
      };

      return {
        ...prev,
        zones: prev.zones.map(z => z.id === zoneId ? { ...z, activeIncidentId: incId } : z),
        incidents: [newInc, ...prev.incidents]
      };
    });
  };

  const handleReturnToDock = (agentId: string) => {
    handleDispatchAgentToZone(agentId, 'main-gate');
  };

  const inspectedZone = simState.zones.find(z => z.id === inspectZoneId) || null;
  const activeAlertsCount = simState.incidents.filter(i => i.status !== 'cleared').length;
  const activeCameraAgent = simState.agents.find(a => a.id === droneCameraAgentId) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Global Navigation Header */}
      <Header
        isRunning={simState.isRunning}
        isEmergencyHalt={simState.isEmergencyHalt}
        tick={simState.tick}
        activeStrategy={simState.activeStrategy}
        activeView={activeView}
        onToggleHalt={handleToggleHalt}
        onReset={handleReset}
        onTriggerAlert={handleTriggerAlert}
        onViewChange={setActiveView}
        fleetCount={simState.fleetSize}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Live Campus Security Ticker Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-cyan-500/10 to-blue-600/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-cyan-950/40 border-b border-slate-200 dark:border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              LOVELY PROFESSIONAL UNIVERSITY // GT ROAD CAMPUS:
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {activeAlertsCount > 0 
                ? `Active Security Incidents Detected (${activeAlertsCount} Unresolved)` 
                : 'All 12 Sectors, Hostels & Unipolis Operating Nominally'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-600 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SLA Coverage: <strong>{simState.metrics[simState.activeStrategy].coverageRate}%</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Engine: <strong>{simState.activeStrategy.toUpperCase()}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => setDroneCameraAgentId(simState.agents[0].id)}
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Launch Drone POV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-[1780px] w-full mx-auto flex flex-col gap-5">
        {activeView === 'ops' ? (
          <>
            {/* Split Command Workspace: Center/Left Map Canvas & Right Sidebar Strategy Controls */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Center / Left: Interactive Schematic Map & Canvas */}
              <div className="xl:col-span-8 min-h-[660px] flex flex-col">
                <MapCanvas
                  zones={simState.zones}
                  edges={simState.edges}
                  agents={simState.agents.slice(0, simState.fleetSize)}
                  incidents={simState.incidents}
                  currentTick={simState.tick}
                  activeLayers={simState.activeLayers}
                  onToggleLayer={handleToggleLayer}
                  speedMultiplier={simState.speedMultiplier}
                  onSetSpeed={handleSetSpeed}
                  selectedZoneId={simState.selectedZoneId}
                  onSelectZone={(zid) => {
                    setSimState(prev => ({ ...prev, selectedZoneId: zid }));
                    if (zid) setInspectZoneId(zid);
                  }}
                  selectedAgentId={simState.selectedAgentId}
                  onSelectAgent={(aid) => {
                    setSimState(prev => ({ ...prev, selectedAgentId: aid }));
                  }}
                  onOpenDroneCamera={(aid) => setDroneCameraAgentId(aid)}
                  theme={theme}
                />
              </div>

              {/* Right Sidebar: Strategy & AI Weight Tuning Control Panel */}
              <div className="xl:col-span-4 flex flex-col">
                <StrategyControlPanel
                  isRunning={simState.isRunning && !simState.isEmergencyHalt}
                  onTogglePlayPause={handleTogglePlayPause}
                  onSingleStep={handleSingleStep}
                  activeStrategy={simState.activeStrategy}
                  onSelectStrategy={handleSelectStrategy}
                  fleetSize={simState.fleetSize}
                  onSetFleetSize={handleSetFleetSize}
                  weights={simState.weights}
                  onUpdateWeights={handleUpdateWeights}
                  onResetDefaultWeights={handleResetDefaultWeights}
                  theme={theme}
                />
              </div>
            </div>

            {/* Fleet Health & Telemetry Panel */}
            <FleetTelemetryPanel
              agents={simState.agents.slice(0, simState.fleetSize)}
              zones={simState.zones}
              selectedAgentId={simState.selectedAgentId}
              onSelectAgent={(aid) => {
                setSimState(prev => ({ ...prev, selectedAgentId: aid }));
                setDroneCameraAgentId(aid);
              }}
              theme={theme}
            />

            {/* Incident Management & Real-Time Autonomous Decision Stream */}
            <IncidentAndLogPanel
              incidents={simState.incidents}
              decisionLogs={simState.decisionLogs}
              onAcknowledgeIncident={() => {}}
              onClearIncident={handleClearIncident}
              onSelectZone={(zid) => {
                setSimState(prev => ({ ...prev, selectedZoneId: zid }));
                setInspectZoneId(zid);
              }}
              theme={theme}
            />
          </>
        ) : (
          /* Dedicated Secondary View: Analytics & Benchmarking Dashboard */
          <AnalyticsBenchmarkSuite
            metrics={simState.metrics}
            coverageHistory={simState.coverageHistory}
            activeStrategy={simState.activeStrategy}
            onSelectStrategy={handleSelectStrategy}
            zones={simState.zones}
            incidents={simState.incidents}
            theme={theme}
          />
        )}
      </main>

      {/* Drone Live Optical POV Modal */}
      <DroneCameraModal
        agent={activeCameraAgent}
        zones={simState.zones}
        incidents={simState.incidents}
        onClose={() => setDroneCameraAgentId(null)}
        onSoundAlarm={() => {}}
        onReturnToDock={handleReturnToDock}
      />

      {/* Zone Details & Manual Dispatch Modal */}
      <ZoneDetailsModal
        zone={inspectedZone}
        onClose={() => setInspectZoneId(null)}
        currentTick={simState.tick}
        agents={simState.agents.slice(0, simState.fleetSize)}
        incidents={simState.incidents}
        onDispatchAgent={handleDispatchAgentToZone}
        onTriggerZoneIncident={handleTriggerZoneIncident}
        theme={theme}
      />

      {/* Tactical / Consumer Campus Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a12] py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-800 dark:text-slate-200">AEGIS-PATROL</span>
          <span>• LPU Campus Autonomous Surveillance Command</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span>GT Road Phagwara</span>
          <span>•</span>
          <span>Unipolis Dome Active</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Drone Swarm Airborne</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
