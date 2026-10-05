// lib/services/tour-service.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export type TypeRetrait = 
  | 'IMP AYE'           // Retiré pour impayé (3 chances épuisées)
  | 'IMP AYE_AUTO'      // Retiré automatiquement par le cron
  | 'VOLONTAIRE'        // Retiré volontairement
  | 'RAISON_VALABLE'    // Retiré pour raison valable
  | 'EXCLUSION'         // Exclu par l'admin
  | 'AMIABLE';          // Retrait à l'amiable

export interface ResultatCloture {
  cloture: boolean;
  raison?: string;
  tour?: any;
  tourSuivant?: any;
  notification?: any;
}

export interface ResultatChance {
  succes: boolean;
  chancesUtilisees: number;
  retraitAutomatique: boolean;
  message: string;
}

// ============================================
// BARÈME DES PÉNALITÉS
// ============================================

/**
 * Calcule le pourcentage de pénalité selon le nombre de chances utilisées
 */
export function calculerPourcentagePenalite(chancesUtilisees: number): number {
  switch (chancesUtilisees) {
    case 0: return 0;    // Retrait volontaire
    case 1: return 5;    // 1 chance utilisée
    case 2: return 15;   // 2 chances utilisées
    case 3: return 30;   // 3 chances utilisées (retrait forcé)
    default: return 30;
  }
}

/**
 * Calcule les montants de remboursement et de dette
 */
export function calculerRemboursement(
  montantCotise: number,
  montantRecu: number,
  chancesUtilisees: number
): {
  pourcentagePenalite: number;
  montantPenalite: number;
  montantRembourse: number;
  dette: number;
} {
  const pourcentagePenalite = calculerPourcentagePenalite(chancesUtilisees);
  const montantPenalite = (montantCotise * pourcentagePenalite) / 100;
  
  if (montantRecu > 0) {
    // Le membre a déjà reçu sa cagnotte → il doit rembourser
    const soldeNet = montantRecu - (montantCotise - montantPenalite);
    const dette = Math.max(0, soldeNet);
    
    return {
      pourcentagePenalite,
      montantPenalite,
      montantRembourse: 0, // Rien à rembourser, c'est lui qui doit
      dette,
    };
  } else {
    // Le membre n'a pas reçu → on lui rembourse
    const montantRembourse = Math.max(0, montantCotise - montantPenalite);
    
    return {
      pourcentagePenalite,
      montantPenalite,
      montantRembourse,
      dette: 0,
    };
  }
}

// ============================================
// SERVICE DE TOURS
// ============================================

export class TourService {
  
  // ============================================
  // VÉRIFIER ET CLÔTURER UN TOUR
  // ============================================
  
