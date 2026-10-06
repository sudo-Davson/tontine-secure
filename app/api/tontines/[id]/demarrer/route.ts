// app/api/tontines/[id]/demarrer/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';
import { frequenceService, FrequenceConfig } from '@/lib/services/frequence-service';

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

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(
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
        membres: {
          where: { statut: 'ACTIF' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                kycLevel: true,
              },
            },
          },
        },
        tours: true,
      },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    const adminMembership = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id, role: 'ADMIN', statut: 'ACTIF' },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut démarrer la tontine' },
        { status: 403 }
      );
    }

    if (tontine.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { success: false, error: `La tontine est déjà ${tontine.statut}` },
        { status: 400 }
      );
    }

    // ============================================
    // 🎯 RÈGLE : NOMBRE DE MEMBRES ATTEINT
    // ============================================
    const nombreMembresActuels = tontine.membres.length;
    const nombreMembresRequis = tontine.nombreMembres;

    if (nombreMembresActuels !== nombreMembresRequis) {
      const membresManquants = nombreMembresRequis - nombreMembresActuels;

      if (membresManquants > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `La tontine nécessite exactement ${nombreMembresRequis} membres. Actuellement : ${nombreMembresActuels}. Il manque ${membresManquants} membre(s).`,
            details: {
              membresRequis: nombreMembresRequis,
              membresActuels: nombreMembresActuels,
              membresManquants,
            },
          },
          { status: 400 }
        );
      }

      if (membresManquants < 0) {
        return NextResponse.json(
          {
            success: false,
            error: `La tontine a trop de membres (${nombreMembresActuels}/${nombreMembresRequis}). Veuillez retirer ${Math.abs(membresManquants)} membre(s).`,
            details: {
              membresRequis: nombreMembresRequis,
              membresActuels: nombreMembresActuels,
              exces: Math.abs(membresManquants),
            },
          },
          { status: 400 }
        );
      }
    }

    if (nombreMembresActuels < 2) {
      return NextResponse.json(
        { success: false, error: 'Il faut au moins 2 membres actifs pour démarrer' },
        { status: 400 }
      );
    }

    const membresSansKYC = tontine.membres.filter(
      (m) => m.user.kycLevel < 2
    );
    if (membresSansKYC.length > 0) {
      const noms = membresSansKYC
        .map((m) => `${m.user.firstName} ${m.user.lastName}`)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          error: `Les membres suivants n'ont pas le KYC Niveau 2 : ${noms}`,
        },
        { status: 400 }
      );
    }

    let frequenceConfig: FrequenceConfig;
    try {
      frequenceConfig = JSON.parse(tontine.frequenceConfig || '{}');
      if (!frequenceConfig.type) {
        frequenceConfig = { type: 'MENSUELLE', jourDuMois: 1 };
      }
    } catch {
      frequenceConfig = { type: 'MENSUELLE', jourDuMois: 1 };
    }

    const dates = frequenceService.calculerProchainesDates(
      frequenceConfig,
      tontine.nombreTours
    );

    let ordreBeneficiaires: string[];

    if (tontine.modeRotation === 'ALEATOIRE') {
      const membresMelanges = shuffleArray(tontine.membres);
      ordreBeneficiaires = membresMelanges.map((m) => m.userId);
    } else {
      ordreBeneficiaires = tontine.membres.map((m) => m.userId);
    }

    // ============================================
    // 🚀 TRANSACTION AVEC TIMEOUT AUGMENTÉ
    // ============================================
    const result = await prisma.$transaction(
      async (tx) => {
        await tx.tour.deleteMany({ where: { tontineId: id } });

        const tours = await Promise.all(
          Array.from({ length: tontine.nombreTours }, (_, i) => {
            const numero = i + 1;
            const estPremier = numero === 1;
            const beneficiaireId = ordreBeneficiaires[i] || null;

            return tx.tour.create({
              data: {
                tontineId: id,
                numero,
                beneficiaireId,
                montant: tontine.montant * tontine.membres.length,
                statut: estPremier ? 'EN_COURS' : 'A_VENIR',
                dateDebut: estPremier ? new Date() : dates[i] || null,
              },
            });
          })
        );

        const cotisationsData = tours.flatMap((tour, tourIndex) =>
          tontine.membres.map((membre) => ({
            tontineId: id,
            userId: membre.userId,
            tourId: tour.id,
            montant: tontine.montant,
            statut: 'EN_ATTENTE',
            dateEcheance: dates[tourIndex] || new Date(),
          }))
        );

        await tx.cotisation.createMany({ data: cotisationsData });

        const tontineUpdated = await tx.tontine.update({
          where: { id },
          data: {
            statut: 'ACTIVE',
            dateDebut: new Date(),
            tourActuel: 1,
            montantTotal: tontine.montant * tontine.membres.length * tontine.nombreTours,
          },
        });

        const notificationsData = tontine.membres.map((membre) => ({
          userId: membre.userId,
          titre: '🎉 Tontine démarrée',
          message: `La tontine "${tontine.nom}" a démarré !\n\n` +
            `💰 Cotisation : ${tontine.montant.toLocaleString()} FCFA\n` +
            `📅 Première échéance : ${dates[0]?.toLocaleDateString('fr-FR') || 'À définir'}\n` +
            `🎯 Tours : ${tontine.nombreTours}\n` +
            `👥 Membres : ${tontine.membres.length}`,
          type: 'INFO',
          lien: `/tontines/${id}`,
        }));

        await tx.notification.createMany({ data: notificationsData });

        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'TONTINE_DEMARREE',
            details: JSON.stringify({
              tontineId: id,
              nombreMembres: tontine.membres.length,
              nombreTours: tontine.nombreTours,
              nombreCotisations: cotisationsData.length,
            }),
          },
        });

        return {
          tontine: tontineUpdated,
          tours: tours.length,
          cotisations: cotisationsData.length,
          notifications: notificationsData.length,
        };
      },
      {
        timeout: 30000,   // 30 secondes (par défaut : 5000ms)
        maxWait: 10000,   // 10 secondes d'attente max pour démarrer la transaction
      }
    );

    return NextResponse.json({
      success: true,
      message: `Tontine démarrée ! ${result.tours} tours et ${result.cotisations} cotisations créés.`,
      details: result,
    });
  } catch (error: any) {
    console.error('Erreur démarrage tontine :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}