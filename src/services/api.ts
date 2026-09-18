import {
  PaymentRequest,
  VerifyRequest,
  VerifyResponse,
  RecheckRequest,
  RecheckResponse,
  SimulatedTransferResponse,
} from '../types/payment';
import {
  PaymentAnalysisResponse,
  RiskLevel,
  RiskSignal,
  SecurityStatusResponse,
} from '../types/risk';
import {
  Transaction,
  DashboardData,
  AdminAlert,
  AdminStatistics,
  AdminStats,
  InvestigationData,
  GraphData,
} from '../types/transaction';

const API_URL = "http://127.0.0.1:8000";

export interface ApiState {
  isBackendConnected: boolean;
  lastChecked: Date | null;
  mode: 'FASTAPI' | 'LOCAL_SANDBOX';
}

// In-memory persistent database for the prototype session
let memoryTransactions: Transaction[] = [
  {
    transaction_id: "TXN-2026-0918-7842",
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    beneficiary: "Alex V. (BEN-77421)",
    beneficiary_account: "UPI: alex7742@axisbank",
    amount: 75000,
    currency: "INR",
    risk_score: 92,
    risk_level: "HIGH",
    action: "PAUSE",
    status: "PAUSED",
    payment_method: "UPI",
    payment_description: "Urgent vendor settlement",
    device_id: "DEV-A7F92K",
    device_name: "Unknown Linux Workstation (Chrome 124)",
    location: "Chennai, India",
    ip_address: "103.245.12.89",
    velocity: "8 transactions / hour",
    reasons: [
      "New device detected not previously paired with account",
      "Unusual location: 1,850km drift from home region",
      "New beneficiary with zero transaction history",
      "Transaction amount ₹75,000 is 14.8x normal median",
      "High transaction velocity spike detected",
      "Suspicious network entity linkage flagged in NetworkX graph"
    ],
    signals: [
      {
        id: "SIG-01",
        icon: "Smartphone",
        name: "New Device Detected",
        status: "CRITICAL",
        category: "DEVICE",
        explanation: "This device fingerprint (DEV-A7F92K) has never logged into or transacted from this account.",
        weight: 28
      },
      {
        id: "SIG-02",
        icon: "MapPin",
        name: "Unusual Geo-Location",
        status: "CRITICAL",
        category: "LOCATION",
        explanation: "Transaction origin registered in Chennai, India. Normal home geofence is Bengaluru, India.",
        weight: 22
      },
      {
        id: "SIG-03",
        icon: "UserPlus",
        name: "New Beneficiary Added",
        status: "WARNING",
        category: "BENEFICIARY",
        explanation: "BEN-77421 was added under 20 minutes ago. First-time transfer recipient.",
        weight: 18
      },
      {
        id: "SIG-04",
        icon: "TrendingUp",
        name: "Unusual Transaction Amount",
        status: "CRITICAL",
        category: "BEHAVIOR",
        explanation: "The requested amount ₹75,000 deviates significantly (> 3.8 std devs) from user's 90-day baseline.",
        weight: 25
      },
      {
        id: "SIG-05",
        icon: "Zap",
        name: "High Velocity Spike",
        status: "WARNING",
        category: "VELOCITY",
        explanation: "8 transactions initiated within the last 60 minutes across multiple endpoints.",
        weight: 15
      },
      {
        id: "SIG-06",
        icon: "Share2",
        name: "Network Graph Flag",
        status: "CRITICAL",
        category: "NETWORK",
        explanation: "NetworkX graph analysis detected 2-hop linkage to an identified mule account ring.",
        weight: 24
      }
    ],
    ai_explanation: "AI-generated explanation based on detected risk signals: JARVIS identified several critical anomalies. The transaction amount of ₹75,000 is significantly higher than the account's standard pattern, the beneficiary BEN-77421 is newly registered, and the device has not previously been associated with this account. Furthermore, geofence drift and high velocity trigger immediate interception.",
    model_breakdown: {
      xgboost_score: 91.4,
      isolation_forest_anomaly: -0.84, // Outlier
      network_centrality: 88.2,
      behavioral_drift: 94.0
    },
    security_context: {
      device: { status: "NEW_DEVICE", label: "New Device", details: "DEV-A7F92K (Unknown fingerprint)" },
      location: { status: "UNUSUAL", label: "Unusual Location", details: "Chennai, India (Unverified IP)" },
      beneficiary: { status: "NEW_BENEFICIARY", label: "New Beneficiary", details: "BEN-77421 (Added 18m ago)" },
      protection: { status: "ACTIVE", label: "JARVIS Protected", details: "Continuous real-time heuristic monitoring" }
    },
    verification_history: [
      { step: "Payment Initiated", timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), status: "REQUIRED" },
      { step: "Automated Interception", timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(), status: "PASSED", details: "Paused payment per high risk policy" }
    ],
    decision_history: [
      { action: "PAYMENT_PAUSED", timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(), actor: "JARVIS AI Engine", notes: "Risk Score 92 exceeds threshold 70" }
    ]
  },
  {
    transaction_id: "TXN-2026-0918-6210",
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    beneficiary: "Cloud Hosting Corp (AWS)",
    beneficiary_account: "acc_biz_99201",
    amount: 12400,
    currency: "INR",
    risk_score: 42,
    risk_level: "MEDIUM",
    action: "VERIFY",
    status: "APPROVED",
    payment_method: "Bank Transfer",
    payment_description: "Monthly infra server bill",
    device_id: "DEV-MAC-881",
    device_name: "MacBook Pro 16 (Known)",
    location: "Bengaluru, India",
    ip_address: "49.207.18.110",
    velocity: "1 transaction / hour",
    reasons: ["Slightly elevated amount above monthly subscription average"],
    signals: [
      {
        id: "SIG-11",
        icon: "ShieldCheck",
        name: "Device Authenticated",
        status: "PASS",
        category: "DEVICE",
        explanation: "Hardware cryptographic enclave verified token DEV-MAC-881.",
        weight: 0
      },
      {
        id: "SIG-12",
        icon: "TrendingUp",
        name: "Moderate Amount Variation",
        status: "WARNING",
        category: "BEHAVIOR",
        explanation: "Amount is 35% higher than previous 3 billing cycles.",
        weight: 42
      }
    ],
    ai_explanation: "Payment passed behavioral checks with moderate variance in monthly cloud usage. Additional verification step completed successfully.",
    recheck_performed: true
  },
  {
    transaction_id: "TXN-2026-0918-4109",
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    beneficiary: "Starbucks Roastery",
    beneficiary_account: "UPI: sbux@icici",
    amount: 450,
    currency: "INR",
    risk_score: 8,
    risk_level: "LOW",
    action: "APPROVE",
    status: "APPROVED",
    payment_method: "UPI",
    payment_description: "Morning coffee",
    device_id: "DEV-MAC-881",
    device_name: "MacBook Pro 16 (Known)",
    location: "Bengaluru, India",
    ip_address: "49.207.18.110",
    velocity: "2 transactions / day",
    reasons: [],
    signals: [
      {
        id: "SIG-21",
        icon: "CheckCircle",
        name: "Trusted Merchant & Device",
        status: "PASS",
        category: "BENEFICIARY",
        explanation: "Recurring merchant with 100% genuine clearance rating.",
        weight: 5
      }
    ],
    ai_explanation: "JARVIS found zero significant risk indicators. Routine recurring micropayment within regular geofence and baseline habits."
  },
  {
    transaction_id: "TXN-2026-0917-9021",
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    beneficiary: "TechGadgets India Pvt Ltd",
    beneficiary_account: "UPI: pay@techgadgets",
    amount: 18500,
    currency: "INR",
    risk_score: 58,
    risk_level: "MEDIUM",
    action: "VERIFY",
    status: "APPROVED",
    payment_method: "UPI",
    payment_description: "Monitor purchase",
    device_id: "DEV-MAC-881",
    device_name: "MacBook Pro 16 (Known)",
    location: "Bengaluru, India",
    ip_address: "49.207.18.110",
    velocity: "3 transactions / day",
    reasons: ["First time merchant with mid-tier ticket size"],
    signals: [
      {
        id: "SIG-31",
        icon: "AlertTriangle",
        name: "New Merchant Category",
        status: "WARNING",
        category: "BENEFICIARY",
        explanation: "First electronics retail purchase on this account in 180 days.",
        weight: 55
      }
    ],
    ai_explanation: "Transaction required step-up verification due to new high-ticket retail category. Cleared after OTP authorization."
  },
  {
    transaction_id: "TXN-2026-0916-1184",
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    beneficiary: "Anonymous Crypto Gateway",
    beneficiary_account: "CRYPTO-SWAP-9011",
    amount: 140000,
    currency: "INR",
    risk_score: 96,
    risk_level: "HIGH",
    action: "HOLD",
    status: "HELD",
    payment_method: "Bank Transfer",
    payment_description: "P2P escrow swap",
    device_id: "DEV-PROXY-99",
    device_name: "Tor Exit Node / VPN Tunnel",
    location: "Zurich, Switzerland (Spoofed)",
    ip_address: "185.220.101.5",
    velocity: "12 transactions / hour",
    reasons: [
      "High-risk anonymized proxy network detected",
      "Sanctioned / high-risk beneficiary category",
      "Extreme velocity spike",
      "Immediate account draining pattern detected"
    ],
    signals: [
      {
        id: "SIG-41",
        icon: "ShieldAlert",
        name: "Tor / Anonymous Proxy",
        status: "CRITICAL",
        category: "NETWORK",
        explanation: "Direct traffic through known exit-relay node.",
        weight: 98
      }
    ],
    ai_explanation: "Payment definitively halted by Security Operations Center policy. Beneficiary and routing nodes linked to confirmed financial crime sanctions list."
  }
];

