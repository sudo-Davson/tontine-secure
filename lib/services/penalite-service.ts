// lib/services/penalite-service.ts

export interface CalculPenalite {
  montantCotise: number;
  pourcentagePenalite: number;
  montantPenalite: number;
  montantRembourse: number;
  raison: string;
}

export class PenaliteService {
  // Barème de pénalité selon le type de retrait
  private bareme = {
    VOLONTAIRE: 20,
    EXCLUSION: 50,
    RAISON_VALABLE: 5,
    AMIABLE: 0,
    AVANT_PREMIER_TOUR: 10,
  };

  // Calculer la pénalité
  calculer(
    montantCotise: number,
    typeRetrait: keyof typeof this.bareme,
    nombreToursEffectues: number = 0
  ): CalculPenalite {
    let pourcentage = this.bareme[typeRetrait];

    // Ajustement selon le nombre de tours
    if (typeRetrait === 'VOLONTAIRE') {
      if (nombreToursEffectues === 0) {
        pourcentage = this.bareme.AVANT_PREMIER_TOUR;
      } else if (nombreToursEffectues >= 5) {
        pourcentage = 40;
      } else if (nombreToursEffectues >= 3) {
        pourcentage = 30;
      }
    }

    const montantPenalite = (montantCotise * pourcentage) / 100;
    const montantRembourse = montantCotise - montantPenalite;

    return {
      montantCotise,
      pourcentagePenalite: pourcentage,
      montantPenalite: Math.round(montantPenalite),
      montantRembourse: Math.round(montantRembourse),
      raison: this.getRaison(typeRetrait),
    };
  }

  private getRaison(type: string): string {
    switch (type) {
      case 'VOLONTAIRE':
        return 'Retrait volontaire';
      case 'EXCLUSION':
        return 'Exclusion pour non-paiement';
      case 'RAISON_VALABLE':
        return 'Raison valable (santé, déménagement)';
      case 'AMIABLE':
        return 'Retrait à l\'amiable';
      case 'AVANT_PREMIER_TOUR':
        return 'Retrait avant le premier tour';
      default:
        return 'Retrait';
    }
  }
}

export const penaliteService = new PenaliteService();