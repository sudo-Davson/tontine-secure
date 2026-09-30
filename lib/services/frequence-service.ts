// lib/services/frequence-service.ts

export type TypeFrequence = 
  | 'JOURNALIERE'
  | 'HEBDOMADAIRE'
  | 'BIHEBDOMADAIRE'
  | 'MENSUELLE'
  | 'BIMENSUELLE'
  | 'TRIMESTRIELLE'
  | 'SEMESTRIELLE'
  | 'ANNUELLE'
  | 'PERSONNALISEE';

export type JourSemaine = 
  | 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE';

export type SemaineDuMois = 'PREMIERE' | 'DEUXIEME' | 'TROISIEME' | 'QUATRIEME' | 'DERNIERE';

export interface FrequenceConfig {
  type: TypeFrequence;
  jourSemaine?: JourSemaine;
  jourDuMois?: number;
  intervalleJours?: number;
  semaineDuMois?: SemaineDuMois;
  utiliserSemaineDuMois?: boolean;
}

export interface CalculPeriode {
  frequenceLabel: string;
  nombreCotisationsParAn: number;
  montantTotalParTour: number;
  montantTotalParAn: number;
  prochainesDates: Date[];
  description: string;
}

export class FrequenceService {
  
  // ============================================
  // LIBELLÉS
  // ============================================
  
  getLibelleFrequence(config: FrequenceConfig): string {
    const joursLabels: Record<JourSemaine, string> = {
      LUNDI: 'Lundi',
      MARDI: 'Mardi',
      MERCREDI: 'Mercredi',
      JEUDI: 'Jeudi',
      VENDREDI: 'Vendredi',
      SAMEDI: 'Samedi',
      DIMANCHE: 'Dimanche',
    };

    const semainesLabels: Record<SemaineDuMois, string> = {
      PREMIERE: '1er',
      DEUXIEME: '2ème',
      TROISIEME: '3ème',
      QUATRIEME: '4ème',
      DERNIERE: 'dernier',
    };

    switch (config.type) {
      case 'JOURNALIERE':
        return 'Tous les jours';
      
      case 'HEBDOMADAIRE':
        if (config.jourSemaine) {
          return `Chaque ${joursLabels[config.jourSemaine].toLowerCase()}`;
        }
        return 'Chaque semaine';
      
      case 'BIHEBDOMADAIRE':
        if (config.jourSemaine) {
          return `Toutes les 2 semaines (${joursLabels[config.jourSemaine].toLowerCase()})`;
        }
        return 'Toutes les 2 semaines';
      
      case 'MENSUELLE':
        if (config.utiliserSemaineDuMois && config.semaineDuMois && config.jourSemaine) {
          return `Chaque ${semainesLabels[config.semaineDuMois]} ${joursLabels[config.jourSemaine].toLowerCase()} du mois`;
        }
        if (config.jourDuMois) {
          return `Le ${config.jourDuMois} de chaque mois`;
        }
        return 'Chaque mois';
      
      case 'BIMENSUELLE':
        if (config.jourDuMois) {
          return `Tous les 2 mois (le ${config.jourDuMois})`;
        }
        return 'Tous les 2 mois';
      
      case 'TRIMESTRIELLE':
        if (config.jourDuMois) {
          return `Tous les 3 mois (le ${config.jourDuMois})`;
        }
        return 'Tous les 3 mois';
      
      case 'SEMESTRIELLE':
        if (config.jourDuMois) {
          return `Tous les 6 mois (le ${config.jourDuMois})`;
        }
        return 'Tous les 6 mois';
      
      case 'ANNUELLE':
        if (config.jourDuMois) {
          return `Chaque année (le ${config.jourDuMois})`;
        }
        return 'Chaque année';
      
      case 'PERSONNALISEE':
        if (config.intervalleJours) {
          return `Tous les ${config.intervalleJours} jour${config.intervalleJours > 1 ? 's' : ''}`;
        }
        return 'Fréquence personnalisée';
      
      default:
        return 'Fréquence';
    }
  }

  // ============================================
  // CALCUL DU NOMBRE DE COTISATIONS PAR AN
  // ============================================
  
  getNombreCotisationsParAn(config: FrequenceConfig): number {
    switch (config.type) {
      case 'JOURNALIERE': return 365;
      case 'HEBDOMADAIRE': return 52;
      case 'BIHEBDOMADAIRE': return 26;
      case 'MENSUELLE': return 12;
      case 'BIMENSUELLE': return 6;
      case 'TRIMESTRIELLE': return 4;
      case 'SEMESTRIELLE': return 2;
      case 'ANNUELLE': return 1;
      case 'PERSONNALISEE':
        if (config.intervalleJours) {
          return Math.floor(365 / config.intervalleJours);
        }
        return 12;
      default: return 12;
    }
  }

  // ============================================
  // CALCUL DES MONTANTS
  // ============================================
  
