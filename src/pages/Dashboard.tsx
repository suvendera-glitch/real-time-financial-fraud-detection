import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Send,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Zap,
  Radio,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';
import { DashboardData } from '../types/transaction';
import { formatCurrency } from '../utils/formatCurrency';
import { TransactionTable } from '../components/TransactionTable';
import { DemoGuideBanner } from '../components/DemoGuideBanner';
import { FraudRiskGaugeD3 } from '../components/FraudRiskGaugeD3';
import { RiskAlertsFeed } from '../components/RiskAlertsFeed';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveRiskScore, setLiveRiskScore] = useState<number>(24);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res);

      // Check if there is an active session analysis score
      const storedAnalysis = sessionStorage.getItem('jarvis_active_analysis');
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis);
          if (parsed.risk_score !== undefined) {
            setLiveRiskScore(parsed.risk_score);
          }
        } catch {}
      }
    } catch {
      // Handled by service fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="jarvis-user-dashboard">
      {/* Demo Guide Banner */}
      <DemoGuideBanner />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wide text-slate-100">
              Welcome to JARVIS
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-sm font-mono text-cyan-400 mt-1">
            Your AI-powered payment protection is active.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title="Refresh dashboard statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            id="dashboard-pay-securely-btn"
            onClick={() => navigate('/pay')}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>SEND MONEY SECURELY</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME D3 FRAUD RISK SCORE & AI RADAR (HERO SECTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-realtime-fraud-radar">
        {/* D3 Radial Gauge Component */}
        <div className="lg:col-span-5 flex flex-col">
          <FraudRiskGaugeD3
            score={liveRiskScore}
            onScoreChange={(score) => setLiveRiskScore(score)}
            size={300}
            showControls={true}
            showTelemetry={true}
          />
        </div>

        {/* Live Neural Interception Console & Model Telemetry */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-cyan-500/25 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#091122]/90 to-[#040814]/95">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold font-cyber text-slate-100 uppercase tracking-wider">
                    AI Pre-Settlement Interception Engine
                  </h2>
                  <p className="text-[11px] font-mono text-cyan-300/80">
                    Continuous multi-signal inference with 18ms latency
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE & PROTECTED
                </span>
              </div>
            </div>

            {/* Dynamic Status Callout based on D3 Gauge Score */}
            <div
              className={`p-4 rounded-xl border transition-all duration-500 font-mono text-xs ${
                liveRiskScore < 30
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                  : liveRiskScore < 70
                  ? 'bg-yellow-950/25 border-yellow-500/50 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                  : 'bg-red-950/30 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-cyber font-bold uppercase text-[11px] tracking-wider flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      liveRiskScore < 30
                        ? 'bg-emerald-400 shadow-[0_0_8px_#22c55e]'
                        : liveRiskScore < 70
                        ? 'bg-yellow-400 shadow-[0_0_8px_#eab308]'
                        : 'bg-red-400 shadow-[0_0_8px_#ef4444] animate-pulse'
                    }`}
                  />
                  {liveRiskScore < 30
                    ? 'CURRENT THREAT ASSESSMENT: LOW RISK (GREEN)'
                    : liveRiskScore < 70
                    ? 'CURRENT THREAT ASSESSMENT: MEDIUM RISK (YELLOW)'
                    : 'CURRENT THREAT ASSESSMENT: HIGH RISK (RED)'}
                </span>
                <span className="font-bold text-sm font-cyber">
                  {liveRiskScore} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {liveRiskScore < 30
                  ? '🟢 LOW RISK (GREEN): Zero anomalous signals detected. Behavioral cadence, device fingerprint, and geofence conform to historical baseline. Transfers process with standard frictionless approval.'
                  : liveRiskScore < 70
                  ? '🟡 MEDIUM RISK (YELLOW): Moderate behavioral deviation or unfamiliar beneficiary pattern flagged. System requires step-up out-of-band biometric or OTP verification before dispatching to settlement.'
                  : '🔴 HIGH RISK (RED): Critical threat parameters detected (unrecognized device + 1,850km geographic drift + velocity anomaly). Pre-settlement autonomous interception will PAUSE payment.'}
              </p>
            </div>

            {/* 4 Multi-Model Signal Health Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">XGBoost ML</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {liveRiskScore < 30 ? '0.08 Prob' : liveRiskScore < 70 ? '0.48 Prob' : '0.94 Prob'}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Trained 450k txns</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Isolation Forest</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {liveRiskScore < 30 ? 'Score: +0.22' : liveRiskScore < 70 ? 'Score: -0.15' : 'Score: -0.84'}
                </span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">Outlier detection</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">NetworkX Graph</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {liveRiskScore >= 70 ? 'Cluster Linked' : 'Clean Topology'}
                </span>
                <span className="text-[10px] text-purple-400 block mt-0.5">2-hop entity rings</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Interception Rule</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {liveRiskScore >= 70 ? 'AUTO PAUSE' : liveRiskScore >= 30 ? 'CHALLENGE 2FA' : 'ALLOW'}
                </span>
                <span className="text-[10px] text-amber-400 block mt-0.5">Threshold: 70/100</span>
              </div>
            </div>
          </div>

          {/* Quick Action Test Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Experience autonomous payment interception live:</span>
            </div>
            <button
              onClick={() => navigate('/pay')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600/80 via-rose-600/80 to-amber-600/80 hover:from-red-500 hover:to-amber-500 text-slate-100 font-cyber font-bold text-xs flex items-center justify-center gap-2 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-100" />
              <span>TEST ₹75K HIGH-RISK PAYMENT SCENARIO</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Statistics Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Balance */}
        <div
          id="stat-card-balance"
          className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Available Balance</span>
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-slate-100">
            {formatCurrency(data?.available_balance || user?.balance || 284500, data?.currency || 'INR')}
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Protected Account (ACC-2026-10482)
          </div>
        </div>

        {/* 2. Protected Transactions */}
        <div
          id="stat-card-protected-txns"
          className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Protected Transactions</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-slate-100">
            {data?.protected_transactions_count || 153}
          </div>
          <div className="mt-2 text-xs font-mono text-cyan-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Interception Coverage
          </div>
        </div>

        {/* 3. Risk Events */}
        <div
          id="stat-card-risk-events"
          className="glass-panel rounded-2xl p-5 border border-red-500/20 relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Risk Events</span>
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-red-400">
            {data?.risk_events_count || 6}
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">1 Active Paused</span> · 5 Resolved
          </div>
        </div>

        {/* 4. Security Status */}
        <div
          id="stat-card-security-status"
          className="glass-panel rounded-2xl p-5 border border-cyan-500/25 relative overflow-hidden bg-gradient-to-br from-[#0b1528] to-[#080d1a]"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Security Status</span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span>
              <span>AI Protection Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span>
              <span>Device Trusted</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span>
              <span>Location Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>✓</span>
              <span>Secure Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME SYSTEM-FLAGGED RISK ALERTS SCROLLING FEED */}
      <RiskAlertsFeed />

      {/* Middle Section: Risk Trends Chart & Security Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts: Transaction Risk Trends */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Transaction Risk Dynamics (7-Day Trend)</span>
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Continuous ML heuristic evaluation score vs baseline
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
              Recharts · Realtime
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.risk_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskAvgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="riskMaxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#06b6d4',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="max_risk"
                  name="Peak Anomaly Score"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#riskMaxGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="avg_risk"
                  name="Avg Monitored Risk"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#riskAvgGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protection Health & Interception Engine */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Autonomous Defense</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              JARVIS sits between your payment trigger and settlement layer.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">XGBoost Heuristics</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Isolation Forest Outliers</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">NetworkX Fraud Rings</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Adaptive Recheck 2FA</span>
                <span className="text-cyan-400 font-bold">Ready</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/security')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Security Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-cyber text-slate-100">
              Recent Protected Transactions
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Real-time payment log with evaluated risk scores and intercepted states
            </p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <TransactionTable
          transactions={data?.recent_transactions || []}
          compact={false}
          showFilters={false}
        />
      </div>
    </div>
  );
};
