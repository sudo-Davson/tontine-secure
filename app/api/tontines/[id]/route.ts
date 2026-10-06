// app/api/tontines/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prismaWithRetry as prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';

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
// GET /api/tontines/[id] - Détails
// ============================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const tontine = await prisma.tontine.findUnique({
      where: { id },
      include: {
        createur: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        membres: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                reputation: true,
                kycLevel: true,
              },
            },
          },
          orderBy: [
            { statut: 'asc' },
            { createdAt: 'asc' },
          ],
        },
        tours: {
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
        },
        cotisations: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    const isMember = tontine.membres.some((m) => m.userId === user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cette tontine' },
        { status: 403 }
      );
    }

    // ============================================
    // 🆕 ENRICHISSEMENT DES TOURS
    // ============================================
    const beneficiaireIds = tontine.tours
      .map((t) => t.beneficiaireId)
      .filter((bid): bid is string => bid !== null);

    const beneficiaires = await prisma.user.findMany({
      where: { id: { in: beneficiaireIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
      },
    });

    const beneficiairesMap = new Map(beneficiaires.map((b) => [b.id, b]));

        const toursEnrichis = tontine.tours.map((tour) => {
      const cotisationsPayees = tour.cotisations.filter(
        (c) => c.statut === 'PAYEE'
      ).length;
      const cotisationsTotal = tour.cotisations.length;
      const pourcentagePaiement =
        cotisationsTotal > 0
          ? Math.round((cotisationsPayees / cotisationsTotal) * 100)
          : 0;

      // 🆕 Ma cotisation sur ce tour
      const maCotisationTour = tour.cotisations.find(
        (c) => c.userId === user.id
      );
      const aiPayeCeTour = maCotisationTour?.statut === 'PAYEE';
      const maCotisationStatut = maCotisationTour?.statut || null;

      // 🆕 Retardataires (membres qui n'ont pas payé)
      const retardataires = tour.cotisations
        .filter((c) => c.statut !== 'PAYEE')
        .map((c) => {
          const membre = tontine.membres.find((m) => m.userId === c.userId);
          return membre
            ? {
                userId: c.userId,
                firstName: membre.user.firstName,
                lastName: membre.user.lastName,
                cotisationId: c.id,
                statut: c.statut,
              }
            : null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      // 🆕 Montant restant à collecter
      const montantRestant = (cotisationsTotal - cotisationsPayees) * tontine.montant;

      return {
        id: tour.id,
        numero: tour.numero,
        beneficiaireId: tour.beneficiaireId,
        beneficiaire: tour.beneficiaireId
          ? beneficiairesMap.get(tour.beneficiaireId) || null
          : null,
        montant: tour.montant,
        statut: tour.statut,
        dateDebut: tour.dateDebut,
        dateFin: tour.dateFin,
        datePaiement: tour.datePaiement,
        clotureLe: tour.clotureLe,
        clotureParAdmin: tour.clotureParAdmin,
        cotisationsPayees,
        cotisationsTotal,
        pourcentagePaiement,
        estMonTour: tour.beneficiaireId === user.id,
        peutEtreCloture:
          tour.statut === 'EN_COURS' &&
          cotisationsTotal > 0 &&
          cotisationsPayees === cotisationsTotal,
        // 🆕 Infos sur ma cotisation
        aiPayeCeTour,
        maCotisationStatut,
        maCotisationId: maCotisationTour?.id || null,
        // 🆕 Retardataires et montant
        retardataires,
        montantRestant,
      };
    });

    // ============================================
    // 🆕 INFOS POUR L'UTILISATEUR CONNECTÉ
    // ============================================
    const monTour = toursEnrichis.find((t) => t.estMonTour);
    const maPosition = monTour?.numero || null;

    const mesCotisations = tontine.cotisations.filter(
      (c) => c.userId === user.id
    );
    const mesCotisationsPayees = mesCotisations.filter(
      (c) => c.statut === 'PAYEE'
    ).length;

    const monMembership = tontine.membres.find((m) => m.userId === user.id);
    const estAdmin = monMembership?.role === 'ADMIN';

    return NextResponse.json({
      success: true,
      tontine: {
        ...tontine,
        tours: toursEnrichis,
      },
      userInfo: {
        userId: user.id,
        estAdmin,
        maPosition,
        monTour,
        mesCotisationsPayees,
        mesCotisationsTotal: mesCotisations.length,
      },
    });
  } catch (error: any) {
    console.error('Erreur GET tontine :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/tontines/[id] - Modifier
// ============================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const membership = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id, role: 'ADMIN' },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut modifier' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nom, description, statut } = body;

    const tontine = await prisma.tontine.update({
      where: { id },
      data: {
        ...(nom && { nom }),
        ...(description !== undefined && { description }),
        ...(statut && { statut }),
      },
    });

    return NextResponse.json({ success: true, tontine });
  } catch (error: any) {
    console.error('Erreur PUT tontine :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/tontines/[id] - Supprimer
// ============================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const tontine = await prisma.tontine.findUnique({
      where: { id },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    if (tontine.createurId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Seul le créateur peut supprimer' },
        { status: 403 }
      );
    }

    await prisma.tontine.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Tontine supprimée',
    });
  } catch (error: any) {
    console.error('Erreur DELETE tontine :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}