// app/api/tontines/[id]/membres/[userId]/retirer-pour-impaye/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { tourService, TypeRetrait } from '@/lib/services/tour-service';
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

// Types de retrait autorisés manuellement
const TYPES_RETRAIT_AUTORISES: TypeRetrait[] = [
  'VOLONTAIRE',
  'RAISON_VALABLE',
  'EXCLUSION',
  'AMIABLE',
];

// ============================================
// POST /api/tontines/[id]/membres/[userId]/retirer-pour-impaye
// Retirer un membre manuellement (admin)
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

    // 2. Récupérer le body
    let body: { typeRetrait?: string; raison?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body vide = valeurs par défaut
    }

    const typeRetrait = (body.typeRetrait || 'RAISON_VALABLE') as TypeRetrait;
    const raison = body.raison?.trim() || 'Retrait administrateur';

    // 3. Valider le type de retrait
    if (!TYPES_RETRAIT_AUTORISES.includes(typeRetrait)) {
      return NextResponse.json(
        {
          success: false,
          error: `Type de retrait invalide. Types autorisés : ${TYPES_RETRAIT_AUTORISES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. Raison obligatoire (min 10 caractères)
    if (raison.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'La raison est obligatoire (minimum 10 caractères).',
        },
        { status: 400 }
      );
    }

    // 5. Vérifier que l'utilisateur est ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: {
        tontineId,
        userId: user.id,
        role: 'ADMIN',
        statut: 'ACTIF',
      },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut retirer un membre' },
        { status: 403 }
      );
    }

    // 6. Interdire l'auto-retrait de l'admin
    if (targetUserId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous ne pouvez pas vous retirer vous-même. Transférez d\'abord le rôle admin.',
        },
        { status: 400 }
      );
    }

    // 7. Vérifier que le membre cible existe et est actif
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
        { success: false, error: 'Membre non trouvé ou déjà retiré' },
        { status: 404 }
      );
    }

    // 8. Vérifier les limites (anti-abus)
    const verification = await adminAuditService.verifierLimites(
      'MEMBRE_RETIRE_MANUEL',
      { userId: user.id, tontineId }
    );

    if (!verification.autorise) {
      return NextResponse.json(
        { success: false, error: verification.raison },
        { status: 429 }
      );
    }

    // 9. Retirer le membre (via le service)
    const resultat = await tourService.retirerMembrePourImpaye(
      tontineId,
      targetUserId,
      typeRetrait,
      raison
    );

    // 10. Audit log
    await adminAuditService.enregistrerAction(
      'MEMBRE_RETIRE_MANUEL',
      {
        userId: user.id,
        tontineId,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
      {
        cibleUserId: targetUserId,
        cibleNom: `${membreCible.user.firstName} ${membreCible.user.lastName}`,
        typeRetrait,
        raison,
        calcul: resultat.calcul,
      }
    );

    // 11. Notifier les autres membres
    await adminAuditService.notifierMembresActionAdmin(
      tontineId,
      user.id,
      '👥 Un membre a été retiré',
      `L'admin a retiré ${membreCible.user.firstName} ${membreCible.user.lastName}.\n\nRaison : ${raison}`
    );

    // 12. Réponse
    return NextResponse.json({
      success: true,
      message: `Membre retiré avec succès (${typeRetrait}).`,
      calcul: resultat.calcul,
    });
  } catch (error: any) {
    console.error('Erreur retirer-pour-impaye :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}