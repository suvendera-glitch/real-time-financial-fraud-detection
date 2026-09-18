import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { verifyPayment } from '../services/api';
import { PaymentRequest } from '../types/payment';
import { PaymentAnalysisResponse } from '../types/risk';
import { formatCurrency } from '../utils/formatCurrency';

export const Verification: React.FC = () => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<PaymentAnalysisResponse | null>(null);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);

  // 6-digit OTP fields
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);
  const [timerSeconds, setTimerSeconds] = useState(120);

  useEffect(() => {
    const rawAnalysis = sessionStorage.getItem('jarvis_active_analysis');
    const rawPayment = sessionStorage.getItem('jarvis_pending_payment');

    if (rawAnalysis) {
      try {
        setAnalysis(JSON.parse(rawAnalysis));
      } catch {}
    } else {
      setAnalysis({
        transaction_id: 'TXN-2026-0918-7842',
        risk_score: 92,
        risk_level: 'HIGH',
        action: 'PAUSE',
        reasons: [],
        signals: [],
        ai_explanation: '',
        model_breakdown: { xgboost_score: 91, isolation_forest_anomaly: -0.84, network_centrality: 88, behavioral_drift: 94 },
        security_context: {
          device: { status: 'NEW_DEVICE', label: 'New Device', details: '' },
          location: { status: 'UNUSUAL', label: 'Unusual', details: '' },
          beneficiary: { status: 'NEW_BENEFICIARY', label: 'New', details: '' },
          protection: { status: 'ACTIVE', label: 'Active', details: '' },
        },
        analyzed_at: new Date().toISOString(),
      });
    }

    if (rawPayment) {
      try {
        setPayment(JSON.parse(rawPayment));
      } catch {}
    }

    // Auto-focus first input box
    inputRefs.current[0]?.focus();

    // Timer countdown
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    setErrorMessage(null);
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timerSeconds === 0) {
      setErrorMessage('Demo OTP has expired. Please click "Resend Demo OTP".');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await verifyPayment({
        transaction_id: analysis?.transaction_id || 'TXN-2026-0918-7842',
        otp: otpCode,
      });

      if (response.verified) {
        // Store verification token
        sessionStorage.setItem('jarvis_verified_token', response.verification_token || 'VTK-VALID');
        // Proceed to POST-VERIFICATION AI RECHECK screen (Section 13)
        navigate('/recheck');
      } else {
        setErrorMessage(response.message || 'Verification failed.');
        const remaining = (response.attempts_remaining ?? attemptsRemaining - 1);
        setAttemptsRemaining(Math.max(0, remaining));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with verification service.');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6" id="jarvis-payment-verification-page">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/25 relative overflow-hidden shadow-2xl">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <KeyRound className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wide text-slate-100">
            Verify This Payment
          </h1>
          <p className="text-xs font-sans text-slate-300 mt-1 max-w-md mx-auto">
            For your protection, JARVIS requires additional identity verification.
          </p>
        </div>

        {/* Transaction Summary Badge */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>Payment Amount:</span>
            <span className="font-bold text-slate-100 font-cyber text-sm">
              {formatCurrency(payment?.amount || 75000, 'INR')}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Beneficiary:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {payment?.beneficiary_name || 'Alex V. (BEN-77421)'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Transaction ID:</span>
            <span className="text-cyan-400">{analysis?.transaction_id || 'TXN-2026-0918-7842'}</span>
          </div>
        </div>

        {/* DEMO VERIFICATION DISCLAIMER NOTICE (Mandated in prompt Section 12) */}
        <div className="p-3.5 rounded-xl bg-yellow-950/30 border border-yellow-500/40 text-xs font-mono text-yellow-300 flex items-start gap-2.5 mb-6">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">DEMO VERIFICATION: </span>
            This is a hackathon simulation. For testing, use the configurable demo OTP:
            <button
              type="button"
              onClick={fillDemoOtp}
              className="ml-1.5 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-200 border border-yellow-500/50 hover:bg-yellow-500/30 font-bold transition-colors cursor-pointer"
            >
              Autofill 123456
            </button>
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-center text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
              Enter 6-Digit Verification Code
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center font-cyber font-bold text-xl rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Countdown & Attempts remaining */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Expires in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <div>
              <span>Attempts remaining: </span>
              <span className={attemptsRemaining <= 1 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {attemptsRemaining}
              </span>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            id="verify-payment-submit-btn"
            type="submit"
            disabled={loading || attemptsRemaining <= 0}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-base transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>VERIFY PAYMENT</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setTimerSeconds(120);
              setErrorMessage(null);
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resend Demo Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