  /**
   * Vérifie si un tour peut être clôturé (toutes les cotisations payées)
   * et le clôture si c'est le cas.
   * 
   * @param tontineId ID de la tontine
   * @param tourId ID du tour à vérifier
   * @param tx Client Prisma transactionnel (optionnel)
   */
  async verifierEtCloturerTour(
    tontineId: string,
    tourId: string,
    tx?: Prisma.TransactionClient
  ): Promise<ResultatCloture> {
    const client = tx || prisma;

    // 1. Récupérer le tour avec ses cotisations
    const tour = await client.tour.findUnique({
      where: { id: tourId },
      include: {
        cotisations: true,
        tontine: true,
      },
    });

    if (!tour) {
      return { cloture: false, raison: 'Tour non trouvé' };
    }

    // 2. Vérifier que le tour est bien EN_COURS
    if (tour.statut !== 'EN_COURS') {
      return { cloture: false, raison: `Le tour est déjà ${tour.statut}` };
    }

    // 3. Vérifier que TOUTES les cotisations sont payées
    const cotisationsImpayees = tour.cotisations.filter(
      (c) => c.statut !== 'PAYEE'
    );

    if (cotisationsImpayees.length > 0) {
      return {
        cloture: false,
        raison: `${cotisationsImpayees.length} cotisation(s) impayée(s)`,
      };
    }

    // 4. Toutes les cotisations sont payées → clôturer le tour
    const tourCloture = await client.tour.update({
      where: { id: tourId },
      data: {
        statut: 'TERMINE',
        clotureLe: new Date(),
      },
    });

    // 5. Créditer le bénéficiaire (toursRecus += 1)
    if (tour.beneficiaireId) {
      await client.member.updateMany({
        where: {
          tontineId,
          userId: tour.beneficiaireId,
          statut: 'ACTIF',
        },
        data: {
          toursRecus: { increment: 1 },
        },
      });

      // Notification au bénéficiaire
      await client.notification.create({
        data: {
          userId: tour.beneficiaireId,
          titre: '🎉 Vous avez reçu votre cagnotte !',
          message: `Félicitations ! Vous avez reçu ${tour.montant.toLocaleString()} FCFA pour le tour n°${tour.numero} de la tontine "${tour.tontine.nom}".`,
          type: 'SUCCESS',
          lien: `/tontines/${tontineId}`,
        },
      });
    }

    // 6. Mettre à jour la tontine
    const tontine = tour.tontine;
    const nouveauTourActuel = tontine.tourActuel + 1;
    const estDernierTour = nouveauTourActuel > tontine.nombreTours;

    await client.tontine.update({
      where: { id: tontineId },
      data: {
        tourActuel: estDernierTour ? tontine.nombreTours : nouveauTourActuel,
        statut: estDernierTour ? 'TERMINEE' : tontine.statut,
        dateFin: estDernierTour ? new Date() : null,
      },
    });

    // 7. Activer le tour suivant
    let tourSuivant = null;
    if (!estDernierTour) {
      const tourSuivantTrouve = await client.tour.findFirst({
        where: {
          tontineId,
          numero: nouveauTourActuel,
        },
      });

      if (tourSuivantTrouve) {
        // ⚠️ CORRECTION : assigner la valeur retournée par update()
        tourSuivant = await client.tour.update({
          where: { id: tourSuivantTrouve.id },
          data: { statut: 'EN_COURS' },
        });

        // Notifications aux membres : nouveau tour
        const membresActifs = await client.member.findMany({
          where: { tontineId, statut: 'ACTIF' },
          select: { userId: true },
        });

        const notifications = membresActifs.map((m) => ({
          userId: m.userId,
          titre: `🔄 Tour ${nouveauTourActuel} démarré`,
          message: `Le tour ${nouveauTourActuel} de la tontine "${tontine.nom}" a démarré. C'est au tour d'un nouveau bénéficiaire de recevoir la cagnotte.`,
          type: 'INFO',
          lien: `/tontines/${tontineId}`,
        }));

        await client.notification.createMany({ data: notifications });
      }
    } else {
      // Dernier tour → notifier la fin de la tontine
      const membresActifs = await client.member.findMany({
        where: { tontineId, statut: 'ACTIF' },
        select: { userId: true },
      });

      const notifications = membresActifs.map((m) => ({
        userId: m.userId,
        titre: '🏁 Tontine terminée !',
        message: `La tontine "${tontine.nom}" est terminée. Tous les membres ont reçu leur cagnotte. Merci d'avoir participé !`,
        type: 'SUCCESS',
        lien: `/tontines/${tontineId}`,
      }));

      await client.notification.createMany({ data: notifications });
    }

    return {
      cloture: true,
      tour: tourCloture,
      tourSuivant,
    };
  }

  // ============================================
  // DONNER UNE CHANCE
  // ============================================