let cachedApiStatus: ApiState = {
  isBackendConnected: false,
  lastChecked: null,
  mode: 'LOCAL_SANDBOX',
};

async function checkBackendConnectivity(): Promise<boolean> {
  // If tested within the last 45 seconds, reuse cached state to prevent UI latency and network error spam
  if (cachedApiStatus.lastChecked && Date.now() - cachedApiStatus.lastChecked.getTime() < 45000) {
    return cachedApiStatus.isBackendConnected;
  }

  // Guard: if running in browser under HTTPS and API_URL is HTTP localhost, do not trigger mixed-content security errors
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && API_URL.startsWith('http://')) {
    cachedApiStatus = {
      isBackendConnected: false,
      lastChecked: new Date(),
      mode: 'LOCAL_SANDBOX',
    };
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    cachedApiStatus = {
      isBackendConnected: res.ok,
      lastChecked: new Date(),
      mode: res.ok ? 'FASTAPI' : 'LOCAL_SANDBOX',
    };
    return res.ok;
  } catch {
    cachedApiStatus = {
      isBackendConnected: false,
      lastChecked: new Date(),
      mode: 'LOCAL_SANDBOX',
    };
    return false;
  }
}

export function getBackendStatus(): ApiState {
  return cachedApiStatus;
}

