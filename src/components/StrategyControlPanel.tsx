import React from 'react';
import { 
  Play, 
  Pause, 
  StepForward, 
  Sliders, 
  Cpu, 
  Users, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { PatrolStrategy, UtilityWeights } from '../types';

interface StrategyControlPanelProps {
  isRunning: boolean;
  onTogglePlayPause: () => void;
  onSingleStep: () => void;
  activeStrategy: PatrolStrategy;
  onSelectStrategy: (strategy: PatrolStrategy) => void;
  fleetSize: number;
  onSetFleetSize: (size: number) => void;
  weights: UtilityWeights;
  onUpdateWeights: (newWeights: Partial<UtilityWeights>) => void;
  onResetDefaultWeights: () => void;
  theme?: 'dark' | 'light';
}

export const StrategyControlPanel: React.FC<StrategyControlPanelProps> = ({
  isRunning,
  onTogglePlayPause,
  onSingleStep,
  activeStrategy,
  onSelectStrategy,
  fleetSize,
  onSetFleetSize,
  weights,
  onUpdateWeights,
  onResetDefaultWeights
}) => {
  return (
    <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-md dark:shadow-2xl flex flex-col gap-5 text-sm transition-colors duration-300">
      {/* Simulation Execution Controls */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            SIMULATION CONTROLS
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-3.5">
          <button
            onClick={onTogglePlayPause}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> PAUSE SIMULATION
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> RESUME SIMULATION
              </>
            )}
          </button>

          <button
            onClick={onSingleStep}
            disabled={isRunning}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm border transition-all ${
              isRunning
                ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 border-slate-300 dark:border-slate-700 hover:border-cyan-500 shadow-sm'
            }`}
            title="Execute 1 simulation tick"
          >
            <StepForward className="w-4 h-4" /> STEP
          </button>
        </div>
      </div>

      {/* Strategy Selection Engine */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
          Patrol Optimization Engine
        </label>

        <div className="space-y-2.5">
          {/* Utility AI Option */}
          <button
            onClick={() => onSelectStrategy('utility')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all relative ${
              activeStrategy === 'utility'
                ? 'bg-cyan-50/70 dark:bg-cyan-950/50 border-cyan-500 text-cyan-950 dark:text-cyan-100 shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Utility-Based AI (Recommended)
              </span>
              {activeStrategy === 'utility' && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Multi-objective optimization balancing starvation urgency, campus incidents, base risks, and travel cost.
            </p>
          </button>

          {/* Fixed Route Loop */}
          <button
            onClick={() => onSelectStrategy('fixed')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'fixed'
                ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-500 text-blue-950 dark:text-blue-100 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Fixed Route (Deterministic)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Fixed sequential perimeter loop. Susceptible to predictable timing and high incident response latency.
            </p>
          </button>

          {/* Random Stochastic Walk */}
          <button
            onClick={() => onSelectStrategy('random')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'random'
                ? 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-100 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
              🎲 Random Patrol (Stochastic Walk)
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Uniform random neighbor selection. Lacks situational awareness and causes severe zone starvation.
            </p>
          </button>
        </div>
      </div>

      {/* Fleet Deployment Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ACTIVE FLEET SIZE:
          </span>
          <span className="text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-700 font-bold">
            {fleetSize} Active Patrol Units
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={fleetSize}
          onChange={(e) => onSetFleetSize(Number(e.target.value))}
          className="w-full accent-cyan-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-xs font-semibold text-slate-400 mt-1.5">
          <span>1 Unit</span>
          <span>3 Units (Standard)</span>
          <span>6 Max Units</span>
        </div>
      </div>

      {/* Utility Weighting Sliders */}
      <div className={`transition-opacity ${activeStrategy === 'utility' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
            <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            LIVE UTILITY WEIGHTING MATRIX
          </span>
          <button
            onClick={onResetDefaultWeights}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Weights
          </button>
        </div>

        {/* Live Mathematical Formula Preview Box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3.5 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto shadow-inner">
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">U(z)</span> = {weights.wC.toFixed(1)}·C + {weights.wU.toFixed(1)}·Δt/T<sub>max</sub> + {weights.wR.toFixed(1)}·R + {weights.wA.toFixed(1)}·I - dist - P<sub>batt</sub>
        </div>

        <div className="space-y-3.5 text-xs font-medium">
          {/* wC: Coverage Gain */}
          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              <span>Coverage Priority (w₁ / w_C):</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{weights.wC.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={weights.wC}
              onChange={(e) => onUpdateWeights({ wC: Number(e.target.value) })}
              className="w-full accent-cyan-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* wU: Revisit Urgency */}
          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              <span>Revisit Urgency (w₂ / w_U):</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{weights.wU.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={weights.wU}
              onChange={(e) => onUpdateWeights({ wU: Number(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* wR: Static Risk */}
          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              <span>Base Risk Sensitivity (w₃ / w_R):</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{weights.wR.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={weights.wR}
              onChange={(e) => onUpdateWeights({ wR: Number(e.target.value) })}
              className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* wA: Incident Multiplier */}
          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              <span>Emergency Alert Priority (w₄ / w_A):</span>
              <span className="text-red-600 dark:text-red-400 font-bold">{weights.wA.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.2"
              value={weights.wA}
              onChange={(e) => onUpdateWeights({ wA: Number(e.target.value) })}
              className="w-full accent-red-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* wBatt: Battery Return Threshold */}
          <div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              <span>Dock Return Battery Threshold:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{weights.wBatt}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={weights.wBatt}
              onChange={(e) => onUpdateWeights({ wBatt: Number(e.target.value) })}
              className="w-full accent-emerald-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
