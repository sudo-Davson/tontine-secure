// app/api/tontines/[id]/membres/[userId]/donner-chance/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { tourService } from '@/lib/services/tour-service';
import { adminAuditService } from '@/lib/services/admin-audit-service';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const session = await verifySession(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
  });
}

// ============================================
// POST /api/tontines/[id]/membres/[userId]/donner-chance
// Donner une chance à un membre qui n'a pas payé
// ============================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    // 1. Authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: tontineId, userId: targetUserId } = await params;

    // 2. Vérifier que l'utilisateur est ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: {
        tontineId,
        userId: user.id,
        role: 'ADMIN',
        statut: 'ACTIF',
      },
      include: { tontine: true },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut donner une chance' },
        { status: 403 }
      );
    }

    // 3. Vérifier que le membre cible existe et est actif
    const membreCible = await prisma.member.findFirst({
      where: {
        tontineId,
        userId: targetUserId,
        statut: 'ACTIF',
      },
      include: { user: true },
    });

    if (!membreCible) {
      return NextResponse.json(
        { success: false, error: 'Membre non trouvé ou inactif' },
        { status: 404 }
      );
    }

    // 4. Vérifier les limites (anti-abus)
    const verification = await adminAuditService.verifierLimites(
      'CHANCE_DONNEE',
      { userId: user.id, tontineId }
    );

    if (!verification.autorise) {
      return NextResponse.json(
        { success: false, error: verification.raison },
        { status: 429 }
      );
    }

    // 5. Donner la chance
    const resultat = await tourService.donnerChanceMembre(
      tontineId,
      targetUserId
    );

    if (!resultat.succes) {
      return NextResponse.json(
        { success: false, error: resultat.message },
        { status: 400 }
      );
    }

    // 6. Audit log
    await adminAuditService.enregistrerAction(
      'CHANCE_DONNEE',
      {
        userId: user.id,
        tontineId,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
      {
        cibleUserId: targetUserId,
        cibleNom: `${membreCible.user.firstName} ${membreCible.user.lastName}`,
        chancesUtilisees: resultat.chancesUtilisees,
        retraitAutomatique: resultat.retraitAutomatique,
      }
    );

    // 7. Notifier les autres membres
    await adminAuditService.notifierMembresActionAdmin(
      tontineId,
      user.id,
      '⚠️ Chance accordée à un membre',
      `L'admin a accordé une chance ${resultat.chancesUtilisees}/3 à ${membreCible.user.firstName} ${membreCible.user.lastName}.`
    );

    // 8. Réponse
    return NextResponse.json({
      success: true,
      message: resultat.message,
      chancesUtilisees: resultat.chancesUtilisees,
      retraitAutomatique: resultat.retraitAutomatique,
    });
  } catch (error: any) {
    console.error('Erreur donner-chance :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}