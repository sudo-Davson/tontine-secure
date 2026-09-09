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
  phone: string;
  kycLevel: KYCLevel;
  isVerified: boolean;
  reputation: number;
  tontinesActives: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  kycLevel: KYCLevel;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateKYCLevel: (level: KYCLevel) => void;
  completeKYCStep: (step: 1 | 2 | 3) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateur simulé (à remplacer par le backend)
const MOCK_USER: User = {
  id: 'USER-001',
  firstName: 'Jean',
  lastName: 'Kouassi',
  email: 'jean.kouassi@email.com',
  phone: '+228 90 12 34 56',
  kycLevel: 0,
  isVerified: false,
  reputation: 85,
  tontinesActives: 1,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // ============================================
    // 🚀 BACKEND : ICI ON VÉRIFIERA LES IDENTIFIANTS
    // ============================================
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });
    // const data = await response.json();
    // if (data.success) {
    //   setUser(data.user);
    //   localStorage.setItem('auth_user', JSON.stringify(data.user));
    //   return true;
    // }
    // ============================================
    
    const mockUser = { ...MOCK_USER, email };
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // ============================================
    // 🚀 BACKEND : ICI ON CRÉERA LE COMPTE
    // ============================================
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // });
    // ============================================
    
    const mockUser: User = {
      id: 'USER-' + Date.now(),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      kycLevel: 0,
      isVerified: false,
      reputation: 85,
      tontinesActives: 0,
    };
    
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const updateKYCLevel = (level: KYCLevel) => {
    if (user) {
      const updatedUser = { ...user, kycLevel: level };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const completeKYCStep = (step: 1 | 2 | 3) => {
    if (user) {
      const newLevel = Math.max(user.kycLevel, step) as KYCLevel;
      updateKYCLevel(newLevel);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      kycLevel: user?.kycLevel || 0,
      login,
      register,
      logout,
      updateKYCLevel,
      completeKYCStep,
    }}>
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