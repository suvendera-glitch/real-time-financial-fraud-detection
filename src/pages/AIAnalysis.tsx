import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { analyzePayment, executeSimulatedTransfer } from '../services/api';
import { PaymentRequest, SimulatedTransferResponse } from '../types/payment';
import { PaymentAnalysisResponse } from '../types/risk';
import { LoadingAnalysis } from '../components/LoadingAnalysis';
import { RiskScore } from '../components/RiskScore';
import { RiskSignal } from '../components/RiskSignal';
import { AIExplanation } from '../components/AIExplanation';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const AIAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<PaymentAnalysisResponse | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PaymentRequest | null>(null);
  const [simulatedComplete, setSimulatedComplete] = useState<SimulatedTransferResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('jarvis_pending_payment');
    if (!raw) {
      // Default fallback payload for demo purposes if opened directly
      const defaultPayload: PaymentRequest = {
        beneficiary_name: 'Alex V. (BEN-77421)',
        account_upi_id: 'alex7742@axisbank',
        amount: 75000,
        payment_description: 'Urgent vendor settlement',
        payment_method: 'UPI',
        is_new_device: true,
        is_new_location: true,
        is_new_beneficiary: true,
        velocity_count: 8,
      };
      setPendingPayment(defaultPayload);
      runAnalysis(defaultPayload);
    } else {
      try {
        const parsed = JSON.parse(raw);
        setPendingPayment(parsed);
        runAnalysis(parsed);
      } catch {
        navigate('/pay');
      }
    }
  }, [navigate]);

  const runAnalysis = async (payload: PaymentRequest) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzePayment(payload);
      setAnalysisResult(result);
      // Store in session storage for downstream screens
      sessionStorage.setItem('jarvis_active_analysis', JSON.stringify(result));
    } catch (err: any) {
      setError(err?.message || 'JARVIS analysis pipeline could not connect to telemetry.');
    }
  };

  const handleAnalysisSequenceComplete = () => {
    setIsAnalyzing(false);
    // If high risk, redirect to the specialized 🚨 PAYMENT PAUSED alert page (/risk-alert)
    if (analysisResult && analysisResult.risk_level === 'HIGH') {
      setTimeout(() => {
        navigate('/risk-alert');
      }, 400);
    }
  };

  const handleCompleteTransfer = async () => {
    if (!analysisResult) return;
    try {
      const res = await executeSimulatedTransfer(analysisResult.transaction_id);
      setSimulatedComplete(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to simulate transfer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6" id="jarvis-ai-analysis-screen">
      {/* Loading Sequence State */}
      {isAnalyzing ? (
        <LoadingAnalysis onComplete={handleAnalysisSequenceComplete} durationMs={2800} />
      ) : analysisResult ? (
        <div className="space-y-6">
          {/* Header Banner according to Risk Level */}
          {analysisResult.risk_level === 'LOW' && (
            <div className="glass-panel-success rounded-2xl p-6 border border-emerald-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-cyber font-bold text-emerald-300">
                    ✓ LOW RISK (GREEN) · PAYMENT APPROVED
                  </h2>
                  <p className="text-xs font-mono text-slate-300 mt-1">
                    JARVIS found zero anomalous signals. Safe baseline verified.
                  </p>
                </div>
              </div>

              {!simulatedComplete ? (
                <button
                  id="complete-transfer-btn"
                  onClick={handleCompleteTransfer}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-cyber font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>COMPLETE TRANSFER</span>
                </button>
              ) : (
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  ✓ TRANSFER COMPLETED
                </span>
              )}
            </div>
          )}

          {analysisResult.risk_level === 'MEDIUM' && (
            <div className="glass-panel rounded-2xl p-6 border border-yellow-500/40 bg-yellow-950/25 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(234,179,8,0.15)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-cyber font-bold text-yellow-300">
                    ⚠ MEDIUM RISK (YELLOW) · VERIFICATION REQUIRED
                  </h2>
                  <p className="text-xs font-mono text-slate-300 mt-1">
                    JARVIS detected unusual activity or unfamiliar beneficiary. Additional 2FA verification required.
                  </p>
                </div>
              </div>

              <button
                id="verify-continue-btn"
                onClick={() => navigate('/verify')}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-cyber font-bold text-sm shadow-[0_0_20px_rgba(234,179,8,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>VERIFY & CONTINUE</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )}

          {/* If High Risk and user remained on this page, show prominent alert banner */}
          {analysisResult.risk_level === 'HIGH' && (
            <div className="glass-panel-danger rounded-2xl p-6 border border-red-500/50 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-cyber font-bold text-red-300">
                    🚨 HIGH RISK (RED) · PAYMENT PAUSED
                  </h2>
                  <p className="text-xs font-mono text-slate-300 mt-1">
                    JARVIS has temporarily paused this payment because critical risk anomalies were detected.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/risk-alert')}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-slate-950 font-cyber font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>VIEW SECURITY ALERT</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )}

          {/* Simulated Transfer Completed Banner (if triggered) */}
          {simulatedComplete && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100">SIMULATED TRANSFER: </span>
                Ref #{simulatedComplete.simulated_txn_id} · Protected by JARVIS AI
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="underline hover:text-white"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Main Grid: Gauge & Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge */}
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col items-center justify-center">
              <RiskScore
                score={analysisResult.risk_score}
                level={analysisResult.risk_level}
                action={analysisResult.action}
                size="lg"
              />
            </div>

            {/* Signals Breakdown */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-cyber text-slate-100">
                  Detected Risk Signals
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {analysisResult.signals.length} Signals Evaluated
                </span>
              </div>

              <div className="space-y-2.5">
                {analysisResult.signals.map((sig, idx) => (
                  <RiskSignal key={sig.id || idx} signal={sig} index={idx} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Explanation Card */}
          <AIExplanation
            explanation={analysisResult.ai_explanation}
            modelBreakdown={analysisResult.model_breakdown}
          />

          {/* Transaction Summary Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold font-cyber text-slate-300 uppercase tracking-wider">
              Transaction Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-500">Transaction ID</div>
                <div className="font-bold text-cyan-400 mt-1 truncate">
                  {analysisResult.transaction_id}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-500">Amount</div>
                <div className="font-bold text-slate-200 mt-1">
                  {formatCurrency(pendingPayment?.amount || 75000, 'INR')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-500">Beneficiary</div>
                <div className="font-bold text-slate-200 mt-1 truncate">
                  {pendingPayment?.beneficiary_name || 'Alex V.'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-500">Analysis Time</div>
                <div className="font-bold text-slate-400 mt-1">
                  {formatDate(analysisResult.analyzed_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
