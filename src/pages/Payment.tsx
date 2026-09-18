import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  Shield,
  Smartphone,
  MapPin,
  UserPlus,
  Zap,
  Info,
  CreditCard,
  Building2,
  Wallet,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import { analyzePayment } from '../services/api';
import { PaymentRequest } from '../types/payment';
import { SecurityCard } from '../components/SecurityCard';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../context/AuthContext';

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [beneficiaryName, setBeneficiaryName] = useState('Alex V.');
  const [accountUpiId, setAccountUpiId] = useState('alex7742@axisbank');
  const [amount, setAmount] = useState<number>(750);
  const [description, setDescription] = useState('Routine transfer');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'UPI' | 'Wallet'>('UPI');

  // Security Simulation Context State - default to trusted safe state unless scenario or user selects otherwise
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [isNewBeneficiary, setIsNewBeneficiary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL params for preset scenarios
  useEffect(() => {
    const scenario = searchParams.get('scenario');
    if (scenario === 'high_risk') {
      applyScenario('high_risk');
    } else if (scenario === 'medium_risk') {
      applyScenario('medium_risk');
    } else if (scenario === 'low_risk') {
      applyScenario('low_risk');
    }
  }, [searchParams]);

  const applyScenario = (type: 'high_risk' | 'medium_risk' | 'low_risk') => {
    if (type === 'high_risk') {
      setBeneficiaryName('Alex V. (BEN-77421)');
      setAccountUpiId('alex7742@axisbank');
      setAmount(75000);
      setDescription('Urgent vendor settlement');
      setPaymentMethod('UPI');
      setIsNewDevice(true);
      setIsNewLocation(true);
      setIsNewBeneficiary(true);
    } else if (type === 'medium_risk') {
      setBeneficiaryName('TechGadgets India');
      setAccountUpiId('pay@techgadgets');
      setAmount(18500);
      setDescription('Hardware monitor purchase');
      setPaymentMethod('Bank Transfer');
      setIsNewDevice(false);
      setIsNewLocation(false);
      setIsNewBeneficiary(true);
    } else {
      setBeneficiaryName('Starbucks Roastery');
      setAccountUpiId('sbux@icici');
      setAmount(450);
      setDescription('Morning coffee');
      setPaymentMethod('UPI');
      setIsNewDevice(false);
      setIsNewLocation(false);
      setIsNewBeneficiary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: PaymentRequest = {
      beneficiary_name: beneficiaryName,
      account_upi_id: accountUpiId,
      amount: Number(amount),
      payment_description: description,
      payment_method: paymentMethod,
      device_id: isNewDevice ? 'DEV-A7F92K' : 'DEV-MAC-881',
      location: isNewLocation ? 'Chennai, India' : 'Bengaluru, India',
      is_new_device: isNewDevice,
      is_new_location: isNewLocation,
      is_new_beneficiary: isNewBeneficiary,
      velocity_count: amount >= 50000 ? 8 : 2,
    };

    // Store in session storage so AI analysis page can retrieve it
    sessionStorage.setItem('jarvis_pending_payment', JSON.stringify(payload));

    // Redirect to the AI analysis sequence screen
    navigate('/analysis');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="jarvis-secure-payment-page">
      {/* Page Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wide text-slate-100">
                Send Money Securely
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                JARVIS INTERCEPT ENGINE
              </span>
            </div>
            <p className="text-sm font-mono text-cyan-400/90 mt-1">
              JARVIS will analyze this payment before completion.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Available Balance</div>
            <div className="text-lg font-cyber font-bold text-slate-200">
              {formatCurrency(user?.balance || 284500, 'INR')}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Demo Scenarios Selector */}
      <div className="glass-panel rounded-2xl p-4 border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-mono text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hackathon Demo Scenario Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => applyScenario('high_risk')}
            className={`p-3 rounded-xl border text-left transition-all ${
              amount === 75000 && isNewDevice
                ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)] text-red-200'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cyber text-red-400 flex items-center gap-1">
                <span>🔴</span>
                <span>High Risk (Red)</span>
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-red-950 text-red-300 border border-red-800">
                SCORE 92
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
              ₹75,000 · New Device + Geo Drift + Velocity Spike
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyScenario('medium_risk')}
            className={`p-3 rounded-xl border text-left transition-all ${
              amount === 18500
                ? 'bg-yellow-950/40 border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.25)] text-yellow-200'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cyber text-yellow-400 flex items-center gap-1">
                <span>🟡</span>
                <span>Medium Risk (Yellow)</span>
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                SCORE 58
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
              ₹18,500 · Elevated amount + New merchant
            </p>
          </button>

          <button
            type="button"
            onClick={() => applyScenario('low_risk')}
            className={`p-3 rounded-xl border text-left transition-all ${
              amount === 450
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.25)] text-emerald-200'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-cyber text-emerald-400 flex items-center gap-1">
                <span>🟢</span>
                <span>Low Risk (Green)</span>
              </span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                SCORE 08
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
              ₹450 · Recurring merchant + Known device
            </p>
          </button>
        </div>
      </div>

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 space-y-4">
          <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Transfer Specifications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beneficiary Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Beneficiary Name
              </label>
              <input
                id="payment-beneficiary-input"
                type="text"
                required
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
                placeholder="e.g. Alex V. or Company Name"
              />
            </div>

            {/* Account / UPI ID */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Account / UPI ID
              </label>
              <input
                id="payment-account-id-input"
                type="text"
                required
                value={accountUpiId}
                onChange={(e) => setAccountUpiId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
                placeholder="e.g. user@okhdfcbank or 1048201991"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Amount (INR ₹)
                </label>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    amount >= 50000
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : amount >= 15000
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {amount >= 50000
                    ? '🔴 High Risk Tier (≥ ₹50,000)'
                    : amount >= 15000
                    ? '🟡 Medium Risk Tier (₹15k - ₹49k)'
                    : '🟢 Low Risk Tier (< ₹15,000)'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-cyber text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  id="payment-amount-input"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-sm text-slate-100 font-cyber font-bold focus:outline-none transition-colors ${
                    amount >= 50000
                      ? 'border-red-500/50 focus:border-red-400'
                      : amount >= 15000
                      ? 'border-yellow-500/50 focus:border-yellow-400'
                      : 'border-slate-800 focus:border-cyan-500/50'
                  }`}
                  placeholder="750"
                />
              </div>
              <p
                className={`text-[11px] font-mono mt-1 ${
                  amount >= 50000
                    ? 'text-red-400'
                    : amount >= 15000
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {amount >= 50000
                  ? 'Subject to anomaly detection and automated high-threat interception (Red).'
                  : amount >= 15000
                  ? 'Elevated transfer requiring two-factor verification (Yellow).'
                  : 'Routine nominal transaction with low loss exposure (Green - Safe).'}
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI', icon: Zap },
                  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building2 },
                  { id: 'Wallet', label: 'Wallet', icon: Wallet },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === method.id
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <method.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Payment Description
            </label>
            <input
              id="payment-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
              placeholder="e.g. Urgent vendor settlement"
            />
          </div>
        </div>

        {/* Security Context Cards (Required in prompt Section 5) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>Real-time Security Context Signals</span>
            <span className="text-cyan-400">Active Telemetry</span>
          </div>

          <SecurityCard
            deviceOverride={{
              label: isNewDevice ? 'New Device (DEV-A7F92K)' : 'Trusted Device (DEV-MAC-881)',
              status: isNewDevice ? 'NEW_DEVICE' : 'TRUSTED',
              details: isNewDevice ? 'Unrecognized Linux agent' : 'Secure hardware token',
            }}
            locationOverride={{
              label: isNewLocation ? 'Unusual (Chennai, India)' : 'Verified (Bengaluru, India)',
              status: isNewLocation ? 'UNUSUAL' : 'VERIFIED',
              details: isNewLocation ? '1,850km drift from home' : 'Trusted geofence',
            }}
            beneficiaryOverride={{
              label: isNewBeneficiary ? 'New Beneficiary' : 'Established Payee',
              status: isNewBeneficiary ? 'NEW_BENEFICIARY' : 'ESTABLISHED',
              details: isNewBeneficiary ? 'Zero prior history' : 'Frequent recipient',
            }}
          />

          {/* Quick simulator toggles for demo inspection */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Signal overrides:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewDevice}
                onChange={(e) => setIsNewDevice(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
              />
              <span>Simulate New Device</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewLocation}
                onChange={(e) => setIsNewLocation(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
              />
              <span>Simulate Unusual Geo</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewBeneficiary}
                onChange={(e) => setIsNewBeneficiary(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
              />
              <span>Simulate New Beneficiary</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            id="pay-securely-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-base transition-all shadow-[0_0_30px_rgba(6,182,212,0.35)] flex items-center justify-center gap-3 cursor-pointer"
          >
            <Shield className="w-5 h-5 text-slate-950" />
            <span>PAY SECURELY</span>
          </button>
          <p className="text-center text-xs font-mono text-slate-500 mt-2">
            JARVIS will intercept this request, execute heuristic evaluation, and calculate a pre-flight risk score.
          </p>
        </div>
      </form>
    </div>
  );
};
