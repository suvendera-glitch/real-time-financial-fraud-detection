import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  X,
  Play,
  Terminal,
} from 'lucide-react';

export const DemoGuideBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 shadow-2xl flex items-center gap-2 text-xs font-mono backdrop-blur-md hover:bg-cyan-900/90 transition-all"
        title="Open JARVIS Hackathon Interactive Flow Guide"
      >
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span>Interactive Demo Guide</span>
      </button>
    );
  }

  return (
    <div
      id="jarvis-demo-guide-banner"
      className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0a1224] to-slate-950 border border-cyan-500/30 relative overflow-hidden shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-cyber tracking-wider text-cyan-300 uppercase">
                Hackathon Verification Workflow
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                DETECT → EXPLAIN → PAUSE → VERIFY → RECHECK → RESPOND
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Experience how JARVIS intercepts anomalous payments in real time using multi-signal heuristics.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-slate-500 hover:text-slate-300 p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200">
            1. Send ₹75,000
          </span>
          <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-rose-300">
            2. 92/100 Paused
          </span>
          <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300">
            3. OTP 123456
          </span>
          <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-300">
            4. Recheck: 28 Cleared
          </span>
          <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-300">
            5. SOC NetworkX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/pay?scenario=high_risk')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-300" />
            Run ₹75k High-Risk Scenario
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            SOC Center
          </button>
        </div>
      </div>
    </div>
  );
};
