// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // ============================================
  // ROUTES PROTÉGÉES
  // ============================================
  const protectedRoutes = [
    '/dashboard',
    '/tontines',
    '/portefeuille',
    '/transactions',
    '/notifications',
    '/invitations',
    '/securite',
    '/parametres',
    '/verification',
  ];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // ============================================
  // ROUTES AUTH
  // ============================================
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // ============================================
  // LOGIQUE
  // ============================================

  // Si route protégée et pas de token → rediriger vers login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ⚠️ SUPPRIMÉ : La redirection auto de /login → /dashboard
  // On laisse AuthContext gérer ça côté client
  // Cela évite la boucle infinie si la session est révoquée

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tontines/:path*',
    '/portefeuille/:path*',
    '/transactions/:path*',
    '/notifications/:path*',
    '/invitations/:path*',
    '/securite/:path*',
    '/parametres/:path*',
    '/verification/:path*',
  ],
};