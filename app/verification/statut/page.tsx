// app/verification/statut/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Shield,
  ChevronRight,
  Home
} from 'lucide-react';

export default function VerificationStatutPage() {
  // Simuler le statut de vérification
  const [statut, setStatut] = useState<'EN_COURS' | 'VALIDEE' | 'REJETEE'>('EN_COURS');

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-4">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Statut de Vérification</h1>
        <p className="text-gray-700 font-medium mt-2">
          Suivi de votre demande de vérification
        </p>
      </div>

      {/* Carte de statut */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 mb-6">
        {statut === 'EN_COURS' && (
          <div className="flex items-start gap-4">
            <Clock className="h-12 w-12 text-yellow-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vérification en cours</h2>
              <p className="text-gray-700 font-medium mt-2">
                Nous analysons vos documents. Cela peut prendre 24 à 48 heures.
              </p>
            </div>
          </div>
        )}

        {statut === 'VALIDEE' && (
          <div className="flex items-start gap-4">
            <CheckCircle className="h-12 w-12 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vérification réussie !</h2>
              <p className="text-gray-700 font-medium mt-2">
                Votre identité a été vérifiée. Vous pouvez maintenant participer aux tontines.
              </p>
            </div>
          </div>
        )}

        {statut === 'REJETEE' && (
          <div className="flex items-start gap-4">
            <AlertCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vérification rejetée</h2>
              <p className="text-gray-700 font-medium mt-2">
                Vos documents n'ont pas pu être vérifiés. Veuillez réessayer.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Étapes */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Étapes de vérification</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Soumission des documents</p>
              <p className="text-sm text-gray-700 font-medium">Documents reçus avec succès</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-semibold text-gray-900">Analyse automatique</p>
              <p className="text-sm text-gray-700 font-medium">Vérification OCR et correspondance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-900">Vérification manuelle</p>
              <p className="text-sm text-gray-700 font-medium">Revue par un agent (si nécessaire)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link 
          href="/dashboard"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          <Home className="h-5 w-5" />
          Accéder au tableau de bord
        </Link>
      </div>
    </div>
  );
}