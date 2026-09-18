import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Terminal,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Pause,
  Check,
  AlertOctagon,
  User,
  Smartphone,
  MapPin,
  Clock,
  Activity,
  Send,
  Zap,
} from 'lucide-react';
import { getInvestigationDetails, takeAdminAction } from '../services/api';
import { InvestigationData } from '../types/transaction';
import { RiskScore } from '../components/RiskScore';
import { RiskSignal } from '../components/RiskSignal';
import { AIExplanation } from '../components/AIExplanation';
import { NetworkGraph } from '../components/NetworkGraph';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const AdminInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InvestigationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getInvestigationDetails(id || 'TXN-2026-0918-7842');
        setData(res);
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAction = async (action: 'APPROVE' | 'HOLD' | 'FRAUD') => {
    if (!data) return;
    setIsProcessingAction(true);
    try {
      const res = await takeAdminAction(data.transaction.transaction_id, action, `Action applied by SOC analyst.`);
      setActionSuccess(res.message);
      // Update local state
      setData({
        ...data,
        transaction: {
          ...data.transaction,
          status: action === 'APPROVE' ? 'APPROVED' : action === 'HOLD' ? 'HELD' : 'HELD',
          action: action === 'APPROVE' ? 'APPROVE' : 'HOLD',
        },
      });
    } catch {
      // Handled
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-mono text-xs">
        Loading forensic graph and signal telemetry for case {id}...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-cyber text-slate-200">Investigation Case Not Found</h2>
        <button
          onClick={() => navigate('/admin')}
          className="text-xs font-mono text-purple-400 hover:underline"
        >
          Return to SOC Center
        </button>
      </div>
    );
  }

  const { transaction, velocity, network_graph, risk_signals } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="jarvis-soc-investigation-page">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-purple-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SOC Incident Queue</span>
      </button>

      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-cyber tracking-wide text-slate-100">
              Security Investigation: {transaction.transaction_id}
            </h1>
            <StatusBadge type="status" status={transaction.status} />
            <StatusBadge type="risk" riskLevel={transaction.risk_level} />
          </div>
          <p className="text-xs font-mono text-purple-300/80 mt-1">
            Forensic Dossier · Opened {formatDate(transaction.date)} · Target: {transaction.beneficiary}
          </p>
        </div>

        {/* Action Confirmation Banner */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Analyst Action Decision Bar (Section 18) */}
      <div className="glass-panel rounded-2xl p-5 border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-cyber font-bold uppercase tracking-wider text-slate-300">
            SOC Analyst Recommended Intervention
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Manual override applies immediately to settlement queue and adjusts node trust weights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* APPROVE PAYMENT */}
          <button
            id="admin-approve-btn"
            disabled={isProcessingAction}
            onClick={() => handleAction('APPROVE')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>APPROVE PAYMENT</span>
          </button>

          {/* KEEP ON HOLD */}
          <button
            id="admin-hold-btn"
            disabled={isProcessingAction}
            onClick={() => handleAction('HOLD')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>KEEP ON HOLD</span>
          </button>

          {/* MARK AS FRAUD */}
          <button
            id="admin-fraud-btn"
            disabled={isProcessingAction}
            onClick={() => handleAction('FRAUD')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>MARK AS FRAUD</span>
          </button>
        </div>
      </div>

      {/* NetworkX Relationship Graph Visualization (Required Section 18) */}
      <NetworkGraph graphData={network_graph} />

      {/* Top Grid: Risk Gauge + Key Forensic Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center">
          <RiskScore
            score={transaction.risk_score}
            level={transaction.risk_level}
            action={transaction.action}
            size="lg"
            subtext="Calculated pre-flight risk"
          />
        </div>

        {/* Forensic Overview Details */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Forensic Metadata & Entity Telemetry</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Beneficiary Details</span>
              <span className="text-slate-200 font-bold block mt-0.5">{transaction.beneficiary}</span>
              <span className="text-[10px] text-cyan-400 truncate block">
                {transaction.beneficiary_account}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Amount & Method</span>
              <span className="text-slate-100 font-cyber font-bold block mt-0.5">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
              <span className="text-[10px] text-slate-400 block">{transaction.payment_method}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Device Fingerprint</span>
              <span className="text-slate-200 font-bold block mt-0.5 truncate">
                {transaction.device_id || 'DEV-A7F92K'}
              </span>
              <span className="text-[10px] text-red-400 block">Unrecognized Linux Machine</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Geolocation & Network</span>
              <span className="text-slate-200 font-bold block mt-0.5">
                {transaction.location || 'Chennai, India'}
              </span>
              <span className="text-[10px] text-red-400 block">1,850km distance drift</span>
            </div>
          </div>

          {/* Velocity metrics */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Velocity (1 hour): </span>
              <span className="text-slate-200 font-bold">{velocity.transactions_last_hour} txns</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Hourly Spend: </span>
              <span className="text-slate-200 font-bold">
                {formatCurrency(velocity.total_amount_last_hour, 'INR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span>Rapid Sequence: </span>
              <span className="font-bold">{velocity.rapid_sequence_flag ? 'FLAGGED' : 'NORMAL'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider">
          Flagged Risk Signals ({risk_signals.length})
        </h3>
        <div className="space-y-2.5">
          {risk_signals.map((sig, idx) => (
            <RiskSignal key={sig.id || idx} signal={sig} index={idx} />
          ))}
        </div>
      </div>

      {/* AI Explanation */}
      {transaction.ai_explanation && (
        <AIExplanation
          explanation={transaction.ai_explanation}
          modelBreakdown={transaction.model_breakdown}
        />
      )}
    </div>
  );
};
