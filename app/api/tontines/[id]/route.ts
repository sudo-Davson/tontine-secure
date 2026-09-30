// app/api/tontines/[id]/route.ts
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
              select: { id: true, firstName: true, lastName: true, email: true, reputation: true },
            },
          },
        },
        tours: {
          orderBy: { numero: 'asc' },
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

    // Vérifier que l'utilisateur est membre
    const isMember = tontine.membres.some((m) => m.userId === user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cette tontine' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, tontine });
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

    // Vérifier que l'utilisateur est ADMIN
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

    // Vérifier que l'utilisateur est créateur
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