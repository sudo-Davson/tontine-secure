// lib/services/notification-service.ts

export type NotificationType = 'RAPPEL' | 'ECHEANCE' | 'RETARD' | 'PENALITE' | 'DISTRIBUTION' | 'INFO' | 'INVITATION' | 'PAIEMENT';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  date: Date;
  lu: boolean;
  lien?: string;
  data?: any;
}

// Notifications simulées (à remplacer par le backend)
export const NOTIFICATIONS_SIMULEES: Notification[] = [
  {
    id: 'NOTIF-001',
    titre: 'Rappel de cotisation',
    message: 'Votre cotisation de 50,000 FCFA pour "Tontine des Amis" est due dans 3 jours.',
    type: 'RAPPEL',
    date: new Date(Date.now() - 1000 * 60 * 30), // Il y a 30 min
    lu: false,
    lien: '/tontines/TNT-001',
  },
  {
    id: 'NOTIF-002',
    titre: 'Paiement reçu',
    message: 'Votre cotisation de 50,000 FCFA a été reçue avec succès.',
    type: 'PAIEMENT',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Il y a 2h
    lu: false,
    lien: '/transactions',
  },
  {
    id: 'NOTIF-003',
    titre: 'Distribution du tour',
    message: 'Le tour 3 de "Tontine des Amis" a été distribué à Marie Adjoua.',
    type: 'DISTRIBUTION',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hier
    lu: true,
    lien: '/tontines/TNT-001',
  },
  {
    id: 'NOTIF-004',
    titre: 'Retard de cotisation',
    message: 'Pierre Mensah est en retard de 3 jours pour la cotisation.',
    type: 'RETARD',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48), // Il y a 2 jours
    lu: true,
    lien: '/tontines/TNT-001/cotisations',
  },
  {
    id: 'NOTIF-005',
    titre: 'Pénalité appliquée',
    message: 'Une pénalité de 1,500 FCFA a été appliquée à Pierre Mensah.',
    type: 'PENALITE',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72), // Il y a 3 jours
    lu: true,
    lien: '/transactions',
  },
  {
    id: 'NOTIF-006',
    titre: 'Invitation à rejoindre une tontine',
    message: 'Vous avez été invité à rejoindre "Tontine Commerce".',
    type: 'INVITATION',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96), // Il y a 4 jours
    lu: false,
    lien: '/rejoindre/TNT-003',
  },
];

export class NotificationService {
  // Compter les non lues
  compterNonLues(notifications: Notification[]): number {
    return notifications.filter(n => !n.lu).length;
  }

  // Marquer comme lue
  marquerCommeLue(notifications: Notification[], id: string): Notification[] {
    return notifications.map(n => 
      n.id === id ? { ...n, lu: true } : n
    );
  }

  // Marquer tout comme lu
  marquerToutCommeLu(notifications: Notification[]): Notification[] {
    return notifications.map(n => ({ ...n, lu: true }));
  }

  // Supprimer une notification
  supprimerNotification(notifications: Notification[], id: string): Notification[] {
    return notifications.filter(n => n.id !== id);
  }

  // Filtrer par type
  filtrerParType(notifications: Notification[], type: NotificationType | 'TOUTES'): Notification[] {
    if (type === 'TOUTES') return notifications;
    return notifications.filter(n => n.type === type);
  }

  // Générer les rappels
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

    if (joursAvantEcheance === 3) {
      notifications.push({
        id: 'NOTIF-' + Date.now(),
        titre: 'Rappel de cotisation',
        message: `La cotisation de ${montant.toLocaleString()} FCFA pour "${tontineNom}" est due dans 3 jours.`,
        type: 'RAPPEL',
        date: new Date(),
        lu: false,
      });
    }

    if (joursAvantEcheance === 1) {
      notifications.push({
        id: 'NOTIF-' + Date.now(),
        titre: 'Dernier rappel',
        message: `La cotisation de ${montant.toLocaleString()} FCFA pour "${tontineNom}" est due demain.`,
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
      message: `${membreNom} est en retard de ${joursRetard} jour(s) pour la cotisation de ${montant.toLocaleString()} FCFA dans "${tontineNom}".`,
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
      message: `Une pénalité de ${montantPenalite.toLocaleString()} FCFA a été appliquée à ${membreNom} dans "${tontineNom}".`,
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
      message: `Le tour ${tour} de "${tontineNom}" a été distribué à ${beneficiaire}. Montant : ${montant.toLocaleString()} FCFA.`,
      type: 'DISTRIBUTION',
      date: new Date(),
      lu: false,
    };
  }
}

export const notificationService = new NotificationService();