/**
 * 1. Analyze Payment: POST /api/analyze-payment
 */
export async function analyzePayment(payload: PaymentRequest): Promise<PaymentAnalysisResponse> {
  const isConnected = await checkBackendConnectivity();

  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/analyze-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return (await response.json()) as PaymentAnalysisResponse;
      }
    } catch {
      // Fallback to local sandbox engine
    }
  }

  // Autonomous JARVIS AI Engine (Simulation compliant with XGBoost + Isolation Forest + NetworkX rules)
  // Determine realistic risk based on multiple security signals
  const isHighAmount = payload.amount >= 50000;
  const isMediumAmount = payload.amount >= 15000 && payload.amount < 50000;
  const isMicroAmount = payload.amount < 2000; // Small everyday micro-transactions (e.g. ₹750, ₹450)
  const isNormalAmount = payload.amount < 15000;

  // Real-world fraud rule: small routine payments (e.g. ₹750) do not carry terminal-hijack assumptions by default
  const isNewDevice = payload.is_new_device ?? (
    !isMicroAmount && (payload.device_id?.includes('NEW') || payload.device_id?.includes('DEV-A7F92K') || payload.amount >= 50000)
  );
  const isNewLocation = payload.is_new_location ?? (
    !isMicroAmount && (payload.location?.includes('Chennai') || payload.location?.includes('Unusual') || payload.amount >= 50000)
  );
  const isNewBeneficiary = payload.is_new_beneficiary ?? (
    payload.beneficiary_name.toLowerCase().includes('alex') || payload.amount >= 50000
  );
  const isHighVelocity = (payload.velocity_count || 1) >= 6 || payload.amount >= 70000;

  let risk_score = 12;
  const signals: RiskSignal[] = [];
  const reasons: string[] = [];

  if (isNewDevice) {
    risk_score += 26;
    reasons.push("New device detected not previously associated with this account");
    signals.push({
      id: "SIG-DEV",
      icon: "Smartphone",
      name: "New Device Detected",
      status: "CRITICAL",
      category: "DEVICE",
      explanation: "This device has not previously been associated with this account or trusted hardware key.",
      weight: 26
    });
  } else {
    signals.push({
      id: "SIG-DEV-OK",
      icon: "ShieldCheck",
      name: "Device Authenticated",
      status: "PASS",
      category: "DEVICE",
      explanation: "Hardware cryptographic fingerprint matches trusted profile.",
      weight: 0
    });
  }

  if (isNewLocation) {
    risk_score += 22;
    reasons.push("Unusual location detected outside habitual geographic profile");
    signals.push({
      id: "SIG-LOC",
      icon: "MapPin",
      name: "Unusual Location Detected",
      status: "CRITICAL",
      category: "LOCATION",
      explanation: "Transaction origin coordinates deviate significantly from standard home/office geofence.",
      weight: 22
    });
  } else {
    signals.push({
      id: "SIG-LOC-OK",
      icon: "MapPin",
      name: "Location Verified",
      status: "PASS",
      category: "LOCATION",
      explanation: "Transaction originates from verified trusted region.",
      weight: 0
    });
  }

  if (isNewBeneficiary) {
    risk_score += 18;
    reasons.push("New beneficiary detected with zero prior interaction history");
    signals.push({
      id: "SIG-BEN",
      icon: "UserPlus",
      name: "New Beneficiary Detected",
      status: "WARNING",
      category: "BENEFICIARY",
      explanation: "This beneficiary has not previously been used by the account.",
      weight: 18
    });
  } else {
    signals.push({
      id: "SIG-BEN-OK",
      icon: "UserCheck",
      name: "Known Beneficiary",
      status: "PASS",
      category: "BENEFICIARY",
      explanation: "Recipient is recognized in historical payment records.",
      weight: 0
    });
  }

  if (isHighAmount) {
    risk_score += 24;
    reasons.push("Unusual transaction amount significantly exceeding normal baseline");
    signals.push({
      id: "SIG-AMT",
      icon: "TrendingUp",
      name: "High Value Amount (Red)",
      status: "CRITICAL",
      category: "BEHAVIOR",
      explanation: `Transaction amount (₹${payload.amount.toLocaleString()}) is significantly above normal median (99th percentile anomaly).`,
      weight: 24
    });
  } else if (isMediumAmount) {
    risk_score += 14;
    reasons.push("Elevated transaction amount");
    signals.push({
      id: "SIG-AMT-MID",
      icon: "TrendingUp",
      name: "Elevated Amount (Yellow)",
      status: "WARNING",
      category: "BEHAVIOR",
      explanation: `Transaction amount (₹${payload.amount.toLocaleString()}) is higher than typical peer group transactions.`,
      weight: 14
    });
  } else {
    // Routine nominal amount (e.g. ₹750) is safe (Green) and reduces risk!
    risk_score -= isMicroAmount ? 24 : 12;
    signals.push({
      id: "SIG-AMT-LOW",
      icon: "ShieldCheck",
      name: "Nominal Amount (Green - Safe)",
      status: "PASS",
      category: "BEHAVIOR",
      explanation: `Transaction amount (₹${payload.amount.toLocaleString()}) is a routine everyday payment with negligible financial loss liability.`,
      weight: 0
    });
  }

  if (isHighVelocity) {
    risk_score += 15;
    reasons.push("High transaction velocity detected within current session window");
    signals.push({
      id: "SIG-VEL",
      icon: "Zap",
      name: "High Transaction Velocity",
      status: "WARNING",
      category: "VELOCITY",
      explanation: "Multiple rapid payment attempts observed across different channels.",
      weight: 15
    });
  }

  if (isHighAmount && isNewDevice) {
    risk_score += 10;
    reasons.push("Suspicious account relationship and entity cluster flagged in NetworkX graph");
    signals.push({
      id: "SIG-NET",
      icon: "Share2",
      name: "Suspicious Account Relationship",
      status: "CRITICAL",
      category: "NETWORK",
      explanation: "NetworkX graph analysis flagged recipient proximity to suspicious cluster nodes.",
      weight: 20
    });
  }

  // Micro-transaction & low-amount safeguard:
  // Payments under ₹2,000 have negligible loss exposure and must NEVER trigger HIGH RISK (PAUSE).
  // At most, an unfamiliar device for small amounts triggers step-up verification (MEDIUM RISK, max score 45).
  let calculatedScore = risk_score;
  if (isMicroAmount) {
    calculatedScore = Math.min(calculatedScore, 42);
  }

  // Cap score to 0-100 range
  const finalScore = Math.min(Math.max(calculatedScore, 8), 98);
  let risk_level: RiskLevel = 'LOW';
  let action: 'APPROVE' | 'VERIFY' | 'PAUSE' = 'APPROVE';

  if (finalScore >= 70) {
    risk_level = 'HIGH';
    action = 'PAUSE';
  } else if (finalScore >= 30) {
    risk_level = 'MEDIUM';
    action = 'VERIFY';
  } else {
    risk_level = 'LOW';
    action = 'APPROVE';
  }

  const txnId = `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  let ai_explanation = "";
  if (risk_level === 'HIGH') {
    ai_explanation = `AI-generated explanation based on detected risk signals: JARVIS intercepted a high-threat transfer. The transaction amount of ₹${payload.amount.toLocaleString()} is significantly above historical baseline, paired with unrecognized hardware credentials and abnormal location drift (Red Alert). Payment is paused pending full identity re-proofing.`;
  } else if (risk_level === 'MEDIUM') {
    ai_explanation = `AI-generated explanation based on detected risk signals: JARVIS detected moderately elevated context (Yellow Alert). The transaction amount (₹${payload.amount.toLocaleString()}) or new recipient requires step-up 2FA/OTP verification before settlement.`;
  } else {
    ai_explanation = `AI-generated explanation based on detected risk signals: JARVIS verified zero anomalous signals (Green - Safe). Transaction amount (₹${payload.amount.toLocaleString()}) is routine and device telemetry matches trusted profile. Frictionless approval granted.`;
  }

  const analysisResult: PaymentAnalysisResponse = {
    transaction_id: txnId,
    risk_score: finalScore,
    risk_level,
    action,
    reasons,
    signals,
    ai_explanation,
    model_breakdown: {
      xgboost_score: Math.min(finalScore * 0.98, 97),
      isolation_forest_anomaly: finalScore > 70 ? -0.82 : finalScore > 30 ? -0.25 : 0.35,
      network_centrality: finalScore > 70 ? 84.5 : 12.0,
      behavioral_drift: Math.min(finalScore * 1.05, 96)
    },
    security_context: {
      device: {
        status: isNewDevice ? "NEW_DEVICE" : "TRUSTED",
        label: isNewDevice ? "New Device Detected" : "Trusted Device",
        details: isNewDevice ? "DEV-A7F92K (Unknown Profile)" : "DEV-MAC-881 (Cryptographic Enclave)"
      },
      location: {
        status: isNewLocation ? "UNUSUAL" : "VERIFIED",
        label: isNewLocation ? "Unusual Location" : "Verified Location",
        details: isNewLocation ? "Chennai, India (1,850km drift)" : "Bengaluru, India (Habitual)"
      },
      beneficiary: {
        status: isNewBeneficiary ? "NEW_BENEFICIARY" : "ESTABLISHED",
        label: isNewBeneficiary ? "New Beneficiary" : "Verified Beneficiary",
        details: isNewBeneficiary ? `${payload.beneficiary_name} (First transfer)` : `${payload.beneficiary_name} (Frequent)`
      },
      protection: {
        status: "ACTIVE",
        label: "AI Monitoring Active",
        details: "XGBoost + Isolation Forest + NetworkX heuristic nodes active"
      }
    },
    analyzed_at: new Date().toISOString()
  };

  // Add into memoryTransactions
  const newTxn: Transaction = {
    transaction_id: txnId,
    account_id: "ACC-2026-10482",
    account_name: "John Doe (Verified)",
    date: new Date().toISOString(),
    beneficiary: payload.beneficiary_name,
    beneficiary_account: payload.account_upi_id,
    amount: payload.amount,
    currency: "INR",
    risk_score: finalScore,
    risk_level,
    action,
    status: risk_level === 'HIGH' ? 'PAUSED' : risk_level === 'MEDIUM' ? 'VERIFICATION' : 'APPROVED',
    payment_method: payload.payment_method,
    payment_description: payload.payment_description || "Payment via JARVIS",
    device_id: isNewDevice ? "DEV-A7F92K" : "DEV-MAC-881",
    device_name: isNewDevice ? "Unknown Linux Workstation" : "MacBook Pro 16",
    location: isNewLocation ? "Chennai, India" : "Bengaluru, India",
    ip_address: isNewLocation ? "103.245.12.89" : "49.207.18.110",
    velocity: isHighVelocity ? "8 transactions / hour" : "1 transaction / day",
    reasons,
    signals,
    ai_explanation,
    model_breakdown: analysisResult.model_breakdown,
    security_context: analysisResult.security_context,
    verification_history: [
      { step: "Payment Initiated", timestamp: new Date().toISOString(), status: "REQUIRED" },
      { step: "Security Analysis", timestamp: new Date().toISOString(), status: "PASSED", details: `Assessed risk score ${finalScore}/100` }
    ],
    decision_history: [
      { action: action === 'PAUSE' ? 'PAYMENT_PAUSED' : action === 'VERIFY' ? 'VERIFY_REQUIRED' : 'AUTO_APPROVED', timestamp: new Date().toISOString(), actor: "JARVIS AI Engine" }
    ]
  };

  memoryTransactions = [newTxn, ...memoryTransactions];
  return analysisResult;
}

/**
 * 2. Verify Payment: POST /api/verify-payment
 */
export async function verifyPayment(payload: VerifyRequest): Promise<VerifyResponse> {
  const isConnected = await checkBackendConnectivity();

  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return (await response.json()) as VerifyResponse;
      }
    } catch {
      // Fallback
    }
  }

  // Demo OTP logic: accepts "123456"
  const cleanOtp = payload.otp.trim();
  if (cleanOtp === "123456") {
    // Update transaction history in memory
    const txn = memoryTransactions.find(t => t.transaction_id === payload.transaction_id);
    if (txn) {
      if (!txn.verification_history) txn.verification_history = [];
      txn.verification_history.push({
        step: "Identity OTP Verification",
        timestamp: new Date().toISOString(),
        status: "PASSED",
        details: "Demo 2FA OTP confirmed successfully"
      });
    }

    return {
      verified: true,
      message: "Identity verified successfully via demo OTP.",
      verification_token: `VTK-JARVIS-${Date.now()}`
    };
  }

  if (cleanOtp === "000000") {
    return {
      verified: false,
      message: "This demo OTP has expired. Please request a fresh security code.",
      error_type: "EXPIRED_OTP",
      attempts_remaining: 2
    };
  }

  return {
    verified: false,
    message: "Invalid OTP code entered. (Hint: For this hackathon prototype, use Demo OTP: 123456)",
    error_type: "INVALID_OTP",
    attempts_remaining: 2
  };
}

/**
 * 3. Recheck Payment: POST /api/recheck-payment
 * Core JARVIS feature: PAUSE → PROVE → RECHECK → RESPOND
 */
export async function recheckPayment(payload: RecheckRequest): Promise<RecheckResponse> {
  const isConnected = await checkBackendConnectivity();

  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/recheck-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        return (await response.json()) as RecheckResponse;
      }
    } catch {
      // Fallback
    }
  }

  // Find transaction
  const txn = memoryTransactions.find(t => t.transaction_id === payload.transaction_id);
  const prevScore = txn ? txn.risk_score : 92;
  const prevLevel = txn ? txn.risk_level : 'HIGH';

  // Successful verification recalculates model risk down to safe low zone
  const newScore = 28;
  const newLevel: RiskLevel = 'LOW';
  const action = 'APPROVE';
  const decision = 'PAYMENT CLEARED';

  const recheck_signals: RiskSignal[] = [
    {
      id: "SIG-RECHECK-1",
      icon: "ShieldCheck",
      name: "Out-of-Band OTP Verified",
      status: "PASS",
      category: "DEVICE",
      explanation: "2FA hardware challenge fulfilled directly by account owner.",
      weight: 0
    },
    {
      id: "SIG-RECHECK-2",
      icon: "UserCheck",
      name: "Beneficiary Explicitly Confirmed",
      status: "PASS",
      category: "BENEFICIARY",
      explanation: "Intent verified. Account owner confirmed transfer to recipient.",
      weight: 5
    },
    {
      id: "SIG-RECHECK-3",
      icon: "CheckCircle",
      name: "Synthetic Hijack Disproven",
      status: "PASS",
      category: "BEHAVIOR",
      explanation: "Human biometric & OTP interaction pattern conforms to genuine user response cadence.",
      weight: 12
    }
  ];

  const explanation = "AI-generated explanation based on rechecked signals: Successful identity proofing via out-of-band 2FA has mitigated the primary risk factors (unrecognized device and geofence drift). The residual risk score has dropped from 92 to 28 (LOW). JARVIS now recommends approving the payment.";

  if (txn) {
    txn.risk_score = newScore;
    txn.risk_level = newLevel;
    txn.action = 'APPROVE';
    txn.status = 'APPROVED';
    txn.recheck_performed = true;
    txn.signals = recheck_signals;
    txn.ai_explanation = explanation;
    if (!txn.decision_history) txn.decision_history = [];
    txn.decision_history.push({
      action: "RECHECK_PAYMENT_CLEARED",
      timestamp: new Date().toISOString(),
      actor: "JARVIS AI Engine",
      notes: `Risk re-evaluated: ${prevScore} → ${newScore}`
    });
  }

  return {
    transaction_id: payload.transaction_id,
    previous_risk_score: prevScore,
    previous_risk_level: prevLevel,
    current_risk_score: newScore,
    current_risk_level: newLevel,
    action,
    decision,
    explanation,
    recheck_signals,
    timestamp: new Date().toISOString()
  };
}

/**
 * 4. Execute Simulated Transfer
 */
export async function executeSimulatedTransfer(transactionId: string): Promise<SimulatedTransferResponse> {
  const txn = memoryTransactions.find(t => t.transaction_id === transactionId);
  const simTxnId = `TXN-CLEARED-${Math.floor(100000 + Math.random() * 900000)}`;

  if (txn) {
    txn.status = 'COMPLETED';
    if (!txn.decision_history) txn.decision_history = [];
    txn.decision_history.push({
      action: "SIMULATED_TRANSFER_EXECUTED",
      timestamp: new Date().toISOString(),
      actor: "JARVIS Payment Gateway (Simulated)",
      notes: `Simulated reference: ${simTxnId}`
    });
  }

  return {
    success: true,
    simulated_txn_id: simTxnId,
    timestamp: new Date().toISOString(),
    amount: txn ? txn.amount : 75000,
    beneficiary: txn ? txn.beneficiary : "Alex V.",
    message: "Transfer simulated and logged under protected ledger."
  };
}

/**
 * 5. Get Transactions: GET /api/transactions
 */
export async function getTransactions(): Promise<Transaction[]> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/transactions`);
      if (response.ok) {
        return (await response.json()) as Transaction[];
      }
    } catch {
      // Fallback
    }
  }
  return [...memoryTransactions];
}

