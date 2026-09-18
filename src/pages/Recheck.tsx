import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Send,
  Lock,
  Download,
} from 'lucide-react';
import { recheckPayment, executeSimulatedTransfer } from '../services/api';
import { PaymentRequest, SimulatedTransferResponse, RecheckResponse } from '../types/payment';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const Recheck: React.FC = () => {
  const navigate = useNavigate();
  const [rechecking, setRechecking] = useState(true);
  const [recheckData, setRecheckData] = useState<RecheckResponse | null>(null);
  const [transferReceipt, setTransferReceipt] = useState<SimulatedTransferResponse | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    const rawPayment = sessionStorage.getItem('jarvis_pending_payment');
    if (rawPayment) {
      try {
        setPendingPayment(JSON.parse(rawPayment));
      } catch {}
    }

    const token = sessionStorage.getItem('jarvis_verified_token') || 'VTK-DEMO-VALID';

    const runRecheck = async () => {
      setRechecking(true);
      try {
        // Run post-verification recheck
        const res = await recheckPayment({
          transaction_id: 'TXN-2026-0918-7842',
          verification_token: token,
        });
        setRecheckData(res);
      } catch (err) {
        // Fallback
      } finally {
        setRechecking(false);
      }
    };

    runRecheck();
  }, []);

  const handleCompleteSimulatedTransfer = async () => {
    if (!recheckData) return;
    try {
      const res = await executeSimulatedTransfer(recheckData.transaction_id);
      setTransferReceipt(res);
    } catch {
      // Handled
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6" id="jarvis-recheck-page">
      {/* Step Indicator */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          1. Paused
        </span>
        <span className="text-slate-600">→</span>
        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          2. Verified (2FA)
        </span>
        <span className="text-slate-600">→</span>
        <span className="text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
          <Cpu className="w-4 h-4 text-cyan-400" />
          3. AI Recheck
        </span>
        <span className="text-slate-600">→</span>
        <span className={transferReceipt ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
          4. Respond
        </span>
      </div>

      {/* Main Recheck Card */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        {/* Verification Success Toast */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-100">✓ Identity Verified: </span>
            Strong hardware authentication confirmed user intent.
          </div>
        </div>

        {rechecking ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 animate-spin">
              <Cpu className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-cyber text-slate-100">
              JARVIS is rechecking the payment...
            </h2>
            <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
              Recalculating contextual risk models and updating device trust baseline...
            </p>
          </div>
        ) : recheckData ? (
          <div className="space-y-6">
            {/* Header Result */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Adaptive Re-evaluation Completed
              </div>
              <h1 className="text-2xl sm:text-3xl font-cyber font-bold text-slate-100 tracking-wide">
                ✓ PAYMENT CLEARED
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Post-verification risk score meets authorized threshold.
              </p>
            </div>

            {/* Before vs After Risk Score Visual Comparison (Heart of the demo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-red-500/30 text-center relative overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Before Verification
                </div>
                <div className="text-4xl font-cyber font-bold text-red-400 my-2">
                  {recheckData.previous_risk_score}
                  <span className="text-sm font-mono text-slate-500">/100</span>
                </div>
                <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800 inline-block">
                  HIGH RISK (PAUSED)
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-2">
                  Unverified device & geographic anomaly
                </p>
              </div>

              {/* After */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1 flex items-center justify-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>After Verification</span>
                </div>
                <div className="text-4xl font-cyber font-bold text-emerald-400 my-2">
                  {recheckData.current_risk_score}
                  <span className="text-sm font-mono text-slate-500">/100</span>
                </div>
                <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 inline-block">
                  LOW RISK (CLEARED)
                </div>
                <p className="text-[11px] font-mono text-emerald-400 mt-2">
                  Identity corroborated · Intent verified
                </p>
              </div>
            </div>

            {/* Recheck Explanation from Model */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-bold block mb-1">JARVIS Adaptive Reasoning:</span>
              {recheckData.explanation}
            </div>


            {/* Target details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Beneficiary</span>
                <span className="text-slate-200 font-bold truncate block">
                  {pendingPayment?.beneficiary_name || 'Alex V. (BEN-77421)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Amount</span>
                <span className="text-slate-200 font-bold block">
                  {formatCurrency(pendingPayment?.amount || 75000, 'INR')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Method</span>
                <span className="text-slate-200 font-bold block">UPI</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Protection</span>
                <span className="text-emerald-400 font-bold block">Authorized</span>
              </div>
            </div>

            {/* CTA Button: COMPLETE SIMULATED TRANSFER */}
            {!transferReceipt ? (
              <div className="pt-2">
                <button
                  id="complete-simulated-transfer-btn"
                  onClick={handleCompleteSimulatedTransfer}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-cyber font-bold tracking-wider text-base transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Send className="w-5 h-5 text-slate-950" />
                  <span>COMPLETE SIMULATED TRANSFER</span>
                </button>
                <div className="text-center text-[11px] font-mono text-slate-400 mt-2">
                  Protected by JARVIS AI · Safe Sandbox Settlement
                </div>
              </div>
            ) : (
              /* Simulated Receipt Component */
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1c1f] to-[#071118] border border-emerald-500/50 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-cyber text-emerald-300">
                        Transfer Simulation Successful
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        {transferReceipt.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    SETTLED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Ref:</span>
                    <span className="text-cyan-400 font-bold">{transferReceipt.simulated_txn_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-300">{formatDate(transferReceipt.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Guarantee:</span>
                    <span className="text-emerald-400 font-bold">Protected by JARVIS AI</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold border border-slate-700 text-center transition-colors"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-mono font-bold border border-purple-500/40 text-center transition-colors"
                  >
                    View in SOC Audit Log
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
