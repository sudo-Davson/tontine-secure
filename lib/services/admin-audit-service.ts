// lib/services/admin-audit-service.ts
import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export type ActionAdmin =
  | 'TONTINE_CREEE'
  | 'TONTINE_MODIFIEE'
  | 'TONTINE_SUPPRIMEE'
  | 'TONTINE_DEMARREE'
  | 'TOUR_CLOTURE_MANUEL'
  | 'MEMBRE_AJOUTE'
  | 'MEMBRE_RETIRE_MANUEL'
  | 'MEMBRE_RETIRE_AUTO'
  | 'CHANCE_DONNEE'
  | 'REMBOURSEMENT_EFFECTUE'
  | 'COTISATION_PAYEE_POUR_MEMBRE'
  | 'PARAMETRES_MODIFIES';

export interface ContexteAction {
  userId: string;
  tontineId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DetailsAction {
  [key: string]: any;
}

export interface ResultatAudit {
  succes: boolean;
  auditLogId?: string;
  alerte?: {
    niveau: 'INFO' | 'ATTENTION' | 'CRITIQUE';
    message: string;
  };
}

// ============================================
// SERVICE D'AUDIT
// ============================================

export class AdminAuditService {
  
  // ============================================
  // ENREGISTRER UNE ACTION ADMIN
  // ============================================
  
  /**
   * Enregistre une action admin dans l'audit log.
   * Détecte aussi les comportements suspects.
   */
  async enregistrerAction(
    action: ActionAdmin,
    contexte: ContexteAction,
    details: DetailsAction
  ): Promise<ResultatAudit> {
    try {
      // 1. Détecter les comportements suspects
      const alerte = await this.detecterComportementSuspect(
        action,
        contexte,
        details
      );

      // 2. Enregistrer dans l'audit log
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: contexte.userId,
          action,
          details: JSON.stringify({
            ...details,
            tontineId: contexte.tontineId,
            ipAddress: contexte.ipAddress,
            userAgent: contexte.userAgent,
            timestamp: new Date().toISOString(),
            alerte: alerte || null,
          }),
          ipAddress: contexte.ipAddress || null,
        },
      });

      // 3. Si alerte critique → notifier le support (plus tard)
      if (alerte?.niveau === 'CRITIQUE') {
        console.warn(`🚨 ALERTE CRITIQUE : ${alerte.message}`);
        // TODO: Envoyer email au support
      }

