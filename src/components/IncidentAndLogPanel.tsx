import React, { useState } from 'react';
import { Incident, DecisionLogEntry } from '../types';
import { 
  ShieldAlert, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Flame, 
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

interface IncidentAndLogPanelProps {
  incidents: Incident[];
  decisionLogs: DecisionLogEntry[];
  onAcknowledgeIncident: (incidentId: string) => void;
  onClearIncident: (incidentId: string) => void;
  onSelectZone: (zoneId: string) => void;
  theme?: 'dark' | 'light';
}

export const IncidentAndLogPanel: React.FC<IncidentAndLogPanelProps> = ({
  incidents,
  decisionLogs,
  onClearIncident,
  onSelectZone
}) => {
  const [logFilter, setLogFilter] = useState<'all' | 'ai' | 'alerts'>('all');

  const activeIncidents = incidents.filter(i => i.status !== 'cleared');

  const filteredLogs = decisionLogs.filter(entry => {
    if (logFilter === 'ai') return entry.agentId.startsWith('agent-');
    if (logFilter === 'alerts') return entry.reason.includes('ALERT') || entry.reason.includes('CRITICAL') || entry.reason.includes('SECURED');
    return true;
  });

  const getSeverityBadge = (severity: Incident['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-950/90 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-blue-100 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. LIVE INCIDENT FEED */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-2xl flex flex-col font-sans transition-colors duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                CAMPUS INCIDENT DISPATCH QUEUE
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live sensor events & verified alarm triggers
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            activeIncidents.length > 0 
              ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700' 
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
          }`}>
            {activeIncidents.length} Unresolved
          </span>
        </div>

        {activeIncidents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">All Campus Sectors Nominal</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Autonomous patrol agents are actively maintaining scheduled coverage with no unresolved security breaches.
            </span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {activeIncidents.map(incident => (
              <div
                key={incident.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/80 hover:shadow-md transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {incident.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    +{incident.elapsedTicks} ticks
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => onSelectZone(incident.zoneId)}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {incident.zoneName}
                  </button>

                  <div className="flex items-center gap-2">
                    {incident.status === 'responding' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 animate-pulse" /> Intercepting
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        Dispatched
                      </span>
                    )}

                    <button
                      onClick={() => onClearIncident(incident.id)}
                      className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all font-semibold flex items-center gap-1"
                      title="Manually clear incident"
                    >
                      <Check className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. AUTONOMOUS DECISION STREAM */}
      <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-2xl flex flex-col font-sans transition-colors duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                AUTONOMOUS REASONING FEED
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mathematical optimization & swarm route decisions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                logFilter === 'all' ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setLogFilter('ai')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                logFilter === 'ai' ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              AI Dispatches
            </button>
            <button
              onClick={() => setLogFilter('alerts')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                logFilter === 'alerts' ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        <div className="flex-1 max-h-[340px] overflow-y-auto space-y-2.5 pr-1 font-sans text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              Awaiting next autonomous decision cycle...
            </div>
          ) : (
            filteredLogs.map(entry => {
              const isAlert = entry.reason.includes('ALERT') || entry.reason.includes('CRITICAL');
              const isNeutralized = entry.reason.includes('SECURED');

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isAlert 
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60' 
                      : isNeutralized
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-slate-50/70 dark:bg-[#0e172a] border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400">
                      [{entry.agentName}]
                    </span>
                    <span className="font-mono">T+{entry.tick} • {entry.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {entry.reason}
                  </p>

                  {/* Mathematical Formula Breakdown if available */}
                  {entry.formulaComponents && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <span className="text-cyan-700 dark:text-cyan-400 font-bold">
                        Score: {entry.score.toFixed(1)}
                      </span>
                      <span>Cov: +{entry.formulaComponents.coverage.toFixed(1)}</span>
                      <span>Urg: +{entry.formulaComponents.urgency.toFixed(1)}</span>
                      <span>Risk: +{entry.formulaComponents.risk.toFixed(1)}</span>
                      {entry.formulaComponents.incident > 0 && (
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          Alert: +{entry.formulaComponents.incident.toFixed(1)}
                        </span>
                      )}
                      <span>Dist: -{entry.formulaComponents.dist.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
