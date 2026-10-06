// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prismaWithRetry as prisma } from '@/lib/prisma';
import { 
  hashPassword, 
  createSession,
  COOKIE_NAME, 
  cookieOptions 
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber: phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un compte existe déjà avec cet email ou téléphone' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        password: hashedPassword,
        kycLevel: 0,
        kycStatus: 'PENDING',
        isVerified: false,
        reputation: 85,
        abonnement: 'GRATUIT',
      },
    });

    // Créer une session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const sessionResult = await createSession(user.id, userAgent, ipAddress);

    // Si une session active existe → refuser
    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: sessionResult.error },
        { status: 409 }
      );
    }

    const session = sessionResult.session;

    // Retirer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Créer la réponse
    const response = NextResponse.json(
      {
        success: true,
        message: 'Inscription réussie',
        user: userWithoutPassword,
        token: session.token,
      },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, session.token, cookieOptions);

    return response;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}