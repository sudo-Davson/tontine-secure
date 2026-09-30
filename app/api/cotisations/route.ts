// app/api/cotisations/route.ts
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
// GET /api/cotisations - Lister mes cotisations
// ============================================
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tontineId = searchParams.get('tontineId');
    const statut = searchParams.get('statut');

    const where: any = { userId: user.id };
    if (tontineId) where.tontineId = tontineId;
    if (statut) where.statut = statut;

    const cotisations = await prisma.cotisation.findMany({
      where,
      include: {
        tontine: {
          select: { id: true, nom: true, montant: true },
        },
        tour: {
          select: { numero: true },
        },
      },
      orderBy: { dateEcheance: 'desc' },
    });

    return NextResponse.json({ success: true, cotisations });
  } catch (error: any) {
    console.error('Erreur GET cotisations :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/cotisations - Créer les cotisations d'un tour
// ============================================
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tontineId, tourId, dateEcheance } = body;

    // Vérifier que l'utilisateur est ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: { tontineId, userId: user.id, role: 'ADMIN', statut: 'ACTIF' },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut créer des cotisations' },
        { status: 403 }
      );
    }

    // Récupérer la tontine et ses membres actifs
    const tontine = await prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        membres: {
          where: { statut: 'ACTIF' },
        },
      },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    const echeance = dateEcheance ? new Date(dateEcheance) : new Date();

    // Créer une cotisation pour chaque membre
    const cotisations = await Promise.all(
      tontine.membres.map((membre) =>
        prisma.cotisation.create({
          data: {
            tontineId,
            userId: membre.userId,
            tourId: tourId || null,
            montant: tontine.montant,
            statut: 'EN_ATTENTE',
            dateEcheance: echeance,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${cotisations.length} cotisation(s) créée(s)`,
      cotisations,
    });
  } catch (error: any) {
    console.error('Erreur POST cotisations :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}