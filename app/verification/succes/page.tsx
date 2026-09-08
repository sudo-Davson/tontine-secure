// app/verification/succes/page.tsx
'use client';

import Link from 'next/link';
import { CheckCircle, Home, ChevronRight } from 'lucide-react';

export default function VerificationSuccesPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Vérification soumise avec succès !
      </h1>
      <p className="text-gray-700 font-medium text-lg mb-8">
        Nous avons bien reçu vos documents. Vous serez notifié une fois la vérification terminée.
      </p>
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
      >
        <Home className="h-5 w-5" />
        Aller au tableau de bord
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}