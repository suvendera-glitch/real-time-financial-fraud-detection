import React from 'react';
import {
  Smartphone,
  MapPin,
  UserPlus,
  TrendingUp,
  Zap,
  Share2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  Activity,
  AlertOctagon,
} from 'lucide-react';
import { RiskSignal as RiskSignalType } from '../types/risk';

interface RiskSignalProps {
  signal: RiskSignalType;
  index?: number;
}

export const RiskSignal: React.FC<RiskSignalProps> = ({ signal, index }) => {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'mappin':
        return <MapPin className="w-5 h-5" />;
      case 'userplus':
        return <UserPlus className="w-5 h-5" />;
      case 'usercheck':
        return <UserCheck className="w-5 h-5" />;
      case 'trendingup':
        return <TrendingUp className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'share2':
        return <Share2 className="w-5 h-5" />;
      case 'shieldalert':
        return <ShieldAlert className="w-5 h-5" />;
      case 'shieldcheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'checkcircle':
        return <CheckCircle className="w-5 h-5" />;
      case 'alerttriangle':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const statusConfig = {
    CRITICAL: {
      border: 'border-red-500/30 hover:border-red-500/50',
      bg: 'bg-red-950/20',
      iconBg: 'bg-red-500/15 text-red-400 border border-red-500/30',
      badge: 'bg-red-500/15 text-red-400 border-red-500/30',
      label: 'CRITICAL',
    },
    WARNING: {
      border: 'border-yellow-500/30 hover:border-yellow-500/50',
      bg: 'bg-yellow-950/20',
      iconBg: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
      badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      label: 'WARNING',
    },
    INFO: {
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      bg: 'bg-cyan-950/20',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      label: 'INFO',
    },
    PASS: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-950/15',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      label: 'VERIFIED',
    },
  }[signal.status] || {
    border: 'border-slate-800',
    bg: 'bg-slate-900/40',
    iconBg: 'bg-slate-800 text-slate-300',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    label: signal.status,
  };

  return (
    <div
      id={`risk-signal-item-${signal.id || index || 0}`}
      className={`relative p-4 rounded-xl border transition-all duration-200 ${statusConfig.border} ${statusConfig.bg}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-lg shrink-0 ${statusConfig.iconBg}`}>
          {getIcon(signal.icon)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-100 font-cyber truncate">
              {signal.name}
            </h4>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${statusConfig.badge}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {signal.explanation}
          </p>

          {signal.category && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Category: {signal.category}
              </span>
              {signal.weight !== undefined && signal.weight > 0 && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  Weight: +{signal.weight} pts
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
