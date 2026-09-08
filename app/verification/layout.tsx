// app/verification/layout.tsx
'use client';

import Link from 'next/link';
import { Wallet, ChevronLeft } from 'lucide-react';

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple sans sidebar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">TontineSecure</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">Vérification d'identité</span>
            </div>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}