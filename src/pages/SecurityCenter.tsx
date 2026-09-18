import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  MapPin,
  Lock,
  KeyRound,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  Radio,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { getSecurityStatus } from '../services/api';
import { SecurityStatusResponse } from '../types/risk';
import { formatDate } from '../utils/formatDate';

export const SecurityCenter: React.FC = () => {
  const [secData, setSecData] = useState<SecurityStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getSecurityStatus();
      setSecData(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="jarvis-security-center-page">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wide text-slate-100">
              JARVIS Security Center
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-sm font-mono text-cyan-400 mt-1">
            Real-time defensive status, contextual telemetry baselines, and active protections.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Security Health Indicator Bar */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-r from-[#071321] via-[#091629] to-[#071321]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">Security Health Score</div>
              <div className="text-2xl sm:text-3xl font-cyber font-bold text-slate-100 flex items-center gap-3">
                <span>{secData?.health_score || 94}</span>
                <span className="text-sm font-mono text-slate-400">/100</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  EXCELLENT
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Threat Mitigation: </span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Interception Latency: </span>
              <span className="text-cyan-400 font-bold">42ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core Security Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. AI Protection */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Protection</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Model Engine:</span>
              <span className="text-slate-200">XGBoost + IsoForest</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Graph Inference:</span>
              <span className="text-slate-200">NetworkX 2-Hop</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pre-Flight Intercept:</span>
              <span className="text-emerald-400 font-bold">Enabled</span>
            </div>
          </div>
        </div>

        {/* 2. Device Security */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Device Security</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
              1 UNKNOWN
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Device:</span>
              <span className="text-slate-200 truncate max-w-[150px]">MacBook Pro M2 (Trusted)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last New Device:</span>
              <span className="text-red-400">DEV-A7F92K (Paused)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Biometric Keystore:</span>
              <span className="text-emerald-400">Bound</span>
            </div>
          </div>
        </div>

        {/* 3. Location Security */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Location Security</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              MONITORED
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Home Geofence:</span>
              <span className="text-slate-200">Bengaluru, IN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recent Ping:</span>
              <span className="text-slate-200">Chennai, IN (Drift)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Velocity Plausibility:</span>
              <span className="text-amber-400">Calculated</span>
            </div>
          </div>
        </div>

        {/* 4. Session Security */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Session Security</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              ENCRYPTED
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Session ID:</span>
              <span className="text-slate-300">SES-2026-X991</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">IP Reputation:</span>
              <span className="text-emerald-400">Clean (0.01 ASN)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Token Rotation:</span>
              <span className="text-slate-200">15m TTL</span>
            </div>
          </div>
        </div>

        {/* 5. Authentication & 2FA */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Authentication</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              MFA ACTIVE
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Adaptive Step-Up:</span>
              <span className="text-emerald-400">Enforced</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Demo OTP Code:</span>
              <span className="text-cyan-400 font-bold">123456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recovery Contacts:</span>
              <span className="text-slate-200">2 Configured</span>
            </div>
          </div>
        </div>

        {/* 6. Fraud Monitoring Baseline */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Fraud Baseline</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              STABLE
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Normal Avg Payment:</span>
              <span className="text-slate-200">₹4,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anomaly Ceiling:</span>
              <span className="text-slate-200">₹25,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Velocity Threshold:</span>
              <span className="text-slate-200">5 / hour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Timeline */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Security Audit Trail & Interception Timeline</span>
        </h3>

        <div className="space-y-3">
          {secData?.timeline.map((event, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{event.event}</span>
                  <span className="text-[10px] text-slate-500">{formatDate(event.time)}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
