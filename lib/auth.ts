// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
}

// ============================================
// MOTS DE PASSE (BCRYPT)
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT
// ============================================

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// ============================================
// COOKIES
// ============================================

export const COOKIE_NAME = 'auth_token';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

// ============================================
// SESSIONS
// ============================================

export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string,
  force: boolean = false
): Promise<{ success: boolean; session?: any; error?: string; existingSession?: any }> {
  const existingSession = await prisma.session.findFirst({
    where: {
      userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingSession && !force) {
    return {
      success: false,
      error: 'Vous êtes déjà connecté sur un autre appareil.',
      existingSession: {
        id: existingSession.id,
        userAgent: existingSession.userAgent,
        ipAddress: existingSession.ipAddress,
        createdAt: existingSession.createdAt,
      },
    };
  }

  if (existingSession && force) {
    await prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
  }

  const token = generateToken({ userId, email: '' });
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { success: true, session };
}

export async function verifySession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) return null;
  if (!session.isActive) return null;
  if (session.expiresAt < new Date()) return null;

  return session;
}

export async function revokeSession(token: string) {
  await prisma.session.updateMany({
    where: { token },
    data: {
      isActive: false,
      revokedAt: new Date(),
    },
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.updateMany({
    where: { userId, isActive: true },
    data: {
      isActive: false,
      revokedAt: new Date(),
    },
  });
}