  /**
   * Donne une chance à un membre qui n'a pas payé.
   * Si le membre a déjà utilisé ses 3 chances, il est automatiquement retiré.
   */
  async donnerChanceMembre(
    tontineId: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<ResultatChance> {
    const client = tx || prisma;

    // 1. Récupérer le membre et la tontine
    const membre = await client.member.findFirst({
      where: {
        tontineId,
        userId,
        statut: 'ACTIF',
      },
      include: {
        tontine: true,
      },
    });

    if (!membre) {
      return {
        succes: false,
        chancesUtilisees: 0,
        retraitAutomatique: false,
        message: 'Membre non trouvé ou inactif',
      };
    }

    // 2. Vérifier si le membre a déjà épuisé ses chances
    const nouvellesChances = membre.chancesUtilisees + 1;
    const nombreChancesMax = membre.tontine.nombreChancesMax;

    // 3. Mettre à jour le membre
    await client.member.update({
      where: { id: membre.id },
      data: {
        chancesUtilisees: nouvellesChances,
        derniereChanceLe: new Date(),
      },
    });

    // 4. Si les chances sont épuisées → retrait automatique
    if (nouvellesChances >= nombreChancesMax) {
      // Retirer le membre pour impayé
      await this.retirerMembrePourImpaye(
        tontineId,
        userId,
        'IMP AYE',
        `3 chances épuisées. Retrait automatique.`,
        tx
      );

      return {
        succes: true,
        chancesUtilisees: nouvellesChances,
        retraitAutomatique: true,
        message: `Le membre a épuisé ses ${nombreChancesMax} chances. Retrait automatique effectué.`,
      };
    }

    // 5. Sinon, notification d'avertissement
    const chancesRestantes = nombreChancesMax - nouvellesChances;
    await client.notification.create({
      data: {
        userId,
        titre: `⚠️ Avertissement ${nouvellesChances}/${nombreChancesMax}`,
        message: `Vous n'avez pas payé votre cotisation pour la tontine "${membre.tontine.nom}".\n\n` +
          `Il vous reste ${chancesRestantes} chance(s) avant votre retrait automatique.`,
        type: 'WARNING',
        lien: `/tontines/${tontineId}`,
      },
    });

    return {
      succes: true,
      chancesUtilisees: nouvellesChances,
      retraitAutomatique: false,
      message: `Chance ${nouvellesChances}/${nombreChancesMax} accordée. ${chancesRestantes} chance(s) restante(s).`,
    };
  }

  // ============================================
  // RETIRER UN MEMBRE POUR IMPAYÉ
  // ============================================

  /**
   * Retire un membre de la tontine pour impayé.
   * Calcule les pénalités, le remboursement ou la dette.
   */
  async retirerMembrePourImpaye(
    tontineId: string,
    userId: string,
    typeRetrait: TypeRetrait,
    raison: string,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;

    // 1. Récupérer le membre
    const membre = await client.member.findFirst({
      where: { tontineId, userId, statut: 'ACTIF' },
      include: {
        tontine: true,
        user: true,
      },
    });

    if (!membre) {
      throw new Error('Membre non trouvé ou déjà retiré');
    }

    // 2. Calculer les montants
    const montantCotise = await this.calculerMontantCotise(tontineId, userId, client);
    
    // Calculer la cagnotte déjà reçue (via les tours terminés)
    const toursRecus = await client.tour.findMany({
      where: {
        tontineId,
        beneficiaireId: userId,
        statut: 'TERMINE',
      },
    });
    const montantRecu = toursRecus.reduce((sum, t) => sum + t.montant, 0);

    const calcul = calculerRemboursement(
      montantCotise,
      montantRecu,
      membre.chancesUtilisees
    );

    // 3. Retirer le membre
    await client.member.update({
      where: { id: membre.id },
      data: {
        statut: 'RETIRE',
        retireLe: new Date(),
        raisonRetrait: raison,
        montantCotise,
        montantPenalite: calcul.montantPenalite,
        montantRembourse: calcul.montantRembourse,
        pourcentagePenalite: calcul.pourcentagePenalite,
        dette: calcul.dette,
        retireAutomatique: typeRetrait === 'IMP AYE' || typeRetrait === 'IMP AYE_AUTO',
        statutRemboursement: calcul.dette > 0 ? 'DETTE' : (calcul.montantRembourse > 0 ? 'EN_ATTENTE' : 'ANNULE'),
      },
    });

    // 4. Annuler les tours futurs du membre (ceux où il est bénéficiaire et A_VENIR)
    await client.tour.updateMany({
      where: {
        tontineId,
        beneficiaireId: userId,
        statut: 'A_VENIR',
      },
      data: {
        statut: 'ANNULE',
      },
    });

    // 5. Annuler les cotisations non payées du membre
    await client.cotisation.updateMany({
      where: {
        tontineId,
        userId,
        statut: { in: ['EN_ATTENTE', 'EN_RETARD'] },
      },
      data: {
        statut: 'ANNULEE',
      },
    });

    // 6. Notification au membre
    let messageNotification = `Vous avez été retiré de la tontine "${membre.tontine.nom}".\n\n`;
    
    if (calcul.dette > 0) {
      messageNotification += `❌ Vous devez rembourser ${calcul.dette.toLocaleString()} FCFA (vous avez reçu plus que ce que vous avez cotisé).`;
    } else if (calcul.montantRembourse > 0) {
      messageNotification += `💰 Vous recevrez un remboursement de ${calcul.montantRembourse.toLocaleString()} FCFA (cotisé ${montantCotise.toLocaleString()} - pénalité ${calcul.pourcentagePenalite}%).`;
    } else {
      messageNotification += `Aucun remboursement (aucune cotisation ou pénalité trop élevée).`;
    }

    await client.notification.create({
      data: {
        userId,
        titre: '🚪 Retrait de la tontine',
        message: messageNotification,
        type: 'WARNING',
        lien: `/tontines/${tontineId}`,
      },
    });

    // 7. Notification aux autres membres
    const autresMembres = await client.member.findMany({
      where: {
        tontineId,
        statut: 'ACTIF',
        userId: { not: userId },
      },
      select: { userId: true },
    });

    await client.notification.createMany({
      data: autresMembres.map((m) => ({
        userId: m.userId,
        titre: '👥 Un membre a été retiré',
        message: `${membre.user.firstName} ${membre.user.lastName} a été retiré de la tontine "${membre.tontine.nom}" pour ${raison.toLowerCase()}.`,
        type: 'INFO',
        lien: `/tontines/${tontineId}`,
      })),
    });

    // 8. Audit log
    await client.auditLog.create({
      data: {
        userId,
        action: 'MEMBRE_RETIRE_IMPAYE',
        details: JSON.stringify({
          tontineId,
          typeRetrait,
          raison,
          montantCotise,
          montantRecu,
          ...calcul,
        }),
      },
    });

    return {
      membre: {
        ...membre,
        statut: 'RETIRE',
        montantCotise,
        ...calcul,
      },
      calcul,
    };
  }

  // ============================================
  // CALCULS
  // ============================================

  /**
   * Calcule le total cotisé par un membre dans une tontine
   */
  private async calculerMontantCotise(
    tontineId: string,
    userId: string,
    client: Prisma.TransactionClient | typeof prisma
  ): Promise<number> {
    const cotisationsPayees = await client.cotisation.aggregate({
      where: {
        tontineId,
        userId,
        statut: 'PAYEE',
      },
      _sum: { montant: true },
    });

    return cotisationsPayees._sum.montant || 0;
  }

  /**
   * Récupère les tours d'une tontine avec les infos des bénéficiaires
   */
  async getToursAvecBeneficiaires(tontineId: string) {
    const tours = await prisma.tour.findMany({
      where: { tontineId },
      orderBy: { numero: 'asc' },
      include: {
        cotisations: {
          select: {
            id: true,
            userId: true,
            statut: true,
            datePaiement: true,
          },
        },
      },
    });

    // Récupérer les infos des bénéficiaires
    const userIds = tours
      .map((t) => t.beneficiaireId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
      },
    });

    const usersMap = new Map(users.map((u) => [u.id, u]));

    return tours.map((tour) => ({
      ...tour,
      beneficiaire: tour.beneficiaireId ? usersMap.get(tour.beneficiaireId) || null : null,
      cotisationsPayees: tour.cotisations.filter((c) => c.statut === 'PAYEE').length,
      cotisationsTotal: tour.cotisations.length,
      pourcentagePaiement: tour.cotisations.length > 0
        ? (tour.cotisations.filter((c) => c.statut === 'PAYEE').length / tour.cotisations.length) * 100
        : 0,
    }));
  }
}

export const tourService = new TourService();