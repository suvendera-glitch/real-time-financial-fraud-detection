import { RiskLevel, RiskSignal } from './risk';

export interface PaymentRequest {
  beneficiary_name: string;
  account_upi_id: string;
  amount: number;
  payment_description: string;
  payment_method: 'Bank Transfer' | 'UPI' | 'Wallet';
  device_id?: string;
  location?: string;
  is_new_device?: boolean;
  is_new_location?: boolean;
  is_new_beneficiary?: boolean;
  velocity_count?: number;
}

export interface VerifyRequest {
  transaction_id: string;
  otp: string;
}

export interface VerifyResponse {
  verified: boolean;
  message?: string;
  attempts_remaining?: number;
  verification_token?: string;
  error_type?: 'INVALID_OTP' | 'EXPIRED_OTP' | 'MAX_ATTEMPTS_EXCEEDED';
}

export interface RecheckRequest {
  transaction_id: string;
  verification_token?: string;
}

export interface RecheckResponse {
  transaction_id: string;
  previous_risk_score: number;
  previous_risk_level: RiskLevel;
  current_risk_score: number;
  current_risk_level: RiskLevel;
  action: 'APPROVE' | 'HOLD';
  decision: 'PAYMENT CLEARED' | 'PAYMENT REMAINS ON HOLD';
  explanation: string;
  recheck_signals: RiskSignal[];
  timestamp: string;
}

export interface SimulatedTransferResponse {
  success: boolean;
  simulated_txn_id: string;
  timestamp: string;
  amount: number;
  beneficiary: string;
  message: string;
}
