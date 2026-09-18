import React from 'react';
import { Cpu, ShieldCheck, Sparkles, Network, Activity } from 'lucide-react';
import { ModelBreakdown } from '../types/risk';

interface AIExplanationProps {
  explanation: string;
  modelBreakdown?: ModelBreakdown;
  className?: string;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({
  explanation,
  modelBreakdown,
  className = '',
}) => {
  return (
    <div
      id="ai-explanation-card"
      className={`glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden ${className}`}
    >
      {/* Top subtle decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              AI Risk Reasoning & Synthesis
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LLM EXPLAINER
              </span>
            </h3>
            <p className="text-[11px] font-mono text-cyan-400/80">
              AI-generated explanation based on detected risk signals
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          Deterministic Fraud Decision
        </div>
      </div>

      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans relative">
        <p id="ai-explanation-body" className="relative z-10">
          {explanation}
        </p>
      </div>

      {/* Model attribution pipeline */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pipeline:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            XGBoost Classifier
            {modelBreakdown && (
              <span className="text-slate-400">({Math.round(modelBreakdown.xgboost_score)}%)</span>
            )}
          </span>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-purple-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Isolation Forest
            {modelBreakdown && (
              <span className="text-slate-400">
                ({modelBreakdown.isolation_forest_anomaly < 0 ? 'Outlier' : 'Inlier'})
              </span>
            )}
          </span>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-amber-300 flex items-center gap-1">
            <Network className="w-3 h-3 text-amber-400" />
            NetworkX Graph
            {modelBreakdown && (
              <span className="text-slate-400">({Math.round(modelBreakdown.network_centrality)}%)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