/**
 * 6. Get Transaction Detail: GET /api/transactions/{transaction_id}
 */
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/transactions/${transactionId}`);
      if (response.ok) {
        return (await response.json()) as Transaction;
      }
    } catch {
      // Fallback
    }
  }
  const found = memoryTransactions.find(t => t.transaction_id === transactionId);
  return found || memoryTransactions[0];
}

/**
 * 7. Get Dashboard: GET /api/dashboard
 */
export async function getDashboard(): Promise<DashboardData> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`);
      if (response.ok) {
        return (await response.json()) as DashboardData;
      }
    } catch {
      // Fallback
    }
  }

  const highCount = memoryTransactions.filter(t => t.risk_level === 'HIGH' || t.status === 'PAUSED' || t.status === 'HELD').length;

  return {
    available_balance: 284500,
    currency: "INR",
    protected_transactions_count: memoryTransactions.length + 148,
    risk_events_count: highCount + 4,
    security_status: {
      ai_protection_active: true,
      device_trusted: true,
      location_verified: true,
      secure_session: true,
    },
    recent_transactions: memoryTransactions.slice(0, 5),
    risk_trends: [
      { date: "Mon", avg_risk: 18, max_risk: 42 },
      { date: "Tue", avg_risk: 14, max_risk: 38 },
      { date: "Wed", avg_risk: 22, max_risk: 58 },
      { date: "Thu", avg_risk: 19, max_risk: 40 },
      { date: "Fri", avg_risk: 31, max_risk: 74 },
      { date: "Sat", avg_risk: 44, max_risk: 96 },
      { date: "Today", avg_risk: 38, max_risk: 92 },
    ]
  };
}

