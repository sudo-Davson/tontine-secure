// lib/services/abonnement-service.ts

export type TypeAbonnement = 'GRATUIT' | 'PREMIUM' | 'BUSINESS';

export interface Abonnement {
  type: TypeAbonnement;
  montantMensuel: number;
  tontinesMax: number;
  membresMax: number;
  notificationsSMS: boolean;
  rapportsAvances: boolean;
  supportPrioritaire: boolean;
  apiAccess: boolean;
}

export const ABONNEMENTS: Record<TypeAbonnement, Abonnement> = {
  GRATUIT: {
    type: 'GRATUIT',
    montantMensuel: 0,
    tontinesMax: 2,
    membresMax: 10,
    notificationsSMS: false,
    rapportsAvances: false,
    supportPrioritaire: false,
    apiAccess: false,
  },
  PREMIUM: {
    type: 'PREMIUM',
    montantMensuel: 2500,
    tontinesMax: 10,
    membresMax: 50,
    notificationsSMS: true,
    rapportsAvances: true,
    supportPrioritaire: true,
    apiAccess: false,
  },
  BUSINESS: {
    type: 'BUSINESS',
    montantMensuel: 10000,
    tontinesMax: -1, // Illimité
    membresMax: -1, // Illimité
    notificationsSMS: true,
    rapportsAvances: true,
    supportPrioritaire: true,
    apiAccess: true,
  },
};

export class AbonnementService {
  getAbonnement(type: TypeAbonnement): Abonnement {
    return ABONNEMENTS[type];
  }

  canCreateTontine(abonnement: TypeAbonnement, tontinesActives: number): boolean {
    const abo = ABONNEMENTS[abonnement];
    if (abo.tontinesMax === -1) return true;
    return tontinesActives < abo.tontinesMax;
  }

  canAddMember(abonnement: TypeAbonnement, membresActuels: number): boolean {
    const abo = ABONNEMENTS[abonnement];
    if (abo.membresMax === -1) return true;
    return membresActuels < abo.membresMax;
  }
}

export const abonnementService = new AbonnementService();