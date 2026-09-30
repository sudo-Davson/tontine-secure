// app/api/tontines/[id]/membres/[userId]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { penaliteService } from '@/lib/services/penalite-service';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const session = await verifySession(token);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id, userId } = await params;
    const body = await request.json().catch(() => ({}));
    const { raison, typeRetrait = 'VOLONTAIRE' } = body;

    // 1. Vérifier ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id, role: 'ADMIN', statut: 'ACTIF' },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut retirer des membres' },
        { status: 403 }
      );
    }

    // 2. Empêcher l'auto-suppression
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas vous retirer vous-même' },
        { status: 400 }
      );
    }

    // 3. Vérifier que le membre existe
    const membership = await prisma.member.findFirst({
      where: { tontineId: id, userId },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // 4. Récupérer la tontine
    const tontine = await prisma.tontine.findUnique({
      where: { id },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    // 5. Calculer le montant cotisé
    const cotisations = await prisma.cotisation.findMany({
      where: { tontineId: id, userId },
    });

    const montantCotise = cotisations.reduce((sum, c) => sum + c.montant, 0);

    // 6. Calculer la pénalité
    const calculPenalite = penaliteService.calculer(
      montantCotise,
      typeRetrait as any,
      tontine.tourActuel
    );

    // 7. Soft delete + pénalité
    const updatedMember = await prisma.member.update({
      where: { id: membership.id },
      data: {
        statut: 'RETIRE',
        retireLe: new Date(),
        retirePar: user.id,
        raisonRetrait: raison || calculPenalite.raison,
        montantCotise,
        montantPenalite: calculPenalite.montantPenalite,
        montantRembourse: calculPenalite.montantRembourse,
        pourcentagePenalite: calculPenalite.pourcentagePenalite,
        statutRemboursement: montantCotise > 0 ? 'EN_ATTENTE' : 'ANNULE',
      },
    });

    // 8. Mettre à jour les cotisations
    if (montantCotise > 0) {
      await prisma.cotisation.updateMany({
        where: { tontineId: id, userId },
        data: { statut: 'REMBOURSEE' },
      });
    }

    // 9. Notification
    await prisma.notification.create({
      data: {
        userId,
        titre: 'Retiré de la tontine',
        message: montantCotise > 0
          ? `Vous avez été retiré de la tontine "${tontine.nom}".\n\n` +
            `💰 Cotisé : ${montantCotise.toLocaleString()} FCFA\n` +
            `⚠️ Pénalité (${calculPenalite.pourcentagePenalite}%) : ${calculPenalite.montantPenalite.toLocaleString()} FCFA\n` +
            `✅ À recevoir : ${calculPenalite.montantRembourse.toLocaleString()} FCFA`
          : `Vous avez été retiré de la tontine "${tontine.nom}".`,
        type: 'INFO',
        lien: `/tontines/${id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: montantCotise > 0
        ? `Membre retiré. Cotisé : ${montantCotise.toLocaleString()} FCFA | Pénalité : ${calculPenalite.montantPenalite.toLocaleString()} FCFA (${calculPenalite.pourcentagePenalite}%) | Remboursé : ${calculPenalite.montantRembourse.toLocaleString()} FCFA`
        : 'Membre retiré avec succès',
      membre: updatedMember,
      softDelete: true,
      calcul: calculPenalite,
    });
  } catch (error: any) {
    console.error('Erreur DELETE membre :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}