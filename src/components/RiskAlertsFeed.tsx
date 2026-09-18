import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Play,
  Pause,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Smartphone,
  MapPin,
  Share2,
  TrendingUp,
  Zap,
  UserPlus,
  RefreshCw,
  Clock,
  Eye,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export type RiskSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SystemFlaggedAlert {
  id: string;
  transaction_id: string;
  timestamp: string; // relative or formatted
  dateObj: Date;
  beneficiary: string;
  beneficiary_account?: string;
  amount: number;
  currency: string;
  risk_score: number; // 0-100
  severity: RiskSeverity;
  status: 'PAUSED' | 'VERIFICATION' | 'APPROVED' | 'HELD';
  primary_reason: string;
  category: 'DEVICE' | 'LOCATION' | 'BENEFICIARY' | 'BEHAVIOR' | 'VELOCITY' | 'NETWORK';
  device_info?: string;
  location?: string;
  signals_count: number;
  ai_note?: string;
}

const INITIAL_ALERTS: SystemFlaggedAlert[] = [
  {
    id: 'ALT-7842',
    transaction_id: 'TXN-2026-0918-7842',
    timestamp: 'Just now',
    dateObj: new Date(Date.now() - 1000 * 15),
    beneficiary: 'Alex V. (BEN-77421)',
    beneficiary_account: 'UPI: alex7742@axisbank',
    amount: 75000,
    currency: 'INR',
    risk_score: 92,
    severity: 'HIGH',
    status: 'PAUSED',
    primary_reason: 'Unrecognized Linux Device + 1,850km Geo Drift + Velocity Spike',
    category: 'DEVICE',
    device_info: 'DEV-A7F92K (Unknown Chrome 124)',
    location: 'Chennai, India (1,850km from home geofence)',
    signals_count: 6,
    ai_note: 'Pre-settlement interception engaged. Risk score 92 exceeds policy threshold 70.',
  },
  {
    id: 'ALT-6210',
    transaction_id: 'TXN-2026-0918-6210',
    timestamp: '4m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 4),
    beneficiary: 'Cloud Hosting Corp (AWS)',
    beneficiary_account: 'acc_biz_99201',
    amount: 12400,
    currency: 'INR',
    risk_score: 42,
    severity: 'MEDIUM',
    status: 'VERIFICATION',
    primary_reason: 'Amount is 35% higher than 3-month subscription average',
    category: 'BEHAVIOR',
    device_info: 'DEV-MAC-881 (Trusted Hardware Token)',
    location: 'Bengaluru, India (Verified Home Geo)',
    signals_count: 2,
    ai_note: 'Moderate behavioral deviation. Step-up authorization challenge issued.',
  },
  {
    id: 'ALT-1184',
    transaction_id: 'TXN-2026-0916-1184',
    timestamp: '9m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 9),
    beneficiary: 'Anonymous Crypto Gateway',
    beneficiary_account: 'CRYPTO-SWAP-9011',
    amount: 140000,
    currency: 'INR',
    risk_score: 96,
    severity: 'HIGH',
    status: 'HELD',
    primary_reason: 'Tor Exit Node Proxy + Proximity to Confirmed Mule Cluster #420',
    category: 'NETWORK',
    device_info: 'DEV-PROXY-99 (Tor Exit Relay)',
    location: 'Zurich, Switzerland (Spoofed IP 185.220.101.5)',
    signals_count: 7,
    ai_note: 'Halted by SOC sanctions protocol. 2-hop linkage to blacklisted recipient ring.',
  },
  {
    id: 'ALT-4109',
    transaction_id: 'TXN-2026-0918-4109',
    timestamp: '14m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 14),
    beneficiary: 'Starbucks Roastery',
    beneficiary_account: 'UPI: sbux@icici',
    amount: 450,
    currency: 'INR',
    risk_score: 8,
    severity: 'LOW',
    status: 'APPROVED',
    primary_reason: 'Cryptographic enclave verified, recurring micro-merchant match',
    category: 'BENEFICIARY',
    device_info: 'DEV-MAC-881 (Cryptographic Enclave)',
    location: 'Bengaluru, India (Verified Home)',
    signals_count: 1,
    ai_note: 'Zero anomalous signals. Cleared for immediate frictionless settlement.',
  },
  {
    id: 'ALT-9021',
    transaction_id: 'TXN-2026-0917-9021',
    timestamp: '22m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 22),
    beneficiary: 'TechGadgets India Pvt Ltd',
    beneficiary_account: 'UPI: pay@techgadgets',
    amount: 18500,
    currency: 'INR',
    risk_score: 58,
    severity: 'MEDIUM',
    status: 'VERIFICATION',
    primary_reason: 'New merchant retail category with first high-ticket purchase in 180 days',
    category: 'BENEFICIARY',
    device_info: 'DEV-MAC-881 (Known Profile)',
    location: 'Bengaluru, India',
    signals_count: 3,
    ai_note: 'Challenged via out-of-band mobile biometric verification.',
  },
  {
    id: 'ALT-3391',
    transaction_id: 'TXN-2026-0915-3391',
    timestamp: '35m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 35),
    beneficiary: 'Overseas P2P Merchant',
    beneficiary_account: 'acc_escrow_44910',
    amount: 62000,
    currency: 'INR',
    risk_score: 79,
    severity: 'HIGH',
    status: 'PAUSED',
    primary_reason: 'SIM Swap Indicator + Rapid Sequence Velocity (11 transactions / hr)',
    category: 'VELOCITY',
    device_info: 'DEV-AND-482 (Recent SIM Switch)',
    location: 'Hyderabad, India',
    signals_count: 5,
    ai_note: 'Autonomous payment pause triggered. Secondary voice approval required.',
  },
  {
    id: 'ALT-3820',
    transaction_id: 'TXN-2026-0918-3820',
    timestamp: '48m ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 48),
    beneficiary: 'Uber India Mobility',
    beneficiary_account: 'UPI: uber.rides@hdfc',
    amount: 1200,
    currency: 'INR',
    risk_score: 12,
    severity: 'LOW',
    status: 'APPROVED',
    primary_reason: 'Verified GPS geofence + regular commute velocity baseline',
    category: 'LOCATION',
    device_info: 'DEV-MAC-881 (Paired)',
    location: 'Bengaluru, India',
    signals_count: 1,
    ai_note: 'Conforms to user habitual morning cadence.',
  },
  {
    id: 'ALT-5042',
    transaction_id: 'TXN-2026-0918-5042',
    timestamp: '1h ago',
    dateObj: new Date(Date.now() - 1000 * 60 * 60),
    beneficiary: 'Digital Marketing Cloud Sub',
    beneficiary_account: 'UPI: ads_billing@icici',
    amount: 24000,
    currency: 'INR',
    risk_score: 49,
    severity: 'MEDIUM',
    status: 'VERIFICATION',
    primary_reason: 'Corporate VPN gateway with dynamic IP rotation detected',
    category: 'NETWORK',
    device_info: 'DEV-MAC-881 (Corporate Profile)',
    location: 'Mumbai, India (VPN Exit)',
    signals_count: 3,
    ai_note: 'Verified against registered corporate employee IP ranges.',
  },
];

