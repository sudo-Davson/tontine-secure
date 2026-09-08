// lib/kyc-types.ts
export type VerificationLevel = 1 | 2 | 3;

export type DocumentType = 'CNI' | 'PASSPORT';

export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface KYCInfo {
  userId: string;
  level: VerificationLevel;
  status: VerificationStatus;
  
  // Niveau 1
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Niveau 2
  documentType?: DocumentType;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  documentExpiryDate?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  passportImageUrl?: string;
  selfieImageUrl?: string;
  
  // Niveau 3
  addressVerified?: boolean;
  faceMatchScore?: number;
  documentAuthScore?: number;
  additionalChecks?: string[];
  
  // Horodatage
  submittedAt?: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: DocumentType;
  side: 'FRONT' | 'BACK' | 'PASSPORT' | 'SELFIE';
  imageUrl: string;
  uploadDate: Date;
  verificationStatus: VerificationStatus;
  ocrData?: OCRData;
}

export interface OCRData {
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  confidence?: number;
  rawText?: string;
}

export interface VerificationResult {
  success: boolean;
  level: VerificationLevel;
  status: VerificationStatus;
  message: string;
  score?: number;
  details?: any;
}