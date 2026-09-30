// lib/services/frais-service.ts

// ============================================
// TYPES
// ============================================
export type TypeFrais = 'COTISATION' | 'DISTRIBUTION' | 'RETRAIT' | 'KYC' | 'ABONNEMENT';

export interface Frais {
  type: TypeFrais;
  montant: number;
  pourcentage: number;
  montantMinimum: number;
  montantMaximum: number;
}

export interface CalculFrais {
  montantTransaction: number;
  frais: number;
  montantTotal: number;
  details: string;
}

// ============================================
// CONFIGURATION DES FRAIS
// ============================================
export const FRAIS_CONFIG = {
  COTISATION: {
    pourcentage: 1, // 1%
    minimum: 50,    // 50 FCFA
    maximum: 500,   // 500 FCFA
  },
  DISTRIBUTION: {
    pourcentage: 1.5, // 1.5%
    minimum: 100,     // 100 FCFA
    maximum: 1000,    // 1000 FCFA
  },
  RETRAIT: {
    pourcentage: 1, // 1%
    minimum: 50,    // 50 FCFA
    maximum: 500,   // 500 FCFA
  },
  KYC_NIVEAU_2: {
    montantFixe: 1000, // 1000 FCFA
  },
  KYC_NIVEAU_3: {
    montantFixe: 5000, // 5000 FCFA
  },
  ABONNEMENT_PREMIUM: {
    mensuel: 2500, // 2500 FCFA/mois
    annuel: 25000, // 25000 FCFA/an (2 mois gratuits)
  },
  ABONNEMENT_BUSINESS: {
    mensuel: 10000, // 10000 FCFA/mois
    annuel: 100000, // 100000 FCFA/an (2 mois gratuits)
  },
};

// ============================================
// SERVICE DE FRAIS
// ============================================
export class FraisService {
  
  // Calculer les frais de transaction
  calculerFrais(
    montant: number,
    type: 'COTISATION' | 'DISTRIBUTION' | 'RETRAIT'
  ): CalculFrais {
    const config = FRAIS_CONFIG[type];
    let frais = (montant * config.pourcentage) / 100;
    
    // Appliquer le minimum
    if (frais < config.minimum) {
      frais = config.minimum;
    }
    
    // Appliquer le maximum
    if (frais > config.maximum) {
      frais = config.maximum;
    }
    
    return {
      montantTransaction: montant,
      frais: Math.round(frais),
      montantTotal: montant + Math.round(frais),
      details: `Frais ${type.toLowerCase()} : ${config.pourcentage}% (${Math.round(frais)} FCFA)`,
    };
  }

  // Calculer les frais KYC
  calculerFraisKYC(niveau: 2 | 3): number {
    if (niveau === 2) {
      return FRAIS_CONFIG.KYC_NIVEAU_2.montantFixe;
    }
    return FRAIS_CONFIG.KYC_NIVEAU_3.montantFixe;
  }

  // Calculer l'abonnement
  calculerAbonnement(
    type: 'PREMIUM' | 'BUSINESS',
    periode: 'MENSUEL' | 'ANNUEL'
  ): { montant: number; economie?: number } {
    if (type === 'PREMIUM') {
      if (periode === 'ANNUEL') {
        const economie = FRAIS_CONFIG.ABONNEMENT_PREMIUM.mensuel * 12 - FRAIS_CONFIG.ABONNEMENT_PREMIUM.annuel;
        return { montant: FRAIS_CONFIG.ABONNEMENT_PREMIUM.annuel, economie };
      }
      return { montant: FRAIS_CONFIG.ABONNEMENT_PREMIUM.mensuel };
    }
    
    if (periode === 'ANNUEL') {
      const economie = FRAIS_CONFIG.ABONNEMENT_BUSINESS.mensuel * 12 - FRAIS_CONFIG.ABONNEMENT_BUSINESS.annuel;
      return { montant: FRAIS_CONFIG.ABONNEMENT_BUSINESS.annuel, economie };
    }
    return { montant: FRAIS_CONFIG.ABONNEMENT_BUSINESS.mensuel };
  }

  // Calculer les revenus estimés
  calculerRevenusEstimes(nombreTontines: number, montantMoyen: number, nombreMembres: number) {
    const totalParTour = nombreTontines * nombreMembres * montantMoyen;
    const fraisCotisations = this.calculerFrais(totalParTour, 'COTISATION').frais;
    const fraisDistributions = this.calculerFrais(totalParTour, 'DISTRIBUTION').frais;
    
    return {
      totalParTour,
      fraisCotisations,
      fraisDistributions,
      totalFrais: fraisCotisations + fraisDistributions,
      parMois: (fraisCotisations + fraisDistributions) * 1, // 1 tour par mois
      parAn: (fraisCotisations + fraisDistributions) * 12,
    };
  }
}

export const fraisService = new FraisService();