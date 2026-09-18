import React from 'react';
import { Smartphone, MapPin, UserCheck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SecurityContext } from '../types/risk';

interface SecurityCardProps {
  context?: SecurityContext;
  deviceOverride?: { label: string; status: 'TRUSTED' | 'NEW_DEVICE'; details?: string };
  locationOverride?: { label: string; status: 'VERIFIED' | 'UNUSUAL'; details?: string };
  beneficiaryOverride?: { label: string; status: 'ESTABLISHED' | 'NEW_BENEFICIARY'; details?: string };
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  context,
  deviceOverride,
  locationOverride,
  beneficiaryOverride,
}) => {
  const device = deviceOverride || context?.device || {
    status: 'TRUSTED',
    label: 'Trusted Device',
    details: 'DEV-MAC-881 (Cryptographic Enclave)',
  };

  const location = locationOverride || context?.location || {
    status: 'VERIFIED',
    label: 'Verified Location',
    details: 'Bengaluru, India (Habitual IP)',
  };

  const beneficiary = beneficiaryOverride || context?.beneficiary || {
    status: 'NEW_BENEFICIARY',
    label: 'New Beneficiary',
    details: 'First-time payment recipient',
  };

  const protection = context?.protection || {
    status: 'ACTIVE',
    label: 'AI Monitoring Active',
    details: 'XGBoost + Isolation Forest + NetworkX',
  };

  return (
    <div
      id="security-context-panel"
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {/* 1. Device */}
      <div
        id="sec-card-device"
        className={`p-3 rounded-xl border transition-all ${
          device.status === 'NEW_DEVICE'
            ? 'bg-yellow-950/20 border-yellow-500/40 text-yellow-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Device
          </span>
          <Smartphone
            className={`w-4 h-4 ${
              device.status === 'NEW_DEVICE' ? 'text-yellow-400' : 'text-cyan-400'
            }`}
          />
        </div>
        <div className="text-xs font-bold font-cyber truncate">{device.label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          {device.details}
        </div>
      </div>

      {/* 2. Location */}
      <div
        id="sec-card-location"
        className={`p-3 rounded-xl border transition-all ${
          location.status === 'UNUSUAL'
            ? 'bg-yellow-950/20 border-yellow-500/40 text-yellow-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Location
          </span>
          <MapPin
            className={`w-4 h-4 ${
              location.status === 'UNUSUAL' ? 'text-yellow-400' : 'text-emerald-400'
            }`}
          />
        </div>
        <div className="text-xs font-bold font-cyber truncate">{location.label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          {location.details}
        </div>
      </div>

      {/* 3. Beneficiary */}
      <div
        id="sec-card-beneficiary"
        className={`p-3 rounded-xl border transition-all ${
          beneficiary.status === 'NEW_BENEFICIARY'
            ? 'bg-yellow-950/20 border-yellow-500/40 text-yellow-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Beneficiary
          </span>
          {beneficiary.status === 'NEW_BENEFICIARY' ? (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          ) : (
            <UserCheck className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="text-xs font-bold font-cyber truncate">{beneficiary.label}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          {beneficiary.details}
        </div>
      </div>

      {/* 4. JARVIS Protection */}
      <div
        id="sec-card-protection"
        className="p-3 rounded-xl border bg-cyan-950/20 border-cyan-500/30 text-cyan-200"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider">
            JARVIS Protection
          </span>
          <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-xs font-bold font-cyber truncate text-cyan-300">
          {protection.label}
        </div>
        <div className="text-[11px] text-cyan-300/60 mt-0.5 truncate font-mono">
          ML Guardian Active
        </div>
      </div>
    </div>
  );
};
