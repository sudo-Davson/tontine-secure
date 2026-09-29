// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types
type KYCLevel = 0 | 1 | 2 | 3;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  kycLevel: KYCLevel;
  kycStatus: string;
  isVerified: boolean;
  reputation: number;
  abonnement: string;
  avatarUrl?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  kycLevel: KYCLevel;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateKYCLevel: (level: KYCLevel) => void;
  completeKYCStep: (step: 1 | 2 | 3) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ============================================
  // VÉRIFIER LA SESSION AU DÉMARRAGE
  // ============================================
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // ✅ Réponse OK mais pas de user → null
          setUser(null);
        }
      } else {
        // ✅ 401 ou autre erreur → user null
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur session :', error);
      // ✅ Erreur réseau → user null
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkSession();
  };

  // ============================================
  // LOGIN
  // ============================================
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur login :', error);
      setIsLoading(false);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  // ============================================
  // REGISTER
  // ============================================
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Erreur d\'inscription' };
      }
    } catch (error) {
      console.error('Erreur register :', error);
      setIsLoading(false);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Erreur logout :', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // ============================================
  // KYC
  // ============================================
  const updateKYCLevel = (level: KYCLevel) => {
    if (user) {
      setUser({ ...user, kycLevel: level });
    }
  };

  const completeKYCStep = (step: 1 | 2 | 3) => {
    if (user) {
      const newLevel = Math.max(user.kycLevel, step) as KYCLevel;
      updateKYCLevel(newLevel);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        kycLevel: user?.kycLevel || 0,
        login,
        register,
        logout,
        updateKYCLevel,
        completeKYCStep,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}