import React, { useEffect, useState } from 'react';
import {
  Shield,
  Activity,
  CheckCircle2,
  Cpu,
  Smartphone,
  MapPin,
  UserCheck,
  Zap,
  Network,
  Lock,
} from 'lucide-react';

interface LoadingAnalysisProps {
  onComplete?: () => void;
  durationMs?: number;
}

interface AnalysisStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  detail: string;
}

const STEPS: AnalysisStep[] = [
  { id: 'behaviour', name: 'Transaction Behaviour', icon: Activity, detail: 'Evaluating behavioral variance against historical baseline...' },
  { id: 'account', name: 'Account History', icon: UserCheck, detail: 'Querying account ledger, trust tier, and historical balance...' },
  { id: 'beneficiary', name: 'Beneficiary Analysis', icon: UserCheck, detail: 'Assessing recipient registration age and past transfers...' },
  { id: 'device', name: 'Device Analysis', icon: Smartphone, detail: 'Inspecting device hardware token and browser fingerprint...' },
  { id: 'location', name: 'Location Analysis', icon: MapPin, detail: 'Comparing geolocation and IP subnet against home geofence...' },
  { id: 'velocity', name: 'Transaction Velocity', icon: Zap, detail: 'Computing 60-minute burst rate and anomaly frequency...' },
  { id: 'network', name: 'Network Relationship', icon: Network, detail: 'Executing NetworkX entity linkage & mule cluster detection...' },
  { id: 'decision', name: 'AI Risk Decision', icon: Cpu, detail: 'Aggregating XGBoost, Isolation Forest & LLM synthesis...' },
];

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({
  onComplete,
  durationMs = 2800,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = durationMs / STEPS.length;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      const step = Math.min(STEPS.length - 1, Math.floor((elapsed / durationMs) * STEPS.length));
      setCurrentStepIndex(step);

      if (elapsed >= durationMs) {
        clearInterval(timer);
        if (onComplete) {
          setTimeout(onComplete, 200);
        }
      }
    }, 40);

    return () => clearInterval(timer);
  }, [durationMs, onComplete]);

  const activeStep = STEPS[currentStepIndex];

  return (
    <div
      id="jarvis-analysis-modal"
      className="glass-panel-glow rounded-2xl p-6 sm:p-8 max-w-xl w-full mx-auto text-center relative overflow-hidden"
    >
      {/* Scanner laser line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      {/* Central animated shield */}
      <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping opacity-30" />
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-cyber font-bold tracking-wide text-slate-100 mb-2">
        JARVIS is analyzing your payment...
      </h2>
      <p className="text-sm font-mono text-cyan-400/80 mb-6">
        Analyzing payment security signals...
      </p>

      {/* Main Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2.5 mb-6 overflow-hidden border border-slate-800 relative">
        <div
          className="bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 h-full rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current Active Step Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 mb-6 text-left flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
          {activeStep && <activeStep.icon className="w-5 h-5 animate-spin" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-semibold mb-0.5">
            <span className="truncate">{activeStep?.name}</span>
            <span>{progress}%</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {activeStep?.detail}
          </div>
        </div>
      </div>

      {/* Sequenced Checklist */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={step.id}
              className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-colors ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <step.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{step.name}</span>
              </div>
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
              ) : isCurrent ? (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0 ml-1" />
              ) : (
                <Lock className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