const SIMULATION_POOL: Omit<SystemFlaggedAlert, 'id' | 'timestamp' | 'dateObj'>[] = [
  {
    transaction_id: 'TXN-2026-0918-9182',
    beneficiary: 'QuickSwap Vault #819',
    beneficiary_account: 'UPI: quickvault81@kotak',
    amount: 82000,
    currency: 'INR',
    risk_score: 94,
    severity: 'HIGH',
    status: 'PAUSED',
    primary_reason: 'Rapid account draining attempt within 3 minutes of credential rotation',
    category: 'BEHAVIOR',
    device_info: 'DEV-WIN-902 (Unknown Windows Machine)',
    location: 'Kolkata, India',
    signals_count: 5,
    ai_note: 'Pre-settlement lock engaged. Velocity pattern matches automated script.',
  },
  {
    transaction_id: 'TXN-2026-0918-4412',
    beneficiary: 'Zara Online Flagship',
    beneficiary_account: 'UPI: zara.retail@hsbc',
    amount: 8900,
    currency: 'INR',
    risk_score: 34,
    severity: 'MEDIUM',
    status: 'VERIFICATION',
    primary_reason: 'Transaction triggered at unusual off-hours (03:14 AM local time)',
    category: 'BEHAVIOR',
    device_info: 'DEV-MAC-881 (Trusted)',
    location: 'Bengaluru, India',
    signals_count: 2,
    ai_note: 'Time-of-day behavioral anomaly scored by Isolation Forest.',
  },
  {
    transaction_id: 'TXN-2026-0918-3199',
    beneficiary: 'Amazon India Prime Retail',
    beneficiary_account: 'UPI: amazon.pay@axis',
    amount: 1899,
    currency: 'INR',
    risk_score: 11,
    severity: 'LOW',
    status: 'APPROVED',
    primary_reason: 'High-trust merchant with 100% genuine clearance history',
    category: 'BENEFICIARY',
    device_info: 'DEV-MAC-881 (Trusted)',
    location: 'Bengaluru, India',
    signals_count: 1,
    ai_note: 'Passes all multi-signal heuristic thresholds with zero friction.',
  },
  {
    transaction_id: 'TXN-2026-0918-7711',
    beneficiary: 'Offshore Gaming Ledger',
    beneficiary_account: 'acc_bet_99182',
    amount: 115000,
    currency: 'INR',
    risk_score: 97,
    severity: 'HIGH',
    status: 'HELD',
    primary_reason: 'High-risk unlicensed gaming gateway + suspicious beneficiary cluster',
    category: 'NETWORK',
    device_info: 'DEV-UNKNOWN-TOR',
    location: 'Curacao (Routed via Proxy)',
    signals_count: 6,
    ai_note: 'Intercepted and held under anti-money laundering (AML) heuristic filters.',
  },
  {
    transaction_id: 'TXN-2026-0918-2041',
    beneficiary: 'Airtel Broadband Fiber Bill',
    beneficiary_account: 'UPI: airtelbill@airtel',
    amount: 1199,
    currency: 'INR',
    risk_score: 7,
    severity: 'LOW',
    status: 'APPROVED',
    primary_reason: 'Recurring utility payment with verified payment mandate',
    category: 'BENEFICIARY',
    device_info: 'DEV-MAC-881 (Trusted Enclave)',
    location: 'Bengaluru, India',
    signals_count: 1,
    ai_note: 'Mandate match authenticated via NPCI recurring framework.',
  },
];

