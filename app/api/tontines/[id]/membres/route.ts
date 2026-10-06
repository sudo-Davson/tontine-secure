// app/api/tontines/[id]/membres/route.ts
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
// GET /api/tontines/[id]/membres - Lister les membres
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

    // Vérifier que l'utilisateur est membre
    const isMember = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id },
    });

    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre' },
        { status: 403 }
      );
    }

    const membres = await prisma.member.findMany({
      where: { tontineId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            reputation: true,
            kycLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, membres });
  } catch (error: any) {
    console.error('Erreur GET membres :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/tontines/[id]/membres - Ajouter un membre
// ============================================
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

    // Vérifier que l'utilisateur est ADMIN
    const adminMembership = await prisma.member.findFirst({
      where: { tontineId: id, userId: user.id, role: 'ADMIN' },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { success: false, error: 'Seul l\'admin peut ajouter des membres' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: 'Email ou téléphone requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur à ajouter
    const newMember = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phoneNumber: phone }] : []),
        ],
      },
    });

    if (!newMember) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé. Il doit d\'abord créer un compte.' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMembership = await prisma.member.findFirst({
      where: { tontineId: id, userId: newMember.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { success: false, error: 'Cet utilisateur est déjà membre' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a KYC 2
    if (newMember.kycLevel < 2) {
      return NextResponse.json(
        { success: false, error: 'L\'utilisateur doit avoir KYC Niveau 2' },
        { status: 403 }
      );
    }

    // Vérifier la limite de membres
    const tontine = await prisma.tontine.findUnique({
      where: { id },
      include: { _count: { select: { membres: true } } },
    });

    if (!tontine) {
      return NextResponse.json(
        { success: false, error: 'Tontine non trouvée' },
        { status: 404 }
      );
    }

    if (tontine._count.membres >= tontine.nombreMembres) {
      return NextResponse.json(
        { success: false, error: 'La tontine est complète' },
        { status: 400 }
      );
    }

    // Ajouter le membre
    const membre = await prisma.member.create({
      data: {
        tontineId: id,
        userId: newMember.id,
        role: 'MEMBRE',
        statut: 'ACTIF',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: newMember.id,
        titre: 'Ajouté à une tontine',
        message: `Vous avez été ajouté à la tontine "${tontine.nom}"`,
        type: 'INFO',
        lien: `/tontines/${id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Membre ajouté avec succès',
      membre,
    });
  } catch (error: any) {
    console.error('Erreur POST membres :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}