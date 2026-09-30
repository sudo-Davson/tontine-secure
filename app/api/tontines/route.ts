// app/api/tontines/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prismaWithRetry as prisma } from '@/lib/prisma';
import { verifyToken, verifySession, COOKIE_NAME } from '@/lib/auth';

// ============================================
// HELPER : Récupérer l'utilisateur connecté
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
// GET /api/tontines - Lister les tontines
// ============================================
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Tontines où l'utilisateur est membre
    const tontines = await prisma.tontine.findMany({
      where: {
        membres: {
          some: { userId: user.id },
        },
      },
      include: {
        createur: {
          select: { id: true, firstName: true, lastName: true },
        },
        membres: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: { membres: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      tontines,
    });
  } catch (error: any) {
    console.error('Erreur GET tontines :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/tontines - Créer une tontine
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

    // Vérifier KYC Niveau 2 minimum
    if (user.kycLevel < 2) {
      return NextResponse.json(
        { success: false, error: 'Vous devez compléter le KYC Niveau 2' },
        { status: 403 }
      );
    }

    // Vérifier réputation minimum
    if (user.reputation < 70) {
      return NextResponse.json(
        { success: false, error: 'Réputation insuffisante (minimum 70%)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nom,
      description,
      type,
      montant,
      frequence,
      frequenceConfig,
      nombreMembres,
      modeRotation,
      methodePaiement,
      numeroCollecte,
      codePin,
      reglesSecurite,
    } = body;

    // Validation
    if (!nom || nom.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Le nom doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    if (!montant || montant < 100) {
      return NextResponse.json(
        { success: false, error: 'Le montant minimum est de 100 FCFA' },
        { status: 400 }
      );
    }

    if (!nombreMembres || nombreMembres < 2) {
      return NextResponse.json(
        { success: false, error: 'Il faut au moins 2 membres' },
        { status: 400 }
      );
    }

    // Créer la tontine
    const tontine = await prisma.tontine.create({
      data: {
        nom,
        description: description || '',
        type: type || 'EPARGNE',
        montant: parseFloat(montant),
        frequence: frequence || 'MENSUELLE',
        frequenceConfig: JSON.stringify(frequenceConfig || { type: 'MENSUELLE', jourDuMois: 1 }),
        nombreMembres: parseInt(nombreMembres),
        nombreTours: parseInt(nombreMembres),
        modeRotation: modeRotation || 'ALEATOIRE',
        methodePaiement: methodePaiement || 'TMONEY',
        numeroCollecte: numeroCollecte || null,
        codePin: codePin || null,
        reglesSecurite: JSON.stringify(reglesSecurite || {}),
        montantTotal: parseFloat(montant) * parseInt(nombreMembres),
        createurId: user.id,
        statut: 'EN_ATTENTE',
      },
    });

    // Ajouter le créateur comme ADMIN
    await prisma.member.create({
      data: {
        tontineId: tontine.id,
        userId: user.id,
        role: 'ADMIN',
        statut: 'ACTIF',
      },
    });

    // Créer les tours
    const tours = Array.from({ length: parseInt(nombreMembres) }, (_, i) => ({
      tontineId: tontine.id,
      numero: i + 1,
      montant: parseFloat(montant) * parseInt(nombreMembres),
      statut: 'A_VENIR',
    }));

    await prisma.tour.createMany({ data: tours });

    return NextResponse.json(
      {
        success: true,
        message: 'Tontine créée avec succès',
        tontine,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur POST tontines :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}