// lib/services/notification-service.ts

export type NotificationType = 'RAPPEL' | 'ECHEANCE' | 'RETARD' | 'PENALITE' | 'DISTRIBUTION' | 'INFO';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: Date;
  lu: boolean;
}

export class NotificationService {
  
  // Générer les notifications de rappel
  genererRappelsCotisation(
    tontineNom: string,
    montant: number,
    dateEcheance: Date
  ): Notification[] {
    const notifications: Notification[] = [];
    const maintenant = new Date();
    const joursAvantEcheance = Math.floor(
      (dateEcheance.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)
    );

    // J-3 : Rappel
    if (joursAvantEcheance === 3) {
      notifications.push({
        id: 'NOTIF-' + Date.now(),
        titre: 'Rappel de cotisation',
        message: `La cotisation de ${montant} FCFA pour "${tontineNom}" est due dans 3 jours.`,
        type: 'RAPPEL',
        date: new Date(),
        lu: false,
      });
    }

    // J-1 : Dernier rappel
    if (joursAvantEcheance === 1) {
      notifications.push({
        id: 'NOTIF-' + Date.now(),
        titre: 'Dernier rappel',
        message: `La cotisation de ${montant} FCFA pour "${tontineNom}" est due demain.`,
        type: 'RAPPEL',
        date: new Date(),
        lu: false,
      });
    }

    return notifications;
  }

  // Notifier un retard
  notifierRetard(
    tontineNom: string,
    membreNom: string,
    montant: number,
    joursRetard: number
  ): Notification {
    return {
      id: 'NOTIF-' + Date.now(),
      titre: 'Retard de cotisation',
      message: `${membreNom} est en retard de ${joursRetard} jour(s) pour la cotisation de ${montant} FCFA dans "${tontineNom}".`,
      type: 'RETARD',
      date: new Date(),
      lu: false,
    };
  }

  // Notifier une pénalité
  notifierPenalite(
    tontineNom: string,
    membreNom: string,
    montantPenalite: number
  ): Notification {
    return {
      id: 'NOTIF-' + Date.now(),
      titre: 'Pénalité appliquée',
      message: `Une pénalité de ${montantPenalite} FCFA a été appliquée à ${membreNom} dans "${tontineNom}".`,
      type: 'PENALITE',
      date: new Date(),
      lu: false,
    };
  }

  // Notifier la distribution
  notifierDistribution(
    tontineNom: string,
    beneficiaire: string,
    montant: number,
    tour: number
  ): Notification {
    return {
      id: 'NOTIF-' + Date.now(),
      titre: 'Distribution du tour',
      message: `Le tour ${tour} de "${tontineNom}" a été distribué à ${beneficiaire}. Montant : ${montant} FCFA.`,
      type: 'DISTRIBUTION',
      date: new Date(),
      lu: false,
    };
  }
}

export const notificationService = new NotificationService();