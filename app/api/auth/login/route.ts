// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyPassword, 
  createSession,
  COOKIE_NAME, 
  cookieOptions 
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe obligatoires' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer une session (refuse si déjà connecté ailleurs)
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const sessionResult = await createSession(user.id, userAgent, ipAddress);

    // Si une session active existe → refuser la connexion
    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: sessionResult.error },
        { status: 409 }  // 409 = Conflict
      );
    }

    const session = sessionResult.session;

    // Retirer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token: session.token,
      },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, session.token, cookieOptions);

    return response;
  } catch (error: any) {
    console.error('Erreur lors de la connexion :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}