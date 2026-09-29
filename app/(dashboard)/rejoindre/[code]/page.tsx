// app/(dashboard)/rejoindre/[code]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { invitationService, Invitation } from '../../../../lib/services/invitation-service';
import { 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Shield,
  ChevronRight,
  Clock
} from 'lucide-react';

// Tontine simulée (à remplacer par le backend)
const TONTINE_SIMULEE = {
  id: 'TNT-003',
  nom: 'Tontine Commerce',
  description: 'Tontine pour financer nos activités commerciales',
  montant: 100000,
  frequence: 'MENSUEL',
  nombreMembres: 12,
  membresActuels: 10,
  createurNom: 'Pierre Mensah',
  createurTelephone: '+228 92 34 56 78',
  statut: 'EN_ATTENTE',
};

export default function RejoindrePage() {
  const params = useParams();
  const router = useRouter();
  const { kycLevel, user } = useAuth();
  const code = params.code as string;

  const [tontine] = useState(TONTINE_SIMULEE);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const verification = invitationService.canJoinTontine(
    { kycLevel, reputation: user?.reputation || 85 },
    { membresActuels: tontine.membresActuels, nombreMembres: tontine.nombreMembres },
    false
  );

  const handleRejoindre = () => {
    if (!verification?.success) return;

    setIsJoining(true);

    // ============================================
    // 🚀 BACKEND : ICI ON ENVERRA LA DEMANDE
    // ============================================
    // const response = await fetch(`/api/tontines/${tontine.id}/rejoindre`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code }),
    // });
    // ============================================

    setTimeout(() => {
      setIsJoining(false);
      setIsJoined(true);
    }, 2000);
  };

  const getFrequenceLabel = (freq: string) => {
    switch (freq) {
      case 'HEBDOMADAIRE': return 'Hebdomadaire';
      case 'MENSUEL': return 'Mensuel';
      case 'TRIMESTRIEL': return 'Trimestriel';
      default: return freq;
    }
  };

  // Si l'utilisateur a rejoint
  if (isJoined) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Félicitations !
          </h1>
          <p className="text-gray-700 font-medium mb-6">
            Vous avez rejoint la tontine <strong>{tontine.nom}</strong>
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-bold text-gray-900 mb-2">Prochaines étapes :</h3>
            <ul className="space-y-1 text-sm text-gray-700 font-medium">
              <li>• Attendez que tous les membres confirment</li>
              <li>• La tontine sera activée automatiquement</li>
              <li>• Vous recevrez une notification pour la première cotisation</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/tontines/${tontine.id}`}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              Voir la tontine
            </Link>
            <Link
              href="/tontines"
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold"
            >
              Mes tontines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Rejoindre une tontine</h1>
        <p className="text-gray-700 font-medium mt-2">
          Vous avez été invité à rejoindre cette tontine
        </p>
      </div>

      {/* Carte de la tontine */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users className="h-7 w-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{tontine.nom}</h2>
            <p className="text-gray-700 font-medium mt-1">{tontine.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 font-bold">Montant</p>
            <p className="text-sm font-bold text-gray-900">{tontine.montant.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-bold">Fréquence</p>
            <p className="text-sm font-bold text-gray-900">{getFrequenceLabel(tontine.frequence)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-bold">Membres</p>
            <p className="text-sm font-bold text-gray-900">{tontine.membresActuels}/{tontine.nombreMembres}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-bold">Code</p>
            <p className="text-sm font-bold text-gray-900">{code}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">{tontine.createurNom.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Créée par {tontine.createurNom}</p>
              <p className="text-xs text-gray-700 font-medium">{tontine.createurTelephone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vérification */}
      {verification && !verification.success && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800">Impossible de rejoindre</h3>
              <p className="text-sm text-red-700 font-medium mt-1">{verification.message}</p>
              <Link
                href="/verification"
                className="inline-flex items-center gap-1 text-sm font-bold text-red-800 hover:text-red-900 mt-2"
              >
                Compléter ma vérification <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {verification && verification.success && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-800">Vous pouvez rejoindre</h3>
              <p className="text-sm text-green-700 font-medium mt-1">
                Toutes les conditions sont remplies
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/invitations"
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold"
        >
          Plus tard
        </Link>
        <button
          onClick={handleRejoindre}
          disabled={!verification?.success || isJoining}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
            !verification?.success || isJoining
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isJoining ? 'Adhésion en cours...' : 'Rejoindre la tontine'}
        </button>
      </div>
    </div>
  );
}
