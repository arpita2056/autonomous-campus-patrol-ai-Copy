import React, { useState, useEffect } from 'react';
import { Agent, ZoneNode, Incident } from '../types';
import { 
  Camera, 
  Video, 
  Crosshair, 
  Battery, 
  Wifi, 
  Zap, 
  Volume2, 
  AlertTriangle, 
  Maximize2, 
  X, 
  Eye, 
  ShieldCheck, 
  Navigation,
  Compass
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface DroneCameraModalProps {
  agent: Agent | null;
  zones: ZoneNode[];
  incidents: Incident[];
  onClose: () => void;
  onSoundAlarm: (agentId: string) => void;
  onReturnToDock: (agentId: string) => void;
}

export const DroneCameraModal: React.FC<DroneCameraModalProps> = ({
  agent,
  zones,
  incidents,
  onClose,
  onSoundAlarm,
  onReturnToDock
}) => {
  const [visionMode, setVisionMode] = useState<'optical' | 'thermal' | 'night'>('optical');
  const [zoom, setZoom] = useState<number>(1.5);
  const [targetEntity, setTargetEntity] = useState<string>('Pedestrian Activity Detected');
  const [alarmActive, setAlarmActive] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const entities = [
        'Pedestrian Group [3 Persons] • Low Risk',
        'Campus Transit E-Rickshaw • Verified ID',
        'Perimeter Pathway Normal • Scanning',
        'Student Hostels Thoroughfare Nominal'
      ];
      setTargetEntity(entities[Math.floor(Math.random() * entities.length)]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!agent) return null;

  const currentZone = zones.find(z => z.id === agent.currentNodeId);
  const targetZone = zones.find(z => z.id === agent.targetNodeId);
  const activeIncident = incidents.find(i => i.zoneId === agent.targetNodeId && i.status !== 'cleared');

  const handleTriggerDroneAlarm = () => {
    soundFX.playAlert();
    setAlarmActive(true);
    onSoundAlarm(agent.id);
    setTimeout(() => setAlarmActive(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#080d1a] border border-cyan-500/60 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 font-sans">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f172a] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <h3 className="font-mono font-bold text-sm tracking-wide text-white">
                LIVE OPTICAL POV // {agent.name.toUpperCase()} [{agent.callsign}]
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700">
              1080p 60FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Camera Viewport with HUD Graphics */}
        <div className={`relative h-[380px] w-full overflow-hidden select-none transition-colors duration-500 ${
          visionMode === 'thermal'
            ? 'bg-gradient-to-tr from-[#1e1035] via-[#45103a] to-[#f97316]'
            : visionMode === 'night'
              ? 'bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22]'
              : 'bg-gradient-to-b from-[#070e1b] via-[#0d1829] to-[#070e1b]'
        }`}>
          {/* Subtle Scanlines & Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

          {/* Tactical Crosshairs & Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 border border-cyan-500/40 rounded-full flex items-center justify-center relative">
              <div className="w-32 h-32 border border-dashed border-cyan-400/30 rounded-full animate-spin" />
              <Crosshair className="w-8 h-8 text-cyan-400/80 animate-pulse" />
              <div className="absolute top-2 text-[10px] font-mono text-cyan-400 tracking-wider">
                LOCK-ON
              </div>
            </div>
          </div>

          {/* AI Entity Bounding Box (Object Detection Overlay) */}
          <div className="absolute top-28 left-44 border-2 border-emerald-400 bg-emerald-500/10 p-2 rounded pointer-events-none animate-pulse">
            <span className="text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 px-1 py-0.5 rounded">
              {targetEntity}
            </span>
            <div className="text-[9px] font-mono text-emerald-300 mt-1">
              Confidence: 94.8% • Sector: {currentZone?.name || 'In Transit'}
            </div>
          </div>

          {/* Top Left HUD Telemetry */}
          <div className="absolute top-4 left-4 font-mono text-xs text-cyan-300 space-y-1 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>GPS: 31.2536° N, 75.7037° E</span>
            </div>
            <div>ALTITUDE: 22.4m AGL</div>
            <div>AIRSPEED: {(agent.speed * 8.5).toFixed(1)} km/h</div>
            <div>HEADING: {Math.round(agent.heading)}° AZIMUTH</div>
          </div>

          {/* Top Right HUD Mode & Battery */}
          <div className="absolute top-4 right-4 font-mono text-xs text-right space-y-1 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-bold">
              <Battery className="w-4 h-4" />
              <span>{Math.round(agent.battery)}% CAPACITY</span>
            </div>
            <div className="text-slate-400">STATUS: {agent.status.toUpperCase()}</div>
            <div className="text-cyan-400">WAYPOINT: {targetZone?.name || 'Active'}</div>
          </div>

          {/* Bottom Alert Banner if Responding */}
          {activeIncident && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-mono text-xs flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4" />
                ACTIVE INTERCEPTION: {activeIncident.title} ({activeIncident.severity.toUpperCase()})
              </span>
              <span>DISTANCE TO TARGET: ~{Math.round((1 - agent.pathProgress) * 140)}m</span>
            </div>
          )}
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-[#0a101f] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Vision Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 px-2 font-mono">SENSOR:</span>
            <button
              onClick={() => {
                soundFX.playClick();
                setVisionMode('optical');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                visionMode === 'optical' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Optical HD
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setVisionMode('thermal');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                visionMode === 'thermal' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thermal FLIR
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                setVisionMode('night');
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                visionMode === 'night' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Night Vision
            </button>
          </div>

          {/* Action Commands */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerDroneAlarm}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                alarmActive
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Broadcast Megaphone Warning</span>
            </button>

            <button
              onClick={() => {
                soundFX.playDispatch();
                onReturnToDock(agent.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Recall to Dock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

