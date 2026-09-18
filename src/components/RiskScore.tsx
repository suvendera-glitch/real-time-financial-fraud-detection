import React from 'react';
import { RiskLevel, RiskAction } from '../types/risk';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  action?: RiskAction | string;
  size?: 'sm' | 'md' | 'lg';
  showDecision?: boolean;
  subtext?: string;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  level,
  action,
  size = 'lg',
  showDecision = true,
  subtext,
}) => {
  // SVG circular gauge geometry
  const radius = size === 'lg' ? 78 : size === 'md' ? 56 : 38;
  const stroke = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorConfig = {
    LOW: {
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.4)',
      text: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      label: 'LOW RISK (GREEN)',
      defaultDecision: 'PAYMENT APPROVED',
    },
    MEDIUM: {
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.4)',
      text: 'text-yellow-400',
      bgGlow: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'MEDIUM RISK (YELLOW)',
      defaultDecision: 'VERIFICATION REQUIRED',
    },
    HIGH: {
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.45)',
      text: 'text-red-400',
      bgGlow: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'HIGH RISK (RED)',
      defaultDecision: 'PAYMENT PAUSED',
    },
  }[level] || {
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.35)',
    text: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    label: 'ASSESSING',
    defaultDecision: 'MONITORING',
  };

  const decisionText = action === 'APPROVE' ? 'PAYMENT APPROVED' :
    action === 'PAUSE' ? 'PAYMENT PAUSED' :
    action === 'VERIFY' ? 'VERIFICATION REQUIRED' :
    action === 'HOLD' ? 'PAYMENT ON HOLD' :
    action || colorConfig.defaultDecision;

  const svgDimensions = radius * 2 + stroke * 2 + 16;

  return (
    <div
      id="jarvis-risk-score-display"
      className="flex flex-col items-center justify-center relative p-4"
    >
      <div className="relative flex items-center justify-center">
        {/* Background glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: colorConfig.glow }}
        />

        <svg
          width={svgDimensions}
          height={svgDimensions}
          className="transform -rotate-90 transition-all duration-1000 ease-out"
        >
          {/* Base track */}
          <circle
            cx={svgDimensions / 2}
            cy={svgDimensions / 2}
            r={radius}
            stroke="rgba(30, 41, 59, 0.7)"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={svgDimensions / 2}
            cy={svgDimensions / 2}
            r={radius}
            stroke={colorConfig.color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease',
              filter: `drop-shadow(0 0 8px ${colorConfig.glow})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span
              id="risk-score-value"
              className={`font-cyber font-bold tracking-tight ${colorConfig.text} ${
                size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {Math.round(score)}
            </span>
            <span className="text-slate-400 font-mono text-sm ml-1">/100</span>
          </div>
          <span
            id="risk-score-level-badge"
            className={`font-mono text-xs font-bold tracking-wider uppercase mt-0.5 ${colorConfig.text}`}
          >
            {colorConfig.label}
          </span>
        </div>
      </div>

      {showDecision && (
        <div className="mt-4 text-center">
          <div className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-1">
            System Decision
          </div>
          <div
            id="risk-score-decision-text"
            className={`font-cyber text-lg font-bold tracking-wide uppercase px-4 py-1.5 rounded-lg border ${colorConfig.borderColor} ${colorConfig.bgGlow} ${colorConfig.text}`}
          >
            {decisionText}
          </div>
          {subtext && (
            <p className="text-xs text-slate-400 mt-2 max-w-xs">{subtext}</p>
          )}

          {/* Prototype threshold breakdown indicator */}
          <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]" /> 0-29 Low (Green)
            </span>
            <span className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#eab308]" /> 30-69 Med (Yellow)
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" /> 70-100 High (Red)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
