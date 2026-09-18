import { RiskLevel, RiskAction, RiskSignal, ModelBreakdown, SecurityContext } from './risk';

export type TransactionStatus = 'APPROVED' | 'VERIFICATION' | 'PAUSED' | 'HELD' | 'COMPLETED' | 'CANCELLED';

export interface VerificationHistoryItem {
  step: string;
  timestamp: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'REQUIRED';
  details?: string;
}

export interface DecisionHistoryItem {
  action: string;
  timestamp: string;
  actor: string;
  notes?: string;
}

export interface Transaction {
  transaction_id: string;
  account_id: string;
  account_name: string;
  date: string;
  beneficiary: string;
  beneficiary_account: string;
  amount: number;
  currency: string;
  risk_score: number;
  risk_level: RiskLevel;
  action: RiskAction;
  status: TransactionStatus;
  payment_method: string;
  payment_description?: string;
  device_id: string;
  device_name: string;
  location: string;
  ip_address: string;
  velocity: string;
  reasons: string[];
  signals: RiskSignal[];
  ai_explanation: string;
  model_breakdown?: ModelBreakdown;
  security_context?: SecurityContext;
  verification_history?: VerificationHistoryItem[];
  decision_history?: DecisionHistoryItem[];
  recheck_performed?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'account' | 'device' | 'beneficiary' | 'transaction' | 'location' | 'ip' | 'mule_account';
  riskScore?: number;
  highlight?: boolean;
  meta?: Record<string, string | number>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  suspicious?: boolean;
  weight?: number;
}

export interface GraphData {
  transaction_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  fraud_ring_detected: boolean;
  centrality_risk_score: number;
}

export interface AdminAlert {
  id: string;
  transaction_id: string;
  account_id: string;
  beneficiary: string;
  amount: number;
  risk_score: number;
  risk_level: RiskLevel;
  action: RiskAction;
  status: TransactionStatus;
  timestamp: string;
  primary_flag: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface AdminStatistics {
  total_transactions: number;
  high_risk_transactions: number;
  paused_payments: number;
  open_cases: number;
  prevention_rate_pct: number;
  total_monitored_volume: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  volume_trends: {
    time: string;
    total: number;
    flagged: number;
  }[];
  risk_distribution_pie: {
    name: string;
    value: number;
    color: string;
  }[];
  high_risk_events_trend: {
    day: string;
    velocity_spikes: number;
    new_device_anomalies: number;
    geo_drifts: number;
  }[];
  approved_vs_paused: {
    month: string;
    approved: number;
    paused: number;
    held: number;
  }[];
}

export interface DashboardData {
  available_balance: number;
  currency: string;
  protected_transactions_count: number;
  risk_events_count: number;
  security_status: {
    ai_protection_active: boolean;
    device_trusted: boolean;
    location_verified: boolean;
    secure_session: boolean;
  };
  recent_transactions: Transaction[];
  risk_trends: {
    date: string;
    avg_risk: number;
    max_risk: number;
  }[];
}

export interface AdminStats {
  total_transactions: number;
  high_risk_transactions: number;
  paused_payments: number;
  open_cases: number;
  volume_chart: { hour: string; volume: number; intercepted: number }[];
  risk_distribution: { name: string; value: number }[];
  high_risk_chart: { day: string; events: number }[];
  approved_vs_paused: { day: string; approved: number; paused: number }[];
  recent_high_risk: {
    transaction_id: string;
    user: string;
    beneficiary: string;
    amount: number;
    risk_score: number;
    status: TransactionStatus;
    date: string;
  }[];
}

export interface InvestigationData {
  transaction: Transaction;
  velocity: {
    transactions_last_hour: number;
    total_amount_last_hour: number;
    rapid_sequence_flag: boolean;
  };
  network_graph: GraphData;
  risk_signals: RiskSignal[];
}