  calculerMontants(
    montantCotisation: number,
    nombreMembres: number,
    config: FrequenceConfig
  ): CalculPeriode {
    const nombreCotisationsParAn = this.getNombreCotisationsParAn(config);
    const montantTotalParTour = montantCotisation * nombreMembres;
    const montantTotalParAn = montantTotalParTour * nombreCotisationsParAn;

    return {
      frequenceLabel: this.getLibelleFrequence(config),
      nombreCotisationsParAn,
      montantTotalParTour,
      montantTotalParAn,
      prochainesDates: this.calculerProchainesDates(config, 5),
      description: this.genererDescription(
        montantCotisation,
        nombreMembres,
        config
      ),
    };
  }

  // ============================================
  // CALCUL DES PROCHAINES DATES
  // ============================================
  
  calculerProchainesDates(config: FrequenceConfig, nombre: number): Date[] {
    const dates: Date[] = [];
    const maintenant = new Date();

    switch (config.type) {
      case 'JOURNALIERE': {
        for (let i = 1; i <= nombre; i++) {
          const date = new Date(maintenant);
          date.setDate(date.getDate() + i);
          dates.push(date);
        }
        break;
      }

      case 'HEBDOMADAIRE':
      case 'BIHEBDOMADAIRE': {
        const intervalle = config.type === 'HEBDOMADAIRE' ? 7 : 14;
        const jourSemaineCible = config.jourSemaine 
          ? this.getJourSemaineIndex(config.jourSemaine) 
          : maintenant.getDay();
        
        for (let i = 0; i < nombre; i++) {
          const date = new Date(maintenant);
          const joursAvant = (jourSemaineCible - date.getDay() + 7) % 7 || 7;
          date.setDate(date.getDate() + joursAvant + (i * intervalle));
          dates.push(date);
        }
        break;
      }

      case 'MENSUELLE':
      case 'BIMENSUELLE':
      case 'TRIMESTRIELLE':
      case 'SEMESTRIELLE':
      case 'ANNUELLE': {
        const intervalleMoisMap: Record<string, number> = {
          MENSUELLE: 1,
          BIMENSUELLE: 2,
          TRIMESTRIELLE: 3,
          SEMESTRIELLE: 6,
          ANNUELLE: 12,
        };
        const intervalleMois = intervalleMoisMap[config.type] || 1;
        const jourDuMoisCible = config.jourDuMois || 1;
        
        for (let i = 0; i < nombre; i++) {
          const date = new Date(maintenant);
          date.setMonth(date.getMonth() + (i * intervalleMois));
          date.setDate(jourDuMoisCible);
          dates.push(date);
        }
        break;
      }

      case 'PERSONNALISEE': {
        const intervalleJours = config.intervalleJours || 30;
        for (let i = 1; i <= nombre; i++) {
          const date = new Date(maintenant);
          date.setDate(date.getDate() + (i * intervalleJours));
          dates.push(date);
        }
        break;
      }
    }

    return dates;
  }

  // ============================================
  // DESCRIPTION AUTOMATIQUE
  // ============================================
  
  genererDescription(
    montantCotisation: number,
    nombreMembres: number,
    config: FrequenceConfig
  ): string {
    const montantTotalParTour = montantCotisation * nombreMembres;
    const frequence = this.getLibelleFrequence(config);
    const nombreCotisationsParAn = this.getNombreCotisationsParAn(config);
    const montantTotalParAn = montantTotalParTour * nombreCotisationsParAn;

    return `Cette tontine collecte ${montantCotisation.toLocaleString()} FCFA par membre, ${frequence.toLowerCase()}. Avec ${nombreMembres} membres, chaque tour rapporte ${montantTotalParTour.toLocaleString()} FCFA. Sur une année complète (${nombreCotisationsParAn} tours), le montant total collecté sera de ${montantTotalParAn.toLocaleString()} FCFA.`;
  }

  // ============================================
  // UTILITAIRES
  // ============================================
  
  private getJourSemaineIndex(jour: JourSemaine): number {
    const index: Record<JourSemaine, number> = {
      DIMANCHE: 0,
      LUNDI: 1,
      MARDI: 2,
      MERCREDI: 3,
      JEUDI: 4,
      VENDREDI: 5,
      SAMEDI: 6,
    };
    return index[jour];
  }

  // Calculer le montant total selon la fréquence
  calculerMontantTotal(
    montantCotisation: number,
    nombreMembres: number,
    config: FrequenceConfig,
    dureeEnAnnees: number = 1
  ): {
    parTour: number;
    parAn: number;
    total: number;
    nombreDeTours: number;
  } {
    const nombreCotisationsParAn = this.getNombreCotisationsParAn(config);
    const parTour = montantCotisation * nombreMembres;
    const parAn = parTour * nombreCotisationsParAn;
    const nombreDeTours = nombreCotisationsParAn * dureeEnAnnees;
    const total = parTour * nombreDeTours;

    return {
      parTour,
      parAn,
      total,
      nombreDeTours,
    };
  }

  // Formater une date
  formaterDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Formater une date courte
  formaterDateCourte(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

export const frequenceService = new FrequenceService();