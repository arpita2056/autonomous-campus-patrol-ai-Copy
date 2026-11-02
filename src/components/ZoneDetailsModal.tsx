import React from 'react';
import { ZoneNode, Agent, Incident } from '../types';
import { 
  MapPin, 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  Zap, 
  X 
} from 'lucide-react';

interface ZoneDetailsModalProps {
  zone: ZoneNode | null;
  onClose: () => void;
  currentTick: number;
  agents: Agent[];
  incidents: Incident[];
  onDispatchAgent: (agentId: string, zoneId: string) => void;
  onTriggerZoneIncident: (zoneId: string) => void;
  theme?: 'dark' | 'light';
}

export const ZoneDetailsModal: React.FC<ZoneDetailsModalProps> = ({
  zone,
  onClose,
  currentTick,
  agents,
  incidents,
  onDispatchAgent,
  onTriggerZoneIncident
}) => {
  if (!zone) return null;

  const elapsed = Math.max(0, currentTick - zone.lastVisitedTick);
  const activeIncident = incidents.find(i => i.zoneId === zone.id && i.status !== 'cleared');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 text-sm font-sans relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-700 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">
                {zone.code}
              </span>
              {zone.isChargingHub && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Charging Hub
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
              {zone.name}
            </h3>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {zone.description}
        </p>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-semibold">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">STATIC BASE RISK</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold text-base">
              {(zone.baseRisk * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">STARVATION LATENCY</span>
            <span className={`font-extrabold text-base ${elapsed > 100 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {elapsed} ticks
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">TOTAL PATROL VISITS</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-base">
              {zone.visitCount} sweeps
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px] block">ZONE STATUS</span>
            <span className={`font-extrabold text-base ${activeIncident ? 'text-red-600' : 'text-cyan-600 dark:text-cyan-400'}`}>
              {activeIncident ? 'ACTIVE BREACH' : 'NOMINAL'}
            </span>
          </div>
        </div>

        {/* Active Incident Warning if present */}
        {activeIncident && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-600 rounded-2xl text-red-800 dark:text-red-200 mb-4 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-xs text-red-600 dark:text-red-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              PRIORITY INCIDENT: {activeIncident.title}
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              {activeIncident.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
            DIRECTLY DISPATCH PATROL AGENT:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  onDispatchAgent(agent.id, zone.id);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all hover:border-cyan-500 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                  {agent.callsign} ({Math.round(agent.battery)}%)
                </span>
                <Send className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </button>
            ))}
          </div>

          {!activeIncident && (
            <button
              onClick={() => {
                onTriggerZoneIncident(zone.id);
                onClose();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 font-bold text-xs transition-all shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Simulate Security Incident At This Zone
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
