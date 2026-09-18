export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskAction = 'APPROVE' | 'VERIFY' | 'PAUSE' | 'HOLD';

export interface RiskSignal {
  id: string;
  icon: string;
  name: string;
  status: 'CRITICAL' | 'WARNING' | 'INFO' | 'PASS';
  explanation: string;
  weight?: number;
  category?: 'DEVICE' | 'BEHAVIOR' | 'BENEFICIARY' | 'NETWORK' | 'VELOCITY' | 'LOCATION';
}

export interface ModelBreakdown {
  xgboost_score: number; // 0-100
  isolation_forest_anomaly: number; // e.g. -0.85 (outlier) or 0.12 (normal)
  network_centrality: number; // 0-100
  behavioral_drift: number; // 0-100
}

export interface SecurityContext {
  device: {
    status: 'TRUSTED' | 'NEW_DEVICE' | 'SUSPICIOUS';
    label: string;
    details: string;
  };
  location: {
    status: 'VERIFIED' | 'UNUSUAL' | 'HIGH_RISK_GEO';
    label: string;
    details: string;
  };
  beneficiary: {
    status: 'ESTABLISHED' | 'NEW_BENEFICIARY' | 'WATCHLIST_MATCH';
    label: string;
    details: string;
  };
  protection: {
    status: 'ACTIVE' | 'ENHANCED';
    label: string;
    details: string;
  };
}

export interface PaymentAnalysisResponse {
  transaction_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  action: RiskAction;
  reasons: string[];
  signals: RiskSignal[];
  ai_explanation: string;
  model_breakdown: ModelBreakdown;
  security_context: SecurityContext;
  analyzed_at: string;
}

export interface SecurityStatusResponse {
  health_score: number;
  health_label: string;
  mitigation_rate: string;
  latency_ms: number;
  timeline: {
    event: string;
    time: string;
    detail: string;
  }[];
}

