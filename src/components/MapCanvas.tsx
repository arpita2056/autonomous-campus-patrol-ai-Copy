import React, { useState } from 'react';
import { 
  ZoneNode, 
  GraphEdge, 
  Agent, 
  Incident, 
  AgentStatus 
} from '../types';
import { 
  Layers, 
  Zap, 
  Flame, 
  MapPin, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Camera,
  Radio,
  Globe,
  Eye,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { LpuSatelliteMap } from './LpuSatelliteMap';
import { soundFX } from '../utils/audio';

interface MapCanvasProps {
  zones: ZoneNode[];
  edges: GraphEdge[];
  agents: Agent[];
  incidents: Incident[];
  currentTick: number;
  activeLayers: {
    routes: boolean;
    riskZones: boolean;
    nodeLabels: boolean;
    connectionPaths: boolean;
    heatmap: boolean;
    trails: boolean;
  };
  onToggleLayer: (layer: keyof MapCanvasProps['activeLayers']) => void;
  speedMultiplier: number;
  onSetSpeed: (speed: number) => void;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onOpenDroneCamera: (agentId: string) => void;
  theme: 'dark' | 'light';
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  zones,
  edges,
  agents,
  incidents,
  currentTick,
  activeLayers,
  onToggleLayer,
  speedMultiplier,
  onSetSpeed,
  selectedZoneId,
  onSelectZone,
  selectedAgentId,
  onSelectAgent,
  onOpenDroneCamera,
  theme
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'thermal' | 'blueprint'>('satellite');

  const viewBoxWidth = 1080;
  const viewBoxHeight = 760;

  // Zone specific color palette
  const getZoneColor = (zone: ZoneNode) => {
    switch (zone.id) {
      case 'main-gate': return { primary: '#10b981', bg: '#064e3b', text: '#34d399' };
      case 'main-food-court': return { primary: '#f97316', bg: '#7c2d12', text: '#fb923c' };
      case 'unimall': return { primary: '#8b5cf6', bg: '#4c1d95', text: '#a78bfa' };
      case 'unihospital': return { primary: '#ef4444', bg: '#7f1d1d', text: '#f87171' };
      case 'central-library': return { primary: '#0284c7', bg: '#082f49', text: '#38bdf8' };
      case 'cse-block': return { primary: '#06b6d4', bg: '#164e63', text: '#22d3ee' };
      case 'dsr-block': return { primary: '#3b82f6', bg: '#1e3a8a', text: '#60a5fa' };
      case 'unipolis': return { primary: '#ec4899', bg: '#831843', text: '#f472b6' };
      case 'boys-hostels': return { primary: '#3b82f6', bg: '#1e3a8a', text: '#60a5fa' };
      case 'girls-hostels': return { primary: '#a855f7', bg: '#581c87', text: '#c084fc' };
      case 'parking-zone': return { primary: '#64748b', bg: '#1e293b', text: '#94a3b8' };
      case 'admission-block': return { primary: '#14b8a6', bg: '#134e4a', text: '#2dd4bf' };
      default: return { primary: '#0284c7', bg: '#0f172a', text: '#38bdf8' };
    }
  };

  const getAgentStatusRingColor = (status: AgentStatus) => {
    switch (status) {
      case 'patrolling':
      case 'en_route':
        return '#06b6d4';
      case 'responding':
        return '#ef4444';
      case 'charging':
        return '#10b981';
      case 'low_battery':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d19] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden relative transition-colors duration-300">
      {/* Floating Modern Header Pill Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3 pointer-events-none flex-wrap">
        {/* Map Imagery Mode & Layer Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto flex-wrap text-white">
          <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
            <button
              onClick={() => {
                soundFX.playClick();
                setMapMode('satellite');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'satellite'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              LPU Satellite
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                setMapMode('thermal');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'thermal'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Thermal FLIR
            </button>
          </div>

          <button
            onClick={() => onToggleLayer('routes')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayers.routes
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Avenues
          </button>

          <button
            onClick={() => onToggleLayer('heatmap')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              activeLayers.heatmap
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap
          </button>

          <button
            onClick={() => onToggleLayer('riskZones')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLayers.riskZones
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Risk Rings
          </button>
        </div>

        {/* Speed Multiplier & Drone Video POV Button */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto text-white">
          {/* Live POV Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenDroneCamera(selectedAgentId || agents[0]?.id || 'agent-1');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold shadow-md hover:from-cyan-500 hover:to-blue-500 transition-all active:scale-95 animate-pulse"
          >
            <Camera className="w-4 h-4" />
            <span>Drone HD POV</span>
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 px-2 border-l border-slate-700">
            {[1, 2, 5, 10, 20].map(multiplier => (
              <button
                key={multiplier}
                onClick={() => {
                  soundFX.playClick();
                  onSetSpeed(multiplier);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  speedMultiplier === multiplier
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-1">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.12))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.12))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vector / Satellite Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[660px] overflow-hidden select-none bg-[#090e1a]">
        <svg 
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full object-contain transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 1. LPU SATELLITE TERRAIN & LANDMARK VECTOR LAYER */}
          <LpuSatelliteMap width={viewBoxWidth} height={viewBoxHeight} mode={mapMode} />

          {/* 2. CAMPUS ROADS & HIGHWAYS */}
          {activeLayers.routes && edges.map(edge => {
            const fromZone = zones.find(z => z.id === edge.from);
            const toZone = zones.find(z => z.id === edge.to);
            if (!fromZone || !toZone) return null;

            return (
              <g key={edge.id} className="transition-all duration-300">
                <line
                  x1={fromZone.x}
                  y1={fromZone.y}
                  x2={toZone.x}
                  y2={toZone.y}
                  stroke="rgba(14, 165, 233, 0.6)"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                />
              </g>
            );
          })}

          {/* 3. REVISIT STARVATION HEATMAP */}
          {activeLayers.heatmap && zones.map(zone => {
            const elapsed = Math.max(0, currentTick - zone.lastVisitedTick);
            const heatColor = elapsed > 130 ? 'rgba(239, 68, 68, 0.4)' : elapsed > 65 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.2)';
            const ringColor = elapsed > 130 ? '#ef4444' : elapsed > 65 ? '#f59e0b' : '#06b6d4';

            return (
              <g key={`heat-${zone.id}`}>
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={60}
                  fill={heatColor}
                  className="animate-pulse"
                />
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={52}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* 4. DYNAMIC RISK HALOS */}
          {activeLayers.riskZones && zones.map(zone => {
            if (zone.baseRisk < 0.55) return null;
            const radius = 40 + zone.baseRisk * 20;

            return (
              <circle
                key={`risk-${zone.id}`}
                cx={zone.x}
                cy={zone.y}
                r={radius}
                fill="none"
                stroke="rgba(245, 158, 11, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
            );
          })}

          {/* 5. AGENT TRAILS & DRONE FLIGHT PATHS */}
          {activeLayers.trails && agents.map(agent => (
            <g key={`trail-${agent.id}`}>
              {agent.trail.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={Math.max(2, 4.5 - idx * 0.25)}
                  fill={agent.color}
                  opacity={pt.alpha * 0.8}
                />
              ))}

              {/* Waypoint Destination Line */}
              {agent.plannedPath.length >= 2 && (
                <polyline
                  points={agent.plannedPath.map(nid => {
                    const z = zones.find(zn => zn.id === nid);
                    return z ? `${z.x},${z.y}` : '';
                  }).filter(Boolean).join(' ')}
                  fill="none"
                  stroke={agent.color}
                  strokeWidth="2.2"
                  strokeDasharray="5 4"
                  opacity="0.75"
                />
              )}
            </g>
          ))}

          {/* 6. CLEAN APPLE MAPS-STYLE SATELLITE PINS */}
          {zones.map(zone => {
            const isSelected = selectedZoneId === zone.id;
            const isHovered = hoveredZoneId === zone.id;
            const hasAlert = !!zone.activeIncidentId;
            const activeInc = incidents.find(i => i.id === zone.activeIncidentId && i.status !== 'cleared');
            const zoneTheme = getZoneColor(zone);
            const isDock = !!zone.isChargingHub;

            return (
              <g
                key={zone.id}
                transform={`translate(${zone.x}, ${zone.y})`}
                onClick={() => {
                  soundFX.playClick();
                  onSelectZone(zone.id);
                }}
                onMouseEnter={() => setHoveredZoneId(zone.id)}
                onMouseLeave={() => setHoveredZoneId(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Active Incident Expanding Pulse Ring */}
                {hasAlert && (
                  <g>
                    <circle
                      r="46"
                      fill="rgba(239, 68, 68, 0.35)"
                      className="animate-ping"
                    />
                    <circle
                      r="36"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="animate-spin"
                    />
                  </g>
                )}

                {/* Selected Halo */}
                {isSelected && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}

                {/* Outer Glow Ring on Hover */}
                {isHovered && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={zoneTheme.primary}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                )}

                {/* Main Circular Pin Marker */}
                <circle
                  r={isDock ? 24 : 20}
                  fill={hasAlert ? '#ef4444' : '#0b1329'}
                  stroke={hasAlert ? '#dc2626' : zoneTheme.primary}
                  strokeWidth={hasAlert ? 3 : 2.5}
                  className="drop-shadow-lg"
                />

                {/* Inner Icon Glyph Circle */}
                <circle
                  r={isDock ? 17 : 14}
                  fill={hasAlert ? '#b91c1c' : zoneTheme.bg}
                />

                {/* Center Symbol */}
                {isDock ? (
                  <path
                    d="M-3 -5 L2 -5 L-1 0 L3 0 L-2 6 L-1 1 L-4 1 Z"
                    fill={hasAlert ? '#ffffff' : zoneTheme.primary}
                  />
                ) : (
                  <circle
                    r="5"
                    fill={hasAlert ? '#ffffff' : zoneTheme.primary}
                  />
                )}

                {/* Clean Floating Text Label - High Contrast Satellite Typography */}
                <g transform="translate(0, 32)">
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#050a14"
                    stroke="#050a14"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="sans-serif"
                  >
                    {zone.name}
                  </text>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={hasAlert ? '#f87171' : '#ffffff'}
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="sans-serif"
                  >
                    {zone.name}
                  </text>
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {zone.code} • {(zone.baseRisk * 100).toFixed(0)}% Risk
                  </text>
                </g>

                {/* Floating Alert Pill */}
                {hasAlert && activeInc && (
                  <g transform="translate(0, -32)">
                    <rect
                      x="-48"
                      y="-11"
                      width="96"
                      height="22"
                      rx="11"
                      fill="#ef4444"
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10.5"
                      fontWeight="800"
                      fontFamily="sans-serif"
                    >
                      🚨 {activeInc.severity.toUpperCase()} ALERT
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 7. LIVE PATROL DRONES / AGENTS */}
          {agents.map(agent => {
            const isSelected = selectedAgentId === agent.id;
            const ringColor = getAgentStatusRingColor(agent.status);

            return (
              <g
                key={agent.id}
                transform={`translate(${agent.x}, ${agent.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playClick();
                  onSelectAgent(agent.id);
                }}
                className="cursor-pointer group"
              >
                {/* Heading Sensor Beam */}
                <g transform={`rotate(${agent.heading})`}>
                  <path
                    d="M 0 0 L 55 -22 L 55 22 Z"
                    fill={agent.color}
                    opacity="0.22"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="35"
                    y2="0"
                    stroke={agent.color}
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                </g>

                {/* Sonar Status Ring */}
                <circle
                  r={isSelected ? 22 : 18}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="2.5"
                  strokeDasharray={agent.status === 'responding' ? '5 3' : undefined}
                  className={agent.status === 'responding' ? 'animate-spin' : undefined}
                />

                {/* Drone Body Disc */}
                <circle
                  r="13"
                  fill="#0b1329"
                  stroke={agent.color}
                  strokeWidth="2.5"
                  className="drop-shadow-lg"
                />

                {/* Direction Chevron */}
                <g transform={`rotate(${agent.heading})`}>
                  <polygon
                    points="7,0 -5,-6 -1,0 -5,6"
                    fill={agent.color}
                  />
                </g>

                {/* Drone Callout Pill */}
                <g transform="translate(0, -28)">
                  <rect
                    x="-32"
                    y="-10"
                    width="64"
                    height="20"
                    rx="10"
                    fill="rgba(8, 14, 28, 0.95)"
                    stroke={agent.color}
                    strokeWidth="1.4"
                    className="drop-shadow-md"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {agent.callsign} • {Math.round(agent.battery)}%
                  </text>
                </g>

                {/* Charging Bolt Badge */}
                {agent.status === 'charging' && (
                  <g transform="translate(15, -9)">
                    <circle r="8" fill="#10b981" />
                    <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">⚡</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Zone Quick Inspector Drawer (Floating Top Right) */}
        {selectedZoneId && (() => {
          const zone = zones.find(z => z.id === selectedZoneId);
          if (!zone) return null;
          const elapsed = Math.max(0, currentTick - zone.lastVisitedTick);

          return (
            <div className="absolute top-20 right-4 w-76 bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 shadow-2xl z-30 animate-in fade-in slide-in-from-right-4 duration-200 text-xs text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {zone.code} SECTOR
                </span>
                <button
                  onClick={() => onSelectZone(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <h4 className="font-extrabold text-white mt-2 text-sm">{zone.name}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{zone.description}</p>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 text-[10.5px] block font-semibold">BASE RISK</span>
                  <span className="text-amber-400 font-extrabold text-sm">{(zone.baseRisk * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 text-[10.5px] block font-semibold">LAST SWEPT</span>
                  <span className={`font-extrabold text-sm ${elapsed > 120 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {elapsed}t ago
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