interface RiskAlertsFeedProps {
  className?: string;
  onSelectAlert?: (alert: SystemFlaggedAlert) => void;
}

export const RiskAlertsFeed: React.FC<RiskAlertsFeedProps> = ({
  className = '',
  onSelectAlert,
}) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SystemFlaggedAlert[]>(INITIAL_ALERTS);
  const [selectedSeverity, setSelectedSeverity] = useState<RiskSeverity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>('ALT-7842');
  const [lastPushedId, setLastPushedId] = useState<string | null>(null);
  const [tickerSpeed, setTickerSpeed] = useState<'normal' | 'fast'>('normal');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const simPoolIndexRef = useRef(0);

  // Function to push a newly generated real-time alert into the feed
  const pushNewAlert = (forcedSeverity?: RiskSeverity) => {
    const pool = forcedSeverity
      ? SIMULATION_POOL.filter((p) => p.severity === forcedSeverity)
      : SIMULATION_POOL;

    const baseTemplate =
      pool[simPoolIndexRef.current % pool.length] || SIMULATION_POOL[0];
    simPoolIndexRef.current += 1;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTxnId = `TXN-2026-0918-${randomSuffix}`;
    const newAlertId = `ALT-${randomSuffix}`;

    const newAlert: SystemFlaggedAlert = {
      ...baseTemplate,
      id: newAlertId,
      transaction_id: newTxnId,
      timestamp: 'Just now',
      dateObj: new Date(),
    };

    setAlerts((prev) => [newAlert, ...prev.slice(0, 24)]);
    setLastPushedId(newAlertId);

    // Flash glow timer
    setTimeout(() => {
      setLastPushedId((curr) => (curr === newAlertId ? null : curr));
    }, 2800);
  };

  // Real-time streaming interval
  useEffect(() => {
    if (!isStreaming || isHovered) return;

    const intervalTime = tickerSpeed === 'fast' ? 5500 : 9000;
    const interval = setInterval(() => {
      pushNewAlert();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isStreaming, isHovered, tickerSpeed]);

  // Filter alerts by severity and search term
  const filteredAlerts = alerts.filter((item) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || item.severity === selectedSeverity;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primary_reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesSearch;
  });

  // Severity counts
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length;
  const mediumCount = alerts.filter((a) => a.severity === 'MEDIUM').length;
  const lowCount = alerts.filter((a) => a.severity === 'LOW').length;

  const getCategoryIcon = (category: SystemFlaggedAlert['category']) => {
    switch (category) {
      case 'DEVICE':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'LOCATION':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'BENEFICIARY':
        return <UserPlus className="w-3.5 h-3.5" />;
      case 'BEHAVIOR':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'VELOCITY':
        return <Zap className="w-3.5 h-3.5" />;
      case 'NETWORK':
        return <Share2 className="w-3.5 h-3.5" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5" />;
    }
  };

  const getSeverityBadge = (severity: RiskSeverity, score: number) => {
    switch (severity) {
      case 'HIGH':
        return {
          label: 'HIGH SEVERITY (RED)',
          tag: 'CRITICAL',
          bg: 'bg-red-950/80',
          text: 'text-red-300',
          border: 'border-red-500/50',
          glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
          dot: 'bg-red-400',
          icon: ShieldAlert,
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM SEVERITY (YELLOW)',
          tag: 'ELEVATED',
          bg: 'bg-yellow-950/80',
          text: 'text-yellow-300',
          border: 'border-yellow-500/50',
          glow: 'shadow-[0_0_10px_rgba(234,179,8,0.25)]',
          dot: 'bg-yellow-400',
          icon: AlertTriangle,
        };
      case 'LOW':
        return {
          label: 'LOW SEVERITY (GREEN)',
          tag: 'NOMINAL',
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-300',
          border: 'border-emerald-500/50',
          glow: 'shadow-[0_0_10px_rgba(34,197,94,0.2)]',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
        };
    }
  };

  const handleInspect = (alert: SystemFlaggedAlert, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectAlert) {
      onSelectAlert(alert);
    }
    navigate(`/transactions/${alert.transaction_id}`);
  };

  return (
    <div
      id="dashboard-realtime-risk-alerts-feed"
      className={`glass-panel rounded-2xl border border-cyan-500/25 p-4 sm:p-6 relative overflow-hidden bg-gradient-to-b from-[#070e1c]/95 via-[#050a16]/95 to-[#040814]/98 shadow-[0_0_30px_rgba(6,182,212,0.12)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient radar glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

      {/* TOP HEADER: Title, Live Indicator, Summary Counters, Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-cyber text-slate-100 tracking-wide uppercase">
                  Real-Time Risk Alerts Feed
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isStreaming && !isHovered
                        ? 'bg-emerald-400 animate-ping'
                        : 'bg-amber-400'
                    }`}
                  />
                  {isStreaming && !isHovered ? 'LIVE STREAMING' : 'PAUSED ON HOVER'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Continuous pre-settlement telemetry evaluating transactions against ML heuristic thresholds
              </p>
            </div>
          </div>
        </div>

        {/* Severity Summary Stat Badges & Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* High Severity Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[11px] font-bold">High:</span>
            <span className="font-cyber font-bold text-xs">{highCount}</span>
          </div>

          {/* Medium Severity Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/60 border border-yellow-500/40 text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-[11px] font-bold">Medium (Yellow):</span>
            <span className="font-cyber font-bold text-xs">{mediumCount}</span>
          </div>

          {/* Low Severity Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold">Low (Green):</span>
            <span className="font-cyber font-bold text-xs">{lowCount}</span>
          </div>

          {/* Streaming Play/Pause Toggle */}
          <button
            id="alerts-feed-toggle-streaming-btn"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              isStreaming
                ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-cyan-300'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
            }`}
            title={isStreaming ? 'Pause streaming feed' : 'Resume live stream'}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="text-[10px] hidden sm:inline">{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Simulate New Alert Trigger */}
          <button
            id="alerts-feed-simulate-alert-btn"
            onClick={() => pushNewAlert()}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            title="Inject simulated incoming transaction"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Simulate Flag</span>
          </button>
        </div>
      </div>

      {/* CONTINUOUS TICKER MARQUEE (TOP GLANCE STRIP) */}
      <div className="py-2 px-3 my-3 rounded-xl bg-[#040813] border border-slate-800/80 flex items-center gap-3 overflow-hidden text-xs font-mono relative">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold shrink-0 text-[11px] uppercase tracking-wider border-r border-slate-800 pr-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Ticker</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
            {alerts.slice(0, 6).map((item) => {
              const badge = getSeverityBadge(item.severity, item.risk_score);
              return (
                <div
                  key={`ticker-${item.id}`}
                  onClick={() => setExpandedAlertId(item.id)}
                  className="inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                  />
                  <span className={`text-[10px] font-bold ${badge.text}`}>
                    [{item.severity}]
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {item.transaction_id}
                  </span>
                  <span className="text-slate-400">
                    {formatCurrency(item.amount, item.currency)} → {item.beneficiary}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Risk: {item.risk_score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 font-mono text-xs">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
          <button
            id="alerts-filter-all-btn"
            onClick={() => setSelectedSeverity('ALL')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              selectedSeverity === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            id="alerts-filter-high-btn"
            onClick={() => setSelectedSeverity('HIGH')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSeverity === 'HIGH'
                ? 'bg-red-950/90 text-red-300 font-bold border border-red-500/60 shadow-sm'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>High ({highCount})</span>
          </button>
          <button
            id="alerts-filter-medium-btn"
            onClick={() => setSelectedSeverity('MEDIUM')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSeverity === 'MEDIUM'
                ? 'bg-yellow-950/90 text-yellow-300 font-bold border border-yellow-500/60 shadow-sm'
                : 'text-slate-400 hover:text-yellow-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span>Medium ({mediumCount})</span>
          </button>
          <button
            id="alerts-filter-low-btn"
            onClick={() => setSelectedSeverity('LOW')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedSeverity === 'LOW'
                ? 'bg-emerald-950/90 text-emerald-300 font-bold border border-emerald-500/60 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Low ({lowCount})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search txn ID, beneficiary, flag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-slate-200 placeholder-slate-500 text-xs focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* REAL-TIME SCROLLING ALERTS FEED LIST */}
      <div
        ref={scrollContainerRef}
        id="risk-alerts-scrollable-feed"
        className="space-y-3 max-h-[460px] overflow-y-auto pr-1 select-none custom-scrollbar"
      >
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-400">
            No risk alerts match current criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const badge = getSeverityBadge(alert.severity, alert.risk_score);
            const isExpanded = expandedAlertId === alert.id;
            const isNew = lastPushedId === alert.id;
            const SeverityIcon = badge.icon;

            return (
              <div
                key={alert.id}
                onClick={() =>
                  setExpandedAlertId(isExpanded ? null : alert.id)
                }
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isNew
                    ? 'ring-2 ring-cyan-400 bg-cyan-950/30'
                    : isExpanded
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-[#060b17]/85 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Visual side accent border depending on severity */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    alert.severity === 'HIGH'
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                  }`}
                />

                {/* Main Alert Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Severity Icon Badge */}
                    <div
                      className={`p-2 rounded-xl border shrink-0 ${badge.bg} ${badge.border} ${badge.text} ${badge.glow}`}
                    >
                      <SeverityIcon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-cyber font-bold text-slate-100 text-sm tracking-wide">
                          {alert.transaction_id}
                        </span>

                        {/* Severity Level Pill */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${
                              alert.severity === 'HIGH' ? 'animate-pulse' : ''
                            }`}
                          />
                          <span>{badge.label}</span>
                        </span>

                        {/* Status tag */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                            alert.status === 'PAUSED'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : alert.status === 'HELD'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : alert.status === 'VERIFICATION'
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {alert.status}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>

                      {/* Beneficiary & Amount line */}
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                        <span className="text-slate-200 font-semibold">
                          {alert.beneficiary}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-cyan-300 font-bold">
                          {formatCurrency(alert.amount, alert.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Risk Score Pill & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 font-mono">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">
                        Composite Risk
                      </div>
                      <div
                        className={`text-lg font-cyber font-extrabold ${badge.text}`}
                      >
                        {alert.risk_score}
                        <span className="text-xs font-mono text-slate-500 font-normal">
                          /100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleInspect(alert, e)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="View complete transaction breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>

                      <div className="p-1 text-slate-400 hover:text-slate-200">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Flag Banner */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <span className="p-1 rounded bg-slate-900 text-cyan-400 shrink-0 border border-slate-800">
                      {getCategoryIcon(alert.category)}
                    </span>
                    <span className="text-slate-300 font-medium truncate">
                      {alert.primary_reason}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 uppercase">
                    {alert.signals_count} signals evaluated
                  </span>
                </div>

                {/* EXPANDED INLINE TELEMETRY & XAI DETAILS */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 font-mono text-xs space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {alert.device_info && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">
                            Hardware Fingerprint
                          </span>
                          <span className="text-slate-200 font-medium">
                            {alert.device_info}
                          </span>
                        </div>
                      )}

                      {alert.location && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">
                            Origin Geofence
                          </span>
                          <span className="text-slate-200 font-medium">
                            {alert.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {alert.ai_note && (
                      <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-[11px] leading-relaxed flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-cyan-300">JARVIS AI Engine Note: </span>
                          <span>{alert.ai_note}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[10px] text-slate-500">
                        Category: <span className="text-slate-300 uppercase">{alert.category}</span> · Engine: XGBoost + Isolation Forest
                      </div>

                      <div className="flex items-center gap-2">
                        {alert.status === 'PAUSED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/verify');
                            }}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-slate-950 font-cyber font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] cursor-pointer"
                          >
                            <span>Authenticate & Release</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleInspect(alert, e)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Full Investigation</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER BAR: Feed status & Help */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Real-time heuristic buffer: {filteredAlerts.length} transactions monitored</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/transactions')}
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All Transaction Logs</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAlertsFeed;
