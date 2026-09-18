import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Smartphone,
  MapPin,
  User,
  CreditCard,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { PaymentAnalysisResponse } from '../types/risk';
import { PaymentRequest } from '../types/payment';
import { RiskScore } from '../components/RiskScore';
import { RiskSignal } from '../components/RiskSignal';
import { AIExplanation } from '../components/AIExplanation';
import { formatCurrency } from '../utils/formatCurrency';

export const RiskAlert: React.FC = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<PaymentAnalysisResponse | null>(null);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    const rawAnalysis = sessionStorage.getItem('jarvis_active_analysis');
    const rawPayment = sessionStorage.getItem('jarvis_pending_payment');

    if (rawAnalysis) {
      try {
        setAnalysis(JSON.parse(rawAnalysis));
      } catch {}
    } else {
      // Default sample high-risk state for direct visits
      setAnalysis({
        transaction_id: 'TXN-2026-0918-7842',
        risk_score: 92,
        risk_level: 'HIGH',
        action: 'PAUSE',
        reasons: [
          'New device detected not previously associated with this account',
          'Unusual location detected: 1,850km geographic drift',
          'New beneficiary with zero transaction history',
          'Transaction amount ₹75,000 is 14.8x normal median',
          'High transaction velocity spike detected',
        ],
        signals: [
          {
            id: 'SIG-01',
            icon: 'Smartphone',
            name: 'New Device Detected',
            status: 'CRITICAL',
            category: 'DEVICE',
            explanation: 'This device fingerprint (DEV-A7F92K) has not previously been associated with this account.',
            weight: 28,
          },
          {
            id: 'SIG-02',
            icon: 'MapPin',
            name: 'Unusual Location Detected',
            status: 'CRITICAL',
            category: 'LOCATION',
            explanation: 'Transaction origin registered in Chennai, India. Normal home geofence is Bengaluru.',
            weight: 22,
          },
          {
            id: 'SIG-03',
            icon: 'UserPlus',
            name: 'New Beneficiary Detected',
            status: 'WARNING',
            category: 'BENEFICIARY',
            explanation: 'This beneficiary has not previously been used by the account.',
            weight: 18,
          },
          {
            id: 'SIG-04',
            icon: 'TrendingUp',
            name: 'Unusual Transaction Amount',
            status: 'CRITICAL',
            category: 'BEHAVIOR',
            explanation: 'The transaction amount is significantly above the account\'s normal pattern.',
            weight: 24,
          },
        ],
        ai_explanation:
          'AI-generated explanation based on detected risk signals: JARVIS identified several unusual signals. The transaction amount is significantly higher than the account\'s normal pattern, the beneficiary is new, and the device has not previously been associated with this account. These combined signals increased the transaction risk.',
        model_breakdown: {
          xgboost_score: 91.4,
          isolation_forest_anomaly: -0.84,
          network_centrality: 88.2,
          behavioral_drift: 94.0,
        },
        security_context: {
          device: { status: 'NEW_DEVICE', label: 'New Device', details: 'DEV-A7F92K' },
          location: { status: 'UNUSUAL', label: 'Unusual Location', details: 'Chennai, India' },
          beneficiary: { status: 'NEW_BENEFICIARY', label: 'New Beneficiary', details: 'Alex V.' },
          protection: { status: 'ACTIVE', label: 'AI Monitoring Active', details: 'Continuous inspection' },
        },
        analyzed_at: new Date().toISOString(),
      });
    }

    if (rawPayment) {
      try {
        setPayment(JSON.parse(rawPayment));
      } catch {}
    }
  }, []);

  const handleCancelPayment = () => {
    sessionStorage.removeItem('jarvis_pending_payment');
    sessionStorage.removeItem('jarvis_active_analysis');
    navigate('/dashboard');
  };

  const amountDisplay = payment?.amount ?? (analysis ? 75000 : 75000);
  const beneficiaryDisplay = payment?.beneficiary_name || 'Alex V. (BEN-77421)';
  const deviceDisplay = payment?.device_id || 'DEV-A7F92K (Unknown Linux)';
  const locationDisplay = payment?.location || 'Chennai, India';

  // Dynamic signal evaluations for correct risk color attribution
  const isHighAmount = amountDisplay >= 50000;
  const isMediumAmount = amountDisplay >= 15000 && amountDisplay < 50000;
  const isSafeMicroAmount = amountDisplay < 15000;

  const isNewDev = payment?.is_new_device ?? true;
  const isNewLoc = payment?.is_new_location ?? true;
  const isNewBen = payment?.is_new_beneficiary ?? true;

  const currentLevel = analysis?.risk_level || 'HIGH';

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="jarvis-high-risk-alert-page">
      {/* Dynamic Threat Alert Hero Header with strict color compliance */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border relative overflow-hidden transition-all ${
          currentLevel === 'HIGH'
            ? 'glass-panel-danger border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : currentLevel === 'MEDIUM'
            ? 'glass-panel border-yellow-500/50 bg-yellow-950/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]'
            : 'glass-panel border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center shrink-0 ${
                currentLevel === 'HIGH'
                  ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : currentLevel === 'MEDIUM'
                  ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                  : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
              }`}
            >
              {currentLevel === 'HIGH' ? (
                <ShieldAlert className="w-10 h-10 animate-bounce" />
              ) : currentLevel === 'MEDIUM' ? (
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              ) : (
                <ShieldAlert className="w-10 h-10" />
              )}
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-2 ${
                  currentLevel === 'HIGH'
                    ? 'bg-red-950/80 border border-red-500/50 text-red-300'
                    : currentLevel === 'MEDIUM'
                    ? 'bg-yellow-950/80 border border-yellow-500/50 text-yellow-300'
                    : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentLevel === 'HIGH'
                      ? 'bg-red-400 animate-ping'
                      : currentLevel === 'MEDIUM'
                      ? 'bg-yellow-400'
                      : 'bg-emerald-400'
                  }`}
                />
                {currentLevel === 'HIGH'
                  ? 'High Threat Intercept (Red)'
                  : currentLevel === 'MEDIUM'
                  ? 'Suspicion Intercept (Yellow)'
                  : 'Baseline Clear (Green)'}
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-cyber font-bold tracking-wide ${
                  currentLevel === 'HIGH'
                    ? 'text-red-100'
                    : currentLevel === 'MEDIUM'
                    ? 'text-yellow-100'
                    : 'text-emerald-100'
                }`}
              >
                {currentLevel === 'HIGH'
                  ? '🚨 PAYMENT PAUSED (HIGH RISK)'
                  : currentLevel === 'MEDIUM'
                  ? '⚠ VERIFICATION REQUIRED (MEDIUM RISK)'
                  : '✓ PAYMENT APPROVED (LOW RISK)'}
              </h1>
              <p className="text-sm font-sans text-slate-300 mt-2 max-w-xl">
                {currentLevel === 'HIGH'
                  ? 'JARVIS has temporarily paused this payment because critical risk anomalies were detected.'
                  : currentLevel === 'MEDIUM'
                  ? 'JARVIS detected moderate behavioral deviation. Additional 2FA verification is required before settlement.'
                  : 'JARVIS verified that this payment conforms to normal safe baseline parameters.'}
              </p>
            </div>
          </div>

          {/* STATUS BANNER */}
          <div
            className={`p-4 rounded-2xl border text-center shrink-0 w-full sm:w-auto ${
              currentLevel === 'HIGH'
                ? 'bg-red-950/60 border-red-500/50'
                : currentLevel === 'MEDIUM'
                ? 'bg-yellow-950/60 border-yellow-500/50'
                : 'bg-emerald-950/60 border-emerald-500/50'
            }`}
          >
            <div
              className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
                currentLevel === 'HIGH'
                  ? 'text-red-300'
                  : currentLevel === 'MEDIUM'
                  ? 'text-yellow-300'
                  : 'text-emerald-300'
              }`}
            >
              Transaction Status
            </div>
            <div
              className={`text-sm font-cyber font-bold mt-1 uppercase tracking-wider ${
                currentLevel === 'HIGH'
                  ? 'text-red-400'
                  : currentLevel === 'MEDIUM'
                  ? 'text-yellow-400'
                  : 'text-emerald-400'
              }`}
            >
              {currentLevel === 'HIGH'
                ? 'PAUSED / HELD'
                : currentLevel === 'MEDIUM'
                ? 'REQUIRES 2FA'
                : 'READY / APPROVED'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {currentLevel === 'HIGH'
                ? 'Funds held securely in your balance.'
                : currentLevel === 'MEDIUM'
                ? 'Pending one-time verification.'
                : 'Processed with standard approval.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Risk Score Gauge + Key Context Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Risk Score Gauge with dynamic level */}
        <div
          className={`glass-panel rounded-2xl p-6 border flex flex-col items-center justify-center ${
            currentLevel === 'HIGH'
              ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
              : currentLevel === 'MEDIUM'
              ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
              : 'border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
          }`}
        >
          <RiskScore
            score={analysis?.risk_score ?? 92}
            level={currentLevel}
            action={
              currentLevel === 'HIGH'
                ? 'PAYMENT PAUSED'
                : currentLevel === 'MEDIUM'
                ? 'VERIFICATION REQUIRED'
                : 'PAYMENT APPROVED'
            }
            size="lg"
            subtext={
              currentLevel === 'HIGH'
                ? 'Score exceeds 70/100 threshold (Red)'
                : currentLevel === 'MEDIUM'
                ? 'Score in 30-69 elevated range (Yellow)'
                : 'Score in 0-29 nominal range (Green)'
            }
          />
        </div>

        {/* Right: Payment Context Details with mathematically correct colors */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-cyber text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>Target Transaction Signals</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Assessed against historical baseline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {/* 1. Transaction Amount with correct risk color */}
            <div
              className={`p-3.5 rounded-xl bg-slate-950/70 border transition-all ${
                isHighAmount
                  ? 'border-red-500/40 bg-red-950/15'
                  : isMediumAmount
                  ? 'border-yellow-500/40 bg-yellow-950/15'
                  : 'border-emerald-500/40 bg-emerald-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[11px] uppercase">Transaction Amount</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isHighAmount
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : isMediumAmount
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isHighAmount ? 'RED (ANOMALY)' : isMediumAmount ? 'YELLOW (ELEVATED)' : 'GREEN (SAFE)'}
                </span>
              </div>
              <span
                className={`text-base font-bold font-cyber mt-1 block ${
                  isHighAmount
                    ? 'text-red-400'
                    : isMediumAmount
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {formatCurrency(amountDisplay, 'INR')}
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  isHighAmount
                    ? 'text-red-400'
                    : isMediumAmount
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {isHighAmount
                  ? 'Significantly above normal median (High Risk)'
                  : isMediumAmount
                  ? 'Elevated amount tier (Medium Risk)'
                  : 'Low-value routine payment (Safe baseline)'}
              </span>
            </div>

            {/* 2. Beneficiary */}
            <div
              className={`p-3.5 rounded-xl bg-slate-950/70 border transition-all ${
                isNewBen
                  ? 'border-yellow-500/40 bg-yellow-950/15'
                  : 'border-emerald-500/40 bg-emerald-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[11px] uppercase">Beneficiary</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isNewBen
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isNewBen ? 'YELLOW (STEP-UP)' : 'GREEN (TRUSTED)'}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-200 mt-1 block truncate">
                {beneficiaryDisplay}
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  isNewBen ? 'text-yellow-400' : 'text-emerald-400'
                }`}
              >
                {isNewBen
                  ? 'New recipient (zero interaction history)'
                  : 'Established payee (historical match)'}
              </span>
            </div>

            {/* 3. Device Fingerprint */}
            <div
              className={`p-3.5 rounded-xl bg-slate-950/70 border transition-all ${
                isNewDev
                  ? 'border-red-500/40 bg-red-950/15'
                  : 'border-emerald-500/40 bg-emerald-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[11px] uppercase">Device Fingerprint</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isNewDev
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isNewDev ? 'RED (UNRECOGNIZED)' : 'GREEN (AUTHENTICATED)'}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-200 mt-1 block truncate">
                {deviceDisplay}
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  isNewDev ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isNewDev
                  ? 'Unrecognized terminal (hardware mismatch)'
                  : 'Authenticated terminal (trusted key)'}
              </span>
            </div>

            {/* 4. Origin Location */}
            <div
              className={`p-3.5 rounded-xl bg-slate-950/70 border transition-all ${
                isNewLoc
                  ? 'border-red-500/40 bg-red-950/15'
                  : 'border-emerald-500/40 bg-emerald-950/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[11px] uppercase">Origin Location</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isNewLoc
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isNewLoc ? 'RED (DRIFT)' : 'GREEN (GEOFENCE OK)'}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-200 mt-1 block truncate">
                {locationDisplay}
              </span>
              <span
                className={`text-[11px] block mt-0.5 ${
                  isNewLoc ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isNewLoc
                  ? '1,850km geofence drift detected'
                  : 'Habitual geofence verified'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {currentLevel === 'HIGH'
                ? 'Your payment has NOT been sent. High threat parameters paused settlement.'
                : currentLevel === 'MEDIUM'
                ? 'Step-up two-factor verification required before dispatching payment.'
                : 'Payment satisfies all security criteria and is ready for immediate execution.'}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Signals List */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-cyber text-slate-100">
            Detected Risk Signals Breakdown
          </h3>
          <span className="text-xs font-mono text-red-400 font-semibold">
            {analysis?.signals.length || 4} Signals Flagged
          </span>
        </div>

        <div className="space-y-2.5">
          {analysis?.signals.map((sig, idx) => (
            <RiskSignal key={sig.id || idx} signal={sig} index={idx} />
          ))}
        </div>
      </div>

      {/* AI Explanation Card */}
      {analysis && (
        <AIExplanation
          explanation={analysis.ai_explanation}
          modelBreakdown={analysis.model_breakdown}
        />
      )}

      {/* Action Buttons: VERIFY PAYMENT vs CANCEL PAYMENT */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          id="cancel-payment-btn"
          onClick={handleCancelPayment}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          <span>CANCEL PAYMENT</span>
        </button>

        <button
          id="verify-payment-btn"
          onClick={() => navigate('/verify')}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>VERIFY PAYMENT (DEMO 2FA)</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
