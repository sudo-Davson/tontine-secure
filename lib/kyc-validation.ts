// lib/kyc-validation.ts
import { DocumentType, OCRData } from './kyc-types';

export function validateDocumentType(type: string): DocumentType | null {
  const acceptedTypes: DocumentType[] = ['CNI', 'PASSPORT'];
  return acceptedTypes.includes(type as DocumentType) ? (type as DocumentType) : null;
}

export function validateCNI(data: OCRData): boolean {
  // Validation basique d'une CNI
  if (!data.documentNumber || !data.firstName || !data.lastName) {
    return false;
  }
  
  // Vérifier le format du numéro (varie selon le pays)
  // Exemple pour la Côte d'Ivoire : format spécifique
  if (data.documentNumber.length < 6) {
    return false;
  }
  
  // Vérifier la date d'expiration
  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    if (expiry < new Date()) {
      return false; // Document expiré
    }
  }
  
  return true;
}

export function validatePassport(data: OCRData): boolean {
  // Validation basique d'un passeport
  if (!data.documentNumber || !data.firstName || !data.lastName) {
    return false;
  }
  
  // Le numéro de passeport fait généralement 9 caractères
  if (data.documentNumber.length < 7) {
    return false;
  }
  
  // Vérifier la date d'expiration
  if (data.expiryDate) {
    const expiry = new Date(data.expiryDate);
    if (expiry < new Date()) {
      return false;
    }
  }
  
  return true;
}

export function calculateFaceMatchScore(image1: string, image2: string): number {
  // Simulation de calcul de score de correspondance faciale
  // Dans une vraie implémentation, cela utiliserait un service de reconnaissance faciale
  return Math.random() * 100;
}

export function calculateDocumentAuthScore(documentType: DocumentType, ocrData: OCRData): number {
  let score = 0;
  
  // Score basé sur la complétude des données
  if (ocrData.documentNumber) score += 30;
  if (ocrData.firstName) score += 15;
  if (ocrData.lastName) score += 15;
  if (ocrData.dateOfBirth) score += 10;
  if (ocrData.expiryDate) score += 10;
  if (ocrData.confidence && ocrData.confidence > 0.8) score += 20;
  
  return Math.min(score, 100);
}

export function determineVerificationLevel(userData: any): 1 | 2 | 3 {
  if (userData.emailVerified && userData.phoneVerified) {
    return 1;
  }
  return 1;
}