/**
 * 8. Get Admin Alerts: GET /api/admin/alerts
 */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/admin/alerts`);
      if (response.ok) {
        return (await response.json()) as AdminAlert[];
      }
    } catch {
      // Fallback
    }
  }

  return [
    {
      id: "ALT-01",
      transaction_id: "TXN-2026-0918-7842",
      account_id: "ACC-2026-10482",
      beneficiary: "Alex V. (BEN-77421)",
      amount: 75000,
      risk_score: 92,
      risk_level: "HIGH",
      action: "PAUSE",
      status: "PAUSED",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      primary_flag: "New Device + Geo Drift + High Velocity",
      severity: "CRITICAL"
    },
    {
      id: "ALT-02",
      transaction_id: "TXN-2026-0916-1184",
      account_id: "ACC-2026-10482",
      beneficiary: "Anonymous Crypto Gateway",
      amount: 140000,
      risk_score: 96,
      risk_level: "HIGH",
      action: "HOLD",
      status: "HELD",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      primary_flag: "Tor Exit Node Relay + Sanctioned Recipient",
      severity: "CRITICAL"
    },
    {
      id: "ALT-03",
      transaction_id: "TXN-2026-0915-3391",
      account_id: "ACC-2026-89110",
      beneficiary: "Overseas P2P Merchant",
      amount: 62000,
      risk_score: 79,
      risk_level: "HIGH",
      action: "PAUSE",
      status: "PAUSED",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      primary_flag: "SIM Swap Flag + Velocity Spike (11 req/hr)",
      severity: "HIGH"
    }
  ];
}

/**
 * 9. Get Admin Statistics: GET /api/admin/statistics
 */
export async function getAdminStatistics(): Promise<AdminStatistics> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/admin/statistics`);
      if (response.ok) {
        return (await response.json()) as AdminStatistics;
      }
    } catch {
      // Fallback
    }
  }

  return {
    total_transactions: 14820,
    high_risk_transactions: 342,
    paused_payments: 128,
    open_cases: 19,
    prevention_rate_pct: 99.4,
    total_monitored_volume: 48920000,
    risk_distribution: {
      low: 13240,
      medium: 1238,
      high: 342
    },
    volume_trends: [
      { time: "00:00", total: 420, flagged: 8 },
      { time: "04:00", total: 180, flagged: 14 },
      { time: "08:00", total: 980, flagged: 22 },
      { time: "12:00", total: 1840, flagged: 45 },
      { time: "16:00", total: 2190, flagged: 68 },
      { time: "20:00", total: 1420, flagged: 39 },
    ],
    risk_distribution_pie: [
      { name: "Low Risk (0-29)", value: 89, color: "#10b981" },
      { name: "Medium Risk (30-69)", value: 8, color: "#f59e0b" },
      { name: "High Risk (70-100)", value: 3, color: "#ef4444" },
    ],
    high_risk_events_trend: [
      { day: "Day 1", velocity_spikes: 12, new_device_anomalies: 8, geo_drifts: 5 },
      { day: "Day 2", velocity_spikes: 18, new_device_anomalies: 11, geo_drifts: 7 },
      { day: "Day 3", velocity_spikes: 15, new_device_anomalies: 9, geo_drifts: 12 },
      { day: "Day 4", velocity_spikes: 24, new_device_anomalies: 16, geo_drifts: 14 },
      { day: "Day 5", velocity_spikes: 21, new_device_anomalies: 14, geo_drifts: 9 },
      { day: "Day 6", velocity_spikes: 32, new_device_anomalies: 22, geo_drifts: 18 },
      { day: "Day 7", velocity_spikes: 27, new_device_anomalies: 19, geo_drifts: 15 },
    ],
    approved_vs_paused: [
      { month: "May", approved: 3200, paused: 45, held: 12 },
      { month: "Jun", approved: 3850, paused: 52, held: 18 },
      { month: "Jul", approved: 4400, paused: 68, held: 24 },
      { month: "Aug", approved: 4920, paused: 74, held: 29 },
      { month: "Sep", approved: 5310, paused: 89, held: 34 },
    ]
  };
}

