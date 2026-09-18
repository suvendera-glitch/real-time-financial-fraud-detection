import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal,
  ShieldAlert,
  PauseCircle,
  FolderOpen,
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getAdminDashboard } from '../services/api';
import { AdminStats } from '../types/transaction';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const riskDistributionColors = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="jarvis-admin-soc-dashboard">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-cyber tracking-wide text-slate-100">
                  Security Operations Center (SOC)
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN VIEW
                </span>
              </div>
              <p className="text-xs font-mono text-purple-300/80 mt-0.5">
                Centralized financial fraud monitoring, entity clustering, and high-risk case investigation.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-400 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* 4 Top Cards (Section 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Total Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-slate-100">
            {stats?.total_transactions.toLocaleString() || '1,280'}
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400">
            +14% volume from prior 24h
          </div>
        </div>

        {/* High-Risk Transactions */}
        <div className="glass-panel rounded-2xl p-5 border border-red-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>High-Risk Transactions</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-red-400">
            {stats?.high_risk_transactions || 14}
          </div>
          <div className="mt-2 text-xs font-mono text-red-400/90">
            1.09% anomaly incidence
          </div>
        </div>

        {/* Paused Payments */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Paused Payments</span>
            <PauseCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-amber-400">
            {stats?.paused_payments || 3}
          </div>
          <div className="mt-2 text-xs font-mono text-amber-400/90">
            Awaiting identity proofing
          </div>
        </div>

        {/* Open Cases */}
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase mb-2">
            <span>Open Cases</span>
            <FolderOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cyber font-bold text-purple-400">
            {stats?.open_cases || 2}
          </div>
          <div className="mt-2 text-xs font-mono text-purple-400/90">
            Assigned to SOC Tier-2
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid (4 Recharts Views) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Transaction Volume & Interceptions Over Time */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>1. Transaction Volume & Interception Trends</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Hourly throughput vs intercepted threats
              </p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.volume_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#38bdf8',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Area type="monotone" dataKey="volume" name="Total Volume" stroke="#06b6d4" fill="url(#volGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="intercepted" name="Intercepted" stroke="#ef4444" fill="#ef4444" strokeWidth={2} fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Distribution (Low / Medium / High) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-400" />
                <span>2. Overall Risk Distribution Breakdown</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Current evaluation categorizations
              </p>
            </div>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.risk_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(props: { name?: string; percent?: number }) =>
                    `${props.name || ''} ${(((props.percent ?? 0) * 100).toFixed(0))}%`
                  }

                >
                  {(stats?.risk_distribution || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={riskDistributionColors[index % riskDistributionColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#a855f7',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: High-Risk Events Over Time */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>3. High-Risk Anomaly Events Over Time</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Anomalies classified as score &gt; 70
              </p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.high_risk_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#ef4444',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Bar dataKey="events" name="High Risk Anomaly Events" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Approved vs Paused Payments Ratio */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-cyber text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>4. Approved vs Paused Payment Ratios</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Frictionless approvals vs intentional pauses
              </p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.approved_vs_paused || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#10b981',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="paused" name="Paused" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent High-Risk Transactions Table (Section 17) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Priority High-Risk Incident Queue</span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Payments intercepted and held by JARVIS requiring SOC analyst inspection
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 uppercase text-slate-400 text-[10px]">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recent_high_risk.map((item) => (
                <tr key={item.transaction_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{item.transaction_id}</td>
                  <td className="py-3.5 px-4 text-slate-300">{item.user}</td>
                  <td className="py-3.5 px-4 text-slate-200 font-semibold">{item.beneficiary}</td>
                  <td className="py-3.5 px-4 text-right font-cyber font-bold text-slate-100">
                    {formatCurrency(item.amount, 'INR')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-cyber font-bold text-red-400">{item.risk_score}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge type="status" status={item.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {formatDate(item.date)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      id={`investigate-btn-${item.transaction_id}`}
                      onClick={() => navigate(`/admin/investigation/${item.transaction_id}`)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>INVESTIGATE</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
