// lib/services/invitation-service.ts

export type InvitationStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'EXPIREE';

export interface Invitation {
  id: string;
  tontineId: string;
  tontineNom: string;
  tontineDescription: string;
  montantCotisation: number;
  frequence: string;
  createurNom: string;
  createurTelephone: string;
  code: string;
  statut: InvitationStatus;
  dateInvitation: Date;
  dateExpiration: Date;
}

export interface TontinePublique {
  id: string;
  nom: string;
  description: string;
  montant: number;
  frequence: string;
  nombreMembres: number;
  membresActuels: number;
  createurNom: string;
  statut: string;
}

// Invitations simulées
export const INVITATIONS_SIMULEES: Invitation[] = [
  {
    id: 'INV-001',
    tontineId: 'TNT-003',
    tontineNom: 'Tontine Commerce',
    tontineDescription: 'Tontine pour financer nos activités commerciales',
    montantCotisation: 100000,
    frequence: 'MENSUEL',
    createurNom: 'Pierre Mensah',
    createurTelephone: '+228 92 34 56 78',
    code: 'TNT-003-XYZ',
    statut: 'EN_ATTENTE',
    dateInvitation: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hier
    dateExpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // Dans 6 jours
  },
  {
    id: 'INV-002',
    tontineId: 'TNT-004',
    tontineNom: 'Tontine des Femmes',
    tontineDescription: 'Tontine mensuelle pour les femmes entrepreneures',
    montantCotisation: 25000,
    frequence: 'MENSUEL',
    createurNom: 'Ama Koffi',
    createurTelephone: '+228 93 45 67 89',
    code: 'TNT-004-ABC',
    statut: 'EN_ATTENTE',
    dateInvitation: new Date(Date.now() - 1000 * 60 * 60 * 48), // Il y a 2 jours
    dateExpiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // Dans 5 jours
  },
];

// Tontines publiques simulées
export const TONTINES_PUBLIQUES: TontinePublique[] = [
  {
    id: 'TNT-001',
    nom: 'Tontine des Amis',
    description: 'Tontine mensuelle entre amis pour épargner ensemble',
    montant: 50000,
    frequence: 'MENSUEL',
    nombreMembres: 10,
    membresActuels: 8,
    createurNom: 'Jean Kouassi',
    statut: 'ACTIVE',
  },
  {
    id: 'TNT-002',
    nom: 'Tontine Famille',
    description: 'Tontine familiale pour les projets communs',
    montant: 25000,
    frequence: 'HEBDOMADAIRE',
    nombreMembres: 8,
    membresActuels: 6,
    createurNom: 'Marie Adjoua',
    statut: 'ACTIVE',
  },
];

export class InvitationService {
  
  // Générer un code d'invitation unique
  genererCode(tontineId: string): string {
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${tontineId}-${randomPart}`;
  }

  // Vérifier si un utilisateur peut rejoindre une tontine
  canJoinTontine(
    user: { kycLevel: number; reputation: number; },
    tontine: { membresActuels: number; nombreMembres: number; },
    estDejaMembre: boolean
  ): { success: boolean; message: string } {
    
    if (user.kycLevel < 2) {
      return { 
        success: false, 
        message: 'Vous devez compléter le KYC Niveau 2 pour rejoindre une tontine' 
      };
    }

    if (user.reputation < 30) {
      return { 
        success: false, 
        message: `Votre réputation (${user.reputation}%) est insuffisante. Minimum requis : 30%` 
      };
    }

    if (estDejaMembre) {
      return { 
        success: false, 
        message: 'Vous êtes déjà membre de cette tontine' 
      };
    }

    if (tontine.membresActuels >= tontine.nombreMembres) {
      return { 
        success: false, 
        message: 'Cette tontine est complète' 
      };
    }

    return { 
      success: true, 
      message: 'Vous pouvez rejoindre cette tontine' 
    };
  }

  // Vérifier si une invitation est expirée
  isExpiree(invitation: Invitation): boolean {
    return new Date() > new Date(invitation.dateExpiration);
  }

  // Accepter une invitation
  accepterInvitation(invitations: Invitation[], id: string): Invitation[] {
    return invitations.map(inv =>
      inv.id === id ? { ...inv, statut: 'ACCEPTEE' as InvitationStatus } : inv
    );
  }

  // Refuser une invitation
  refuserInvitation(invitations: Invitation[], id: string): Invitation[] {
    return invitations.map(inv =>
      inv.id === id ? { ...inv, statut: 'REFUSEE' as InvitationStatus } : inv
    );
  }

  // Compter les invitations en attente
  compterEnAttente(invitations: Invitation[]): number {
    return invitations.filter(inv => inv.statut === 'EN_ATTENTE' && !this.isExpiree(inv)).length;
  }

  // Filtrer les invitations actives
  filtrerActives(invitations: Invitation[]): Invitation[] {
    return invitations.filter(inv => 
      inv.statut === 'EN_ATTENTE' && !this.isExpiree(inv)
    );
  }
}

export const invitationService = new InvitationService();