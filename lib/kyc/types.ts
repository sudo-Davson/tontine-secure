// lib/kyc/types.ts
export interface VerificationResult {
  success: boolean;
  documentVerified: boolean;
  faceMatch: boolean;
  livenessCheck: boolean;
  confidenceScore: number;
  resultCode: string;
  resultText: string;
}

export interface FraudCheckResult {
  isFraudulent: boolean;
  fraudScore: number;
  checks: boolean[];
  recommendedAction: string;
}

export interface UserData {
  userId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  dateOfBirth: string;
  country: string;
  documentType: 'CNI' | 'PASSPORT';
}