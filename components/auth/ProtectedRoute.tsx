// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredKYCLevel?: 0 | 1 | 2 | 3;
}

export default function ProtectedRoute({
  children,
  requiredKYCLevel = 0,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, kycLevel } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si pas en chargement et pas authentifié → rediriger vers login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si KYC insuffisant → rediriger vers verification
    if (!isLoading && isAuthenticated && kycLevel < requiredKYCLevel) {
      router.push('/verification');
    }
  }, [isLoading, isAuthenticated, kycLevel, requiredKYCLevel, router]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-bold">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié → afficher un loader le temps de la redirection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-bold">Redirection...</p>
        </div>
      </div>
    );
  }

  // KYC insuffisant
  if (kycLevel < requiredKYCLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-bold">Vérification requise...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}