      return {
        succes: true,
        auditLogId: auditLog.id,
        alerte,
      };
    } catch (error) {
      console.error('Erreur audit log :', error);
      return { succes: false };
    }
  }

  // ============================================
  // DÉTECTION DE COMPORTEMENT SUSPECT
  // ============================================
  
  private async detecterComportementSuspect(
    action: ActionAdmin,
    contexte: ContexteAction,
    details: DetailsAction
  ): Promise<{ niveau: 'INFO' | 'ATTENTION' | 'CRITIQUE'; message: string } | undefined> {
    
    // ----------------------------------------
    // RÈGLE 1 : Trop de retraits en 24h
    // ----------------------------------------
    if (action === 'MEMBRE_RETIRE_MANUEL' && contexte.tontineId) {
      const il24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const retraits24h = await prisma.auditLog.count({
        where: {
          userId: contexte.userId,
          action: 'MEMBRE_RETIRE_MANUEL',
          createdAt: { gte: il24h },
          details: { contains: contexte.tontineId },
        },
      });

      if (retraits24h >= 5) {
        return {
          niveau: 'CRITIQUE',
          message: `L'admin a retiré ${retraits24h + 1} membres en 24h.`,
        };
      }
      if (retraits24h >= 3) {
        return {
          niveau: 'ATTENTION',
          message: `L'admin a retiré ${retraits24h + 1} membres en 24h.`,
        };
      }
    }

    // ----------------------------------------
    // RÈGLE 2 : Trop de chances données en 24h
    // ----------------------------------------
    if (action === 'CHANCE_DONNEE' && contexte.tontineId) {
      const il24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const chances24h = await prisma.auditLog.count({
        where: {
          userId: contexte.userId,
          action: 'CHANCE_DONNEE',
          createdAt: { gte: il24h },
          details: { contains: contexte.tontineId },
        },
      });

      if (chances24h >= 10) {
        return {
          niveau: 'ATTENTION',
          message: `L'admin a donné ${chances24h + 1} chances en 24h.`,
        };
      }
    }

    // ----------------------------------------
    // RÈGLE 3 : Clôture manuelle sans toutes les cotisations
    // ----------------------------------------
    if (action === 'TOUR_CLOTURE_MANUEL') {
      if (details.cotisationsPayees !== undefined && details.cotisationsTotal !== undefined) {
        if (details.cotisationsPayees < details.cotisationsTotal) {
          return {
            niveau: 'CRITIQUE',
            message: `Tour clôturé avec ${details.cotisationsTotal - details.cotisationsPayees} cotisations impayées.`,
          };
        }
      }
    }

    // ----------------------------------------
    // RÈGLE 4 : Modifications après démarrage
    // ----------------------------------------
    if (action === 'TONTINE_MODIFIEE' && details.statutTontine === 'ACTIVE') {
      if (details.champsModifies && details.champsModifies.includes('montant')) {
        return {
          niveau: 'CRITIQUE',
          message: `Modification du montant après démarrage de la tontine.`,
        };
      }
    }

    return undefined;
  }

  // ============================================
  // VÉRIFIER LES LIMITES AVANT UNE ACTION
  // ============================================
  
  /**
   * Vérifie si l'admin peut effectuer une action (limites respectées).
   * À appeler AVANT d'exécuter l'action.
   */
  async verifierLimites(
    action: ActionAdmin,
    contexte: ContexteAction
  ): Promise<{ autorise: boolean; raison?: string }> {
    
    // ----------------------------------------
    // LIMITE 1 : Max 3 retraits manuels / 24h / tontine
    // ----------------------------------------
    if (action === 'MEMBRE_RETIRE_MANUEL' && contexte.tontineId) {
      const il24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const retraits24h = await prisma.auditLog.count({
        where: {
          userId: contexte.userId,
          action: 'MEMBRE_RETIRE_MANUEL',
          createdAt: { gte: il24h },
          details: { contains: contexte.tontineId },
        },
      });

      if (retraits24h >= 3) {
        return {
          autorise: false,
          raison: `Limite atteinte : 3 retraits manuels maximum par 24h. Réessayez demain ou contactez le support.`,
        };
      }
    }

    // ----------------------------------------
    // LIMITE 2 : Max 5 clôtures manuelles / 24h / tontine
    // ----------------------------------------
    if (action === 'TOUR_CLOTURE_MANUEL' && contexte.tontineId) {
      const il24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const clotures24h = await prisma.auditLog.count({
        where: {
          userId: contexte.userId,
          action: 'TOUR_CLOTURE_MANUEL',
          createdAt: { gte: il24h },
          details: { contains: contexte.tontineId },
        },
      });

      if (clotures24h >= 5) {
        return {
          autorise: false,
          raison: `Limite atteinte : 5 clôtures manuelles maximum par 24h.`,
        };
      }
    }

    return { autorise: true };
  }

  // ============================================
  // NOTIFIER TOUS LES MEMBRES D'UNE ACTION ADMIN
  // ============================================
  
  /**
   * Notifie tous les membres (sauf l'admin) d'une action admin.
   */
  async notifierMembresActionAdmin(
    tontineId: string,
    adminUserId: string,
    titre: string,
    message: string
  ): Promise<void> {
    try {
      // Récupérer tous les membres actifs (sauf l'admin)
      const membres = await prisma.member.findMany({
        where: {
          tontineId,
          statut: 'ACTIF',
          userId: { not: adminUserId },
        },
        select: { userId: true },
      });

      if (membres.length === 0) return;

      // Créer une notification pour chaque membre
      await prisma.notification.createMany({
        data: membres.map((m) => ({
          userId: m.userId,
          titre,
          message,
          type: 'INFO',
          lien: `/tontines/${tontineId}`,
        })),
      });
    } catch (error) {
      console.error('Erreur notification membres :', error);
    }
  }

  // ============================================
  // RÉCUPÉRER L'HISTORIQUE DES ACTIONS ADMIN
  // ============================================
  
  /**
   * Récupère l'historique des actions admin pour une tontine.
   */
  async getHistoriqueActions(tontineId: string, limit: number = 50) {
    const actions = await prisma.auditLog.findMany({
      where: {
        details: { contains: tontineId },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Enrichir avec les infos user
    const userIds = [...new Set(actions.map((a) => a.userId).filter(Boolean))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const usersMap = new Map(users.map((u) => [u.id, u]));

    return actions.map((action) => ({
      ...action,
      user: action.userId ? usersMap.get(action.userId) || null : null,
    }));
  }

  // ============================================
  // STATISTIQUES D'UN ADMIN
  // ============================================
  
  /**
   * Récupère les statistiques d'un admin (pour la réputation).
   */
  async getStatistiquesAdmin(userId: string) {
    const il7jours = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalActions,
      actionsRecentes,
      alertesCritiques,
      alertesAttention,
    ] = await Promise.all([
      prisma.auditLog.count({ where: { userId } }),
      prisma.auditLog.count({
        where: { userId, createdAt: { gte: il7jours } },
      }),
      prisma.auditLog.count({
        where: {
          userId,
          details: { contains: '"niveau":"CRITIQUE"' },
        },
      }),
      prisma.auditLog.count({
        where: {
          userId,
          details: { contains: '"niveau":"ATTENTION"' },
        },
      }),
    ]);

    // Calculer un score de fiabilité
    let scoreFiabilite = 100;
    scoreFiabilite -= alertesCritiques * 20;
    scoreFiabilite -= alertesAttention * 5;
    scoreFiabilite = Math.max(0, scoreFiabilite);

    return {
      totalActions,
      actionsRecentes,
      alertesCritiques,
      alertesAttention,
      scoreFiabilite,
    };
  }
}

export const adminAuditService = new AdminAuditService();