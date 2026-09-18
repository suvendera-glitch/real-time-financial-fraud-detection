import React from 'react';
import { RiskLevel } from '../types/risk';
import { TransactionStatus } from '../types/transaction';

interface StatusBadgeProps {
  type?: 'risk' | 'status' | 'action';
  riskLevel?: RiskLevel;
  status?: TransactionStatus;
  action?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type = 'status',
  riskLevel,
  status,
  action,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold tracking-wider',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wider',
    lg: 'px-3.5 py-1.5 text-sm font-semibold tracking-wider',
  }[size];

  if (type === 'risk' || riskLevel) {
    const level = riskLevel || 'LOW';
    if (level === 'HIGH') {
      return (
        <span
          id={`badge-risk-${level.toLowerCase()}`}
          className={`inline-flex items-center rounded-md font-mono uppercase bg-red-500/15 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
          HIGH
        </span>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <span
          id={`badge-risk-${level.toLowerCase()}`}
          className={`inline-flex items-center rounded-md font-mono uppercase bg-yellow-500/15 text-yellow-300 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.25)] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5" />
          MEDIUM
        </span>
      );
    }
    return (
      <span
        id={`badge-risk-${level.toLowerCase()}`}
        className={`inline-flex items-center rounded-md font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
        LOW
      </span>
    );
  }

  const stat = status || (action as TransactionStatus) || 'APPROVED';

  if (stat === 'PAUSED') {
    return (
      <span
        id="badge-status-paused"
        className={`inline-flex items-center rounded-md font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-ping" />
        PAUSED
      </span>
    );
  }

  if (stat === 'HELD') {
    return (
      <span
        id="badge-status-held"
        className={`inline-flex items-center rounded-md font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5" />
        HELD
      </span>
    );
  }

  if (stat === 'VERIFICATION') {
    return (
      <span
        id="badge-status-verification"
        className={`inline-flex items-center rounded-md font-mono uppercase bg-yellow-500/15 text-yellow-300 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.25)] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5" />
        VERIFICATION
      </span>
    );
  }

  if (stat === 'COMPLETED' || stat === 'APPROVED') {
    return (
      <span
        id="badge-status-approved"
        className={`inline-flex items-center rounded-md font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
        {stat === 'COMPLETED' ? 'COMPLETED' : 'APPROVED'}
      </span>
    );
  }

  return (
    <span
      id="badge-status-default"
      className={`inline-flex items-center rounded-md font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}
    >
      {stat}
    </span>
  );
};
