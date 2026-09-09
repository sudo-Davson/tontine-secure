// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredKYCLevel?: 0 | 1 | 2 | 3;
}

export default function ProtectedRoute({ children, requiredKYCLevel = 0 }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, kycLevel } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && isAuthenticated && kycLevel < requiredKYCLevel) {
      router.push('/verification');
      return;
    }
  }, [isLoading, isAuthenticated, kycLevel, requiredKYCLevel, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-bold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (kycLevel < requiredKYCLevel) {
    return null;
  }

  return <>{children}</>;
}