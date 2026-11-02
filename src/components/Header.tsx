import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  RotateCcw, 
  OctagonAlert, 
  Clock, 
  Cpu, 
  BarChart3, 
  Map as MapIcon, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Radio
} from 'lucide-react';
import { PatrolStrategy } from '../types';

interface HeaderProps {
  isRunning: boolean;
  isEmergencyHalt: boolean;
  tick: number;
  activeStrategy: PatrolStrategy;
  activeView: 'ops' | 'analytics';
  onToggleHalt: () => void;
  onReset: () => void;
  onTriggerAlert: () => void;
  onViewChange: (view: 'ops' | 'analytics') => void;
  fleetCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  isEmergencyHalt,
  tick,
  activeStrategy,
  activeView,
  onToggleHalt,
  onReset,
  onTriggerAlert,
  onViewChange,
  fleetCount,
  theme,
  onToggleTheme
}) => {
  const [realTime, setRealTime] = useState<string>('');
  const [shiftSeconds, setShiftSeconds] = useState<number>(1482);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRealTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(() => {
      updateTime();
      setShiftSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatShift = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getStrategyBadge = (strat: PatrolStrategy) => {
    switch (strat) {
      case 'utility':
        return {
          label: 'Utility-Based AI',
          desc: 'Dynamic Multi-Objective',
          color: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300'
        };
      case 'fixed':
        return {
          label: 'Fixed Route Loop',
          desc: 'Sequential Perimeter',
          color: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-300'
        };
      case 'random':
        return {
          label: 'Random Patrol',
          desc: 'Stochastic Walk',
          color: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300'
        };
    }
  };

  const stratInfo = getStrategyBadge(activeStrategy);

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl px-4 lg:px-6 py-3">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-[1780px] mx-auto">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1322]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  AEGIS<span className="text-cyan-600 dark:text-cyan-400">PATROL</span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  Campus Ops v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Autonomous Multi-Agent Surveillance & Security Platform
              </p>
            </div>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-cyan-500"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Center: Real-Time Telemetry & Status Badges */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isEmergencyHalt 
              ? 'bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-300 border-red-300 dark:border-red-600 shadow-sm' 
              : isRunning 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600' 
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isEmergencyHalt ? 'bg-red-500 animate-ping' : isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <span>{isEmergencyHalt ? 'EMERGENCY HALTED' : isRunning ? 'SYSTEMS LIVE' : 'SIMULATION PAUSED'}</span>
          </div>

          {/* Active Fleet Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Fleet: <strong>{fleetCount} Units Active</strong></span>
          </div>

          {/* Shift Timer */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-500 dark:text-slate-400">SHIFT:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatShift(shiftSeconds)}</span>
          </div>

          {/* Active Strategy Badge */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${stratInfo.color}`}>
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{stratInfo.label}</span>
          </div>

          {/* Ops vs Analytics Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => onViewChange('ops')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'ops'
                  ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Live Campus Map</span>
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'analytics'
                  ? 'bg-white dark:bg-cyan-600 text-cyan-700 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Benchmark Suite</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Action Controls & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-cyan-500 transition-colors"
            title={soundEnabled ? 'Mute Alarms' : 'Enable Alarms'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Light / Dark Mode Toggle (Desktop) */}
          <button
            onClick={onToggleTheme}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all text-xs font-medium"
            title="Toggle Light / Dark Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Trigger Alert Button */}
          <button
            onClick={onTriggerAlert}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 rounded-xl text-xs font-semibold transition-all hover:scale-102 active:scale-98 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Simulate Breach</span>
          </button>

          {/* Global Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-all active:scale-98"
            title="Reset simulation parameters"
          >
            <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Emergency Halt Button */}
          <button
            onClick={onToggleHalt}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 text-white ${
              isEmergencyHalt
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 animate-pulse'
                : 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
            }`}
          >
            <OctagonAlert className="w-4 h-4" />
            <span>{isEmergencyHalt ? 'RESUME ALL' : 'HALT FLEET'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