/**
 * 10. Get Fraud Graph (NetworkX format): GET /api/graph/{transaction_id}
 */
export async function getFraudGraph(transactionId: string): Promise<GraphData> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/graph/${transactionId}`);
      if (response.ok) {
        return (await response.json()) as GraphData;
      }
    } catch {
      // Fallback
    }
  }

  // NetworkX Entity Graph: nodes & edges representing transaction relationships
  return {
    transaction_id: transactionId,
    fraud_ring_detected: true,
    centrality_risk_score: 88.4,
    nodes: [
      {
        id: "ACCOUNT",
        label: "ACC-2026-10482 (John Doe)",
        type: "account",
        riskScore: 24,
        meta: { balance: "₹2,84,500", tenure: "4.2 yrs", tier: "Gold" }
      },
      {
        id: "TRANSACTION",
        label: `${transactionId} (₹75,000)`,
        type: "transaction",
        riskScore: 92,
        highlight: true,
        meta: { amount: "₹75,000", time: "18m ago", status: "PAUSED" }
      },
      {
        id: "DEVICE",
        label: "DEV-A7F92K (Linux Chrome 124)",
        type: "device",
        riskScore: 84,
        highlight: true,
        meta: { trust: "Untrusted", firstSeen: "Today", fingerprint: "fp_982f...a12" }
      },
      {
        id: "BENEFICIARY",
        label: "BEN-77421 (Alex V.)",
        type: "beneficiary",
        riskScore: 78,
        highlight: true,
        meta: { bank: "Axis Bank", age: "18 mins", flag: "New Recipient" }
      },
      {
        id: "LOCATION",
        label: "Geo: Chennai, Tamil Nadu",
        type: "location",
        riskScore: 75,
        meta: { isp: "Airtel Broadband", drift: "1,850 km" }
      },
      {
        id: "IP",
        label: "IP: 103.245.12.89",
        type: "ip",
        riskScore: 68,
        meta: { reverseDns: "static-103.airtel.in", proxy: "No" }
      },
      {
        id: "MULE_CLUSTER",
        label: "Cluster: Mule Ring #420",
        type: "mule_account",
        riskScore: 97,
        highlight: true,
        meta: { linkedEntities: "6 Accounts", pattern: "Smurfing", watchlist: "Active" }
      }
    ],
    edges: [
      { id: "e1", source: "ACCOUNT", target: "TRANSACTION", label: "INITIATES", suspicious: false },
      { id: "e2", source: "TRANSACTION", target: "BENEFICIARY", label: "TRANSFER_TARGET", suspicious: true, weight: 8 },
      { id: "e3", source: "ACCOUNT", target: "DEVICE", label: "LOGGED_IN_FROM", suspicious: true, weight: 7 },
      { id: "e4", source: "DEVICE", target: "LOCATION", label: "GEO_LOCATED_AT", suspicious: true, weight: 6 },
      { id: "e5", source: "DEVICE", target: "IP", label: "CONNECTED_VIA", suspicious: false },
      { id: "e6", source: "BENEFICIARY", target: "MULE_CLUSTER", label: "NETWORKX_2_HOP_LINK", suspicious: true, weight: 10 }
    ]
  };
}

/**
 * Alias for getTransaction
 */
export async function getTransactionDetails(transactionId: string): Promise<Transaction | null> {
  return getTransaction(transactionId);
}

/**
 * 11. Get Security Status: GET /api/security/status
 */
export async function getSecurityStatus(): Promise<SecurityStatusResponse> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/security/status`);
      if (response.ok) {
        return (await response.json()) as SecurityStatusResponse;
      }
    } catch {
      // Fallback
    }
  }

  return {
    health_score: 94,
    health_label: "EXCELLENT",
    mitigation_rate: "100%",
    latency_ms: 42,
    timeline: [
      {
        event: "Payment Analyzed & Paused",
        time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        detail: "TXN-2026-0918-7842 (₹75,000) paused due to unfamiliar Linux device and geographic drift.",
      },
      {
        event: "Risk Assessment Completed",
        time: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        detail: "XGBoost and Isolation Forest scored composite risk at 92/100 HIGH.",
      },
      {
        event: "Device Telemetry Registered",
        time: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        detail: "DEV-A7F92K encountered from Chennai, India IP.",
      },
      {
        event: "Authorized Session Initialized",
        time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        detail: "Primary trusted token validated on ACC-2026-10482.",
      },
    ],
  };
}

