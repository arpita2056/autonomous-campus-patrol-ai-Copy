import React from 'react';
import { Agent, ZoneNode } from '../types';
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  ArrowRight, 
  Activity, 
  ShieldCheck,
  Navigation2
} from 'lucide-react';

interface FleetTelemetryPanelProps {
  agents: Agent[];
  zones: ZoneNode[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  theme?: 'dark' | 'light';
}

export const FleetTelemetryPanel: React.FC<FleetTelemetryPanelProps> = ({
  agents,
  zones,
  selectedAgentId,
  onSelectAgent
}) => {
  const getZoneName = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : zoneId;
  };

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'patrolling':
        return { label: 'Patrolling Area', color: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700' };
      case 'en_route':
        return { label: 'En Route to Target', color: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700' };
      case 'responding':
        return { label: '🚨 Intercepting Alert', color: 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse' };
      case 'charging':
        return { label: '⚡ Fast Recharging', color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' };
      case 'low_battery':
        return { label: 'Low Battery (Returning)', color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' };
      default:
        return { label: 'Docked at Station', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-2xl flex flex-col gap-4 font-sans transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            CAMPUS PATROL FLEET TELEMETRY
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-agent battery health, kinetic positioning, and mission logs
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
          {agents.length} Units Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => {
          const isSelected = selectedAgentId === agent.id;
          const statusInfo = getStatusBadge(agent.status);
          const currName = getZoneName(agent.currentNodeId);
          const targetName = getZoneName(agent.targetNodeId);

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(isSelected ? null : agent.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative bg-slate-50/70 dark:bg-[#0f172a] hover:shadow-lg ${
                isSelected 
                  ? 'border-cyan-500 shadow-md ring-2 ring-cyan-500/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card Header: Unit ID, Callout & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-sm"
                    style={{ backgroundColor: agent.color }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {agent.name}
                    </h4>
                    <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                      ID: {agent.callsign}
                    </span>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>

              {/* Battery Meter */}
              <div className="mb-3.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    {agent.status === 'charging' ? (
                      <BatteryCharging className="w-4 h-4 text-emerald-500 animate-pulse" />
                    ) : agent.battery <= 25 ? (
                      <BatteryWarning className="w-4 h-4 text-red-500" />
                    ) : (
                      <Battery className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    )}
                    Battery State:
                  </span>
                  <span className={`font-bold text-sm ${
                    agent.battery > 50 ? 'text-emerald-600 dark:text-emerald-400' : agent.battery > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(agent.battery)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      agent.battery > 50 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                        : agent.battery > 25 
                          ? 'bg-amber-400' 
                          : 'bg-red-500 animate-pulse'
                    }`}
                    style={{ width: `${agent.battery}%` }}
                  />
                </div>
              </div>

              {/* Transit Route Information */}
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-3 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="truncate max-w-[110px] text-slate-700 dark:text-slate-300" title={currName}>
                    {currName}
                  </span>
                  <ArrowRight className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mx-1.5" />
                  <span className="truncate max-w-[110px] text-cyan-700 dark:text-cyan-300 font-bold text-right" title={targetName}>
                    {targetName}
                  </span>
                </div>
              </div>

              {/* Telemetry Stats: Steps, Distance, Cleared */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[11px] block">TOTAL STEPS</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{agent.totalSteps}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[11px] block">DISTANCE</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{Math.round(agent.totalDistance)}m</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[11px] block">RESOLVED</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{agent.incidentsCleared}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
