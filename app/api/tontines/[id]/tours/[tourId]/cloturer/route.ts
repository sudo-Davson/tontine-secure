// app/api/tontines/[id]/tours/[tourId]/cloturer/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { tourService } from '@/lib/services/tour-service';
import { adminAuditService } from '@/lib/services/admin-audit-service';

// ============================================
// Helper : Récupérer l'utilisateur connecté
// ============================================
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
// POST /api/tontines/[id]/tours/[tourId]/cloturer
// Clôturer un tour manuellement (admin uniquement)
// ============================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; tourId: string }> }
) {
  try {
    // ----------------------------------------
    // 1. AUTHENTIFICATION
    // ----------------------------------------
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: tontineId, tourId } = await params;

    // ----------------------------------------
    // 2. VÉRIFIER QUE L'UTILISATEUR EST ADMIN
    // ----------------------------------------
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
        { success: false, error: 'Seul l\'admin peut clôturer un tour' },
        { status: 403 }
      );
    }

    // ----------------------------------------
    // 3. VÉRIFIER QUE LE TOUR EXISTE
    // ----------------------------------------
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        cotisations: true,
        tontine: true,
      },
    });

    if (!tour) {
      return NextResponse.json(
        { success: false, error: 'Tour non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le tour appartient bien à cette tontine
    if (tour.tontineId !== tontineId) {
      return NextResponse.json(
        { success: false, error: 'Ce tour n\'appartient pas à cette tontine' },
        { status: 403 }
      );
    }

    // ----------------------------------------
    // 4. VÉRIFIER LE STATUT DU TOUR
    // ----------------------------------------
    if (tour.statut === 'TERMINE') {
      return NextResponse.json(
        { success: false, error: 'Ce tour est déjà terminé' },
        { status: 400 }
      );
    }

    if (tour.statut === 'ANNULE') {
      return NextResponse.json(
        { success: false, error: 'Ce tour a été annulé' },
        { status: 400 }
      );
    }

    if (tour.statut === 'A_VENIR') {
      return NextResponse.json(
        { success: false, error: 'Ce tour n\'a pas encore démarré. Attendez qu\'il passe en cours.' },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 5. VÉRIFIER QUE TOUTES LES COTISATIONS SONT PAYÉES
    // ----------------------------------------
    const cotisationsImpayees = tour.cotisations.filter(
      (c) => c.statut !== 'PAYEE'
    );

    if (cotisationsImpayees.length > 0) {
      const totalCotisations = tour.cotisations.length;
      const payees = totalCotisations - cotisationsImpayees.length;

      return NextResponse.json(
        {
          success: false,
          error: `Impossible de clôturer : ${cotisationsImpayees.length} cotisation(s) impayée(s) sur ${totalCotisations}. Payées : ${payees}/${totalCotisations}.`,
          details: {
            cotisationsPayees: payees,
            cotisationsTotal: totalCotisations,
            cotisationsImpayees: cotisationsImpayees.length,
          },
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 6. VÉRIFIER QUE LA TONTINE EST ACTIVE
    // ----------------------------------------
    if (tour.tontine.statut !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: `La tontine n'est pas active (statut : ${tour.tontine.statut})` },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 7. CLÔTURER LE TOUR (via le service)
    // ----------------------------------------
    const resultat = await tourService.verifierEtCloturerTour(tontineId, tourId);

    if (!resultat.cloture) {
      return NextResponse.json(
        {
          success: false,
          error: resultat.raison || 'Impossible de clôturer le tour',
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // 8. MARQUER COMME CLÔTURÉ MANUELLEMENT
    // ----------------------------------------
    let tourFinal = resultat.tour;

    if (resultat.tour) {
      tourFinal = await prisma.tour.update({
        where: { id: tourId },
        data: {
          clotureParAdmin: true,
        },
      });
    }

        // ----------------------------------------
    // 9. AUDIT LOG (via service)
    // ----------------------------------------
    await adminAuditService.enregistrerAction(
      'TOUR_CLOTURE_MANUEL',
      {
        userId: user.id,
        tontineId,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
      {
        tourId,
        numero: tour.numero,
        montant: tour.montant,
        beneficiaireId: tour.beneficiaireId,
        cotisationsPayees: tour.cotisations.filter((c) => c.statut === 'PAYEE').length,
        cotisationsTotal: tour.cotisations.length,
      }
    );

    // 🆕 Notifier les membres
    await adminAuditService.notifierMembresActionAdmin(
      tontineId,
      user.id,
      '🎉 Tour clôturé par l\'admin',
      `L'admin a clôturé manuellement le tour n°${tour.numero}.\n\nLa cagnotte de ${tour.montant.toLocaleString()} FCFA a été versée au bénéficiaire.`
    );

    // ----------------------------------------
    // 10. RÉPONSE SUCCÈS
    // ----------------------------------------
    const message = resultat.tourSuivant
      ? `Tour n°${tour.numero} clôturé ! Le tour n°${resultat.tourSuivant.numero} a démarré.`
      : `Tour n°${tour.numero} clôturé ! C'était le dernier tour, la tontine est terminée. 🏁`;

    return NextResponse.json({
      success: true,
      message,
      tour: tourFinal, // ✅ Rechargé avec clotureParAdmin: true
      tourSuivant: resultat.tourSuivant,
    });
  } catch (error: any) {
    console.error('Erreur clôture manuelle tour :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}