/**
 * 12. Get Admin SOC Dashboard Stats: GET /api/admin/dashboard
 */
export async function getAdminDashboard(): Promise<AdminStats> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`);
      if (response.ok) {
        return (await response.json()) as AdminStats;
      }
    } catch {
      // Fallback
    }
  }

  const pausedCount = memoryTransactions.filter(t => t.status === 'PAUSED').length;
  const highRiskCount = memoryTransactions.filter(t => t.risk_level === 'HIGH').length;

  return {
    total_transactions: 1280,
    high_risk_transactions: highRiskCount + 13,
    paused_payments: pausedCount + 2,
    open_cases: 2,
    volume_chart: [
      { hour: "00:00", volume: 42, intercepted: 1 },
      { hour: "04:00", volume: 18, intercepted: 0 },
      { hour: "08:00", volume: 95, intercepted: 3 },
      { hour: "12:00", volume: 210, intercepted: 8 },
      { hour: "16:00", volume: 260, intercepted: 12 },
      { hour: "20:00", volume: 180, intercepted: 5 },
      { hour: "23:00", volume: 85, intercepted: 2 },
    ],
    risk_distribution: [
      { name: "Low Risk", value: 88 },
      { name: "Medium Risk", value: 9 },
      { name: "High Risk", value: 3 },
    ],
    high_risk_chart: [
      { day: "Mon", events: 2 },
      { day: "Tue", events: 1 },
      { day: "Wed", events: 4 },
      { day: "Thu", events: 2 },
      { day: "Fri", events: 6 },
      { day: "Sat", events: 8 },
      { day: "Sun", events: 3 },
    ],
    approved_vs_paused: [
      { day: "Mon", approved: 140, paused: 2 },
      { day: "Tue", approved: 165, paused: 1 },
      { day: "Wed", approved: 190, paused: 4 },
      { day: "Thu", approved: 180, paused: 2 },
      { day: "Fri", approved: 240, paused: 7 },
      { day: "Sat", approved: 210, paused: 9 },
      { day: "Sun", approved: 155, paused: 3 },
    ],
    recent_high_risk: [
      {
        transaction_id: "TXN-2026-0918-7842",
        user: "John Doe (ACC-2026-10482)",
        beneficiary: "Alex V. (BEN-77421)",
        amount: 75000,
        risk_score: 92,
        status: "PAUSED",
        date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        transaction_id: "TXN-2026-0916-1184",
        user: "John Doe (ACC-2026-10482)",
        beneficiary: "Anonymous Crypto Gateway",
        amount: 140000,
        risk_score: 96,
        status: "HELD",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        transaction_id: "TXN-2026-0915-3391",
        user: "Sarah Jenkins (ACC-2026-89110)",
        beneficiary: "Overseas P2P Merchant",
        amount: 62000,
        risk_score: 79,
        status: "PAUSED",
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
    ],
  };
}

/**
 * 13. Get Investigation Details: GET /api/admin/investigation/{id}
 */
export async function getInvestigationDetails(transactionId: string): Promise<InvestigationData> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/admin/investigation/${transactionId}`);
      if (response.ok) {
        return (await response.json()) as InvestigationData;
      }
    } catch {
      // Fallback
    }
  }

  const txn = (await getTransaction(transactionId)) || memoryTransactions[0];
  const graph = await getFraudGraph(transactionId);

  return {
    transaction: txn,
    velocity: {
      transactions_last_hour: 8,
      total_amount_last_hour: 125000,
      rapid_sequence_flag: true,
    },
    network_graph: graph,
    risk_signals: txn.signals || [],
  };
}

