// lib/services/tontine-service.ts

// ============================================
// TYPES
// ============================================
export type TontineStatus = 'EN_ATTENTE' | 'ACTIVE' | 'TERMINEE' | 'ANNULEE';
export type MembreStatus = 'ACTIF' | 'SUSPENDU' | 'EXCLU';
export type CotisationStatus = 'EN_ATTENTE' | 'PAYEE' | 'EN_RETARD' | 'ANNULEE';
export type TransactionType = 'COTISATION' | 'DISTRIBUTION' | 'PENALITE' | 'RETRAIT';

export interface Membre {
  id: string;
  nom: string;
  telephone: string;
  reputation: number;
  statut: MembreStatus;
  nbRetards: number;
  nbAbsences: number;
  toursRecus: number;
}

export interface Tontine {
  id: string;
  nom: string;
  description: string;
  montant: number;
  frequence: 'HEBDOMADAIRE' | 'BIHEBDOMADAIRE' | 'MENSUEL' | 'TRIMESTRIEL';
  nombreMembres: number;
  nombreTours: number;
  tourActuel: number;
  modeRotation: 'ALEATOIRE' | 'ORDRE_FIXE' | 'ENCHERES';
  statut: TontineStatus;
  createurId: string;
  methodePaiement: 'TMONEY' | 'FLOOZ';
  numeroCollecte: string;
  penaliteRetard: number;
  delaiGrace: number;
  montantCollecte: number;
  montantTotal: number;
  membres: Membre[];
  dateCreation: Date;
  prochaineEcheance: Date;
}

export interface Cotisation {
  id: string;
  tontineId: string;
  membreId: string;
  tour: number;
  montant: number;
  statut: CotisationStatus;
  dateEcheance: Date;
  datePaiement?: Date;
  methodePaiement?: 'TMONEY' | 'FLOOZ';
  reference?: string;
}

// ============================================
// RÈGLES MÉTIER
// ============================================
export const REGLES = {
  // Réputation
  REPUTATION_MIN_POUR_CREER: 70,
  REPUTATION_MIN_POUR_PARTICIPER: 30,
  BONUS_PAIEMENT_A_TEMPS: 5,
  PENALITE_RETARD_REPUTATION: 5,
  PENALITE_NON_PAIEMENT_REPUTATION: 10,
  PENALITE_ABANDON_REPUTATION: 20,

  // Limites
  MAX_TONTINES_SIMULTANEES: 3,
  MAX_RETARDS_AVANT_SUSPENSION: 3,
  MAX_ABSENCES_AVANT_EXCLUSION: 2,

  // Délais
  JOURS_AVANT_SUSPENSION: 15,
  JOURS_AVANT_EXCLUSION: 30,
};

// ============================================
// SERVICE DE TONTINE
// ============================================
export class TontineService {
  
  // Vérifier si un utilisateur peut créer une tontine
  canCreateTontine(user: {
    kycLevel: number;
    reputation: number;
    tontinesActives: number;
  }): { success: boolean; message: string } {
    
    if (user.kycLevel < 2) {
      return { success: false, message: 'Vous devez compléter le KYC Niveau 2' };
    }
    
    if (user.reputation < REGLES.REPUTATION_MIN_POUR_CREER) {
      return { 
        success: false, 
        message: `Votre réputation (${user.reputation}%) est insuffisante. Minimum requis : ${REGLES.REPUTATION_MIN_POUR_CREER}%` 
      };
    }
    
    if (user.tontinesActives >= REGLES.MAX_TONTINES_SIMULTANEES) {
      return { 
        success: false, 
        message: `Vous avez atteint la limite de ${REGLES.MAX_TONTINES_SIMULTANEES} tontines simultanées` 
      };
    }
    
    return { success: true, message: 'Vous pouvez créer une tontine' };
  }

  // Calculer la pénalité de retard
  calculatePenalite(
    dateEcheance: Date,
    datePaiement: Date,
    penaliteParJour: number
  ): number {
    const joursRetard = Math.floor(
      (datePaiement.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (joursRetard <= 0) return 0;
    
    return joursRetard * penaliteParJour;
  }

  // Vérifier si un membre est en retard
  isEnRetard(cotisation: Cotisation): boolean {
    if (cotisation.statut === 'PAYEE') return false;
    
    const maintenant = new Date();
    return maintenant > cotisation.dateEcheance;
  }

  // Mettre à jour la réputation d'un membre
  updateReputation(membre: Membre, action: 'PAIEMENT' | 'RETARD' | 'ABSENCE' | 'ABANDON'): Membre {
    const updatedMembre = { ...membre };
    
    switch (action) {
      case 'PAIEMENT':
        updatedMembre.reputation = Math.min(100, updatedMembre.reputation + REGLES.BONUS_PAIEMENT_A_TEMPS);
        break;
      case 'RETARD':
        updatedMembre.reputation = Math.max(0, updatedMembre.reputation - REGLES.PENALITE_RETARD_REPUTATION);
        updatedMembre.nbRetards += 1;
        break;
      case 'ABSENCE':
        updatedMembre.reputation = Math.max(0, updatedMembre.reputation - REGLES.PENALITE_NON_PAIEMENT_REPUTATION);
        updatedMembre.nbAbsences += 1;
        break;
      case 'ABANDON':
        updatedMembre.reputation = Math.max(0, updatedMembre.reputation - REGLES.PENALITE_ABANDON_REPUTATION);
        updatedMembre.statut = 'EXCLU';
        break;
    }
    
    // Vérifier la suspension
    if (updatedMembre.nbRetards >= REGLES.MAX_RETARDS_AVANT_SUSPENSION) {
      updatedMembre.statut = 'SUSPENDU';
    }
    
    // Vérifier l'exclusion
    if (updatedMembre.nbAbsences >= REGLES.MAX_ABSENCES_AVANT_EXCLUSION) {
      updatedMembre.statut = 'EXCLU';
    }
    
    return updatedMembre;
  }

  // Vérifier si toutes les cotisations d'un tour sont payées
  toutesCotisationsPayees(cotisations: Cotisation[]): boolean {
    return cotisations.every(c => c.statut === 'PAYEE');
  }

  // Vérifier si la distribution peut avoir lieu
  peutDistribuer(cotisations: Cotisation[]): { success: boolean; message: string } {
    const nonPayees = cotisations.filter(c => c.statut !== 'PAYEE');
    
    if (nonPayees.length > 0) {
      return {
        success: false,
        message: `${nonPayees.length} membre(s) n'ont pas encore cotisé. La distribution est bloquée.`
      };
    }
    
    return { success: true, message: 'Toutes les cotisations sont payées. Distribution possible.' };
  }

  // Calculer le prochain tour
  calculerProchainTour(
    membres: Membre[],
    modeRotation: 'ALEATOIRE' | 'ORDRE_FIXE' | 'ENCHERES',
    tourActuel: number
  ): Membre | null {
    const membresActifs = membres.filter(m => m.statut === 'ACTIF');
    
    if (membresActifs.length === 0) return null;
    
    switch (modeRotation) {
      case 'ALEATOIRE':
        const indexAleatoire = Math.floor(Math.random() * membresActifs.length);
        return membresActifs[indexAleatoire];
        
      case 'ORDRE_FIXE':
        return membresActifs[tourActuel % membresActifs.length];
        
      case 'ENCHERES':
        // Logique d'enchères à implémenter
        return membresActifs[0];
        
      default:
        return null;
    }
  }
}

// ============================================
// INSTANCE UNIQUE
// ============================================
export const tontineService = new TontineService();