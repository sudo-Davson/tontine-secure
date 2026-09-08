// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Pour l'instant, on laisse tout passer
  // La protection sera ajoutée plus tard quand l'authentification sera implémentée
  return NextResponse.next();
}

export const config = {
  matcher: [],
};