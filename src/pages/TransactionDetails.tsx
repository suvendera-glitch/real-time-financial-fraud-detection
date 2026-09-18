import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Smartphone,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Terminal,
} from 'lucide-react';
import { getTransactionDetails } from '../services/api';
import { Transaction } from '../types/transaction';
import { StatusBadge } from '../components/StatusBadge';
import { RiskScore } from '../components/RiskScore';
import { RiskSignal } from '../components/RiskSignal';
import { AIExplanation } from '../components/AIExplanation';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getTransactionDetails(id);
        setTxn(data);
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-mono text-xs">
        Loading cryptographic telemetry for transaction {id}...
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold font-cyber text-slate-200">Transaction Not Found</h2>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-mono text-cyan-400 hover:underline"
        >
          Return to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="jarvis-transaction-details-page">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-cyber tracking-wide text-slate-100">
              {txn.transaction_id}
            </h1>
            <StatusBadge type="status" status={txn.status} />
            <StatusBadge type="risk" riskLevel={txn.risk_level} />
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Recorded at {formatDate(txn.date)} · Intercepted by JARVIS Engine
          </p>
        </div>

        <button
          onClick={() => navigate(`/admin/investigation/${txn.transaction_id}`)}
          className="py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <Terminal className="w-4 h-4" />
          <span>Open SOC Investigation</span>
        </button>
      </div>

      {/* Top Grid: Payment Info + Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Information */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Payment Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Beneficiary Name</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">{txn.beneficiary}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Account / UPI</span>
              <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{txn.beneficiary_account}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Transaction Amount</span>
              <span className="text-lg font-cyber font-bold text-slate-100 mt-0.5 block">
                {formatCurrency(txn.amount, txn.currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Payment Method</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 block">{txn.payment_method}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Device Fingerprint</span>
              <span className="text-sm font-bold text-slate-300 mt-0.5 block truncate">
                {txn.device_id || 'DEV-A7F92K (Unknown Linux)'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Origin Location</span>
              <span className="text-sm font-bold text-slate-300 mt-0.5 block">
                {txn.location || 'Chennai, India'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Gauge Card */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col items-center justify-center">
          <RiskScore
            score={txn.risk_score}
            level={txn.risk_level}
            action={txn.action}
            size="lg"
          />
        </div>
      </div>

      {/* Detected Risk Signals */}
      {txn.signals && txn.signals.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Detected Risk Signals ({txn.signals.length})</span>
          </h3>

          <div className="space-y-2.5">
            {txn.signals.map((sig, idx) => (
              <RiskSignal key={sig.id || idx} signal={sig} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* AI Explanation Card */}
      {txn.ai_explanation && (
        <AIExplanation
          explanation={txn.ai_explanation}
          modelBreakdown={txn.model_breakdown}
        />
      )}

      {/* Decision & Verification Audit Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification History */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Verification Audit History</span>
          </h3>

          {txn.verification_history && txn.verification_history.length > 0 ? (
            <div className="space-y-2">
              {txn.verification_history.map((vh, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs space-y-2"
                >
                  <div className="flex justify-between">
                    <span className="text-slate-500">Method / Step:</span>
                    <span className="text-slate-200 font-bold">{vh.step}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Result:</span>
                    <span className="text-emerald-400 font-bold">{vh.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-300">{formatDate(vh.timestamp)}</span>
                  </div>
                  {vh.details && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      {vh.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 font-mono text-xs text-slate-500">
              No step-up verification required for this transaction.
            </div>
          )}

        </div>

        {/* Decision Lifecycle Flow */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold font-cyber text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Lifecycle Stages</span>
          </h3>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-emerald-400">✓</span>
              <span>Payment Initiated by Client</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-emerald-400">✓</span>
              <span>JARVIS Interception & Signal Extraction</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className={txn.risk_level === 'HIGH' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {txn.risk_level === 'HIGH' ? '🚨 Action: PAYMENT PAUSED' : '✓ Action: APPROVED'}
              </span>
            </div>
            {txn.status === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>✓</span>
                <span>Post-Verification Cleared & Settled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