/**
 * 14. Take Admin Action: POST /api/admin/action
 */
export async function takeAdminAction(
  transactionId: string,
  action: 'APPROVE' | 'HOLD' | 'FRAUD',
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const isConnected = await checkBackendConnectivity();
  if (isConnected) {
    try {
      const response = await fetch(`${API_URL}/api/admin/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: transactionId, action, notes }),
      });
      if (response.ok) {
        return (await response.json()) as { success: boolean; message: string };
      }
    } catch {
      // Fallback
    }
  }

  const txn = memoryTransactions.find(t => t.transaction_id === transactionId);
  if (txn) {
    if (action === 'APPROVE') {
      txn.status = 'APPROVED';
      txn.action = 'APPROVE';
    } else if (action === 'HOLD') {
      txn.status = 'HELD';
      txn.action = 'HOLD';
    } else {
      txn.status = 'HELD';
      txn.action = 'HOLD';
      txn.risk_score = 99;
      txn.risk_level = 'HIGH';
    }

    if (!txn.decision_history) txn.decision_history = [];
    txn.decision_history.push({
      action: `ADMIN_${action}`,
      timestamp: new Date().toISOString(),
      actor: "SOC Lead Analyst",
      notes: notes || `Admin action ${action} confirmed by operator.`
    });
  }

  const actionMsg =
    action === 'APPROVE'
      ? `Transaction ${transactionId} has been manually approved and pushed to settlement.`
      : action === 'HOLD'
      ? `Transaction ${transactionId} is held under manual SOC review.`
      : `Transaction ${transactionId} flagged as confirmed fraud. Beneficiary blacklisted.`;

  return {
    success: true,
    message: actionMsg,
  };
}

