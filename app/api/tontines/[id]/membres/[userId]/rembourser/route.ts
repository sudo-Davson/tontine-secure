// app/api/tontines/[id]/membres/[userId]/rembourser/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';

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

// ============================================
// POST /api/tontines/[id]/membres/[userId]/rembourser
// ============================================
export async function POST(
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
    const { methode, telephone, note } = body;

    // 1. Vérifier ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id, role: 'ADMIN', statut: 'ACTIF' },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut rembourser' },
        { status: 403 }
      );
    }

    // 2. Vérifier que le membre retiré existe
    const membership = await prisma.member.findFirst({
      where: { tontineId: id, userId, statut: 'RETIRE' },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membre retiré non trouvé' },
        { status: 404 }
      );
    }

    // 3. Vérifier que le remboursement n'a pas déjà été fait
    if (membership.statutRemboursement === 'REMBOURSE') {
      return NextResponse.json(
        { success: false, error: 'Ce membre a déjà été remboursé' },
        { status: 400 }
      );
    }

    // 4. Vérifier qu'il y a un montant à rembourser
    if (membership.montantRembourse <= 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun montant à rembourser' },
        { status: 400 }
      );
    }

    // 5. Récupérer la tontine
    const tontine = await prisma.tontine.findUnique({
      where: { id },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    // 6. Marquer comme remboursé
    const updatedMember = await prisma.member.update({
      where: { id: membership.id },
      data: {
        statutRemboursement: 'REMBOURSE',
        rembourseLe: new Date(),
      },
    });

    // 7. Notification au membre
    await prisma.notification.create({
      data: {
        userId,
        titre: 'Remboursement effectué',
        message:
          `Vous avez été remboursé de ${membership.montantRembourse.toLocaleString()} FCFA ` +
          `pour la tontine "${tontine.nom}".\n\n` +
          `💰 Montant : ${membership.montantRembourse.toLocaleString()} FCFA\n` +
          `📱 Méthode : ${methode === 'FLOOZ' ? 'Flooz' : 'Tmoney'}\n` +
          `📞 Numéro : ${telephone || 'Non spécifié'}`,
        type: 'INFO',
        lien: `/tontines/${id}`,
      },
    });

    // 8. Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REMBOURSEMENT_MEMBRE',
        details: JSON.stringify({
          tontineId: id,
          membreUserId: userId,
          montant: membership.montantRembourse,
          methode,
          telephone,
          note,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Remboursement de ${membership.montantRembourse.toLocaleString()} FCFA enregistré`,
      membre: updatedMember,
    });
  } catch (error: any) {
    console.error('Erreur remboursement :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}