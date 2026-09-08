// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  PlusCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  Star
} from 'lucide-react';

export default function DashboardPage() {
  // Données simulées
  const [stats] = useState({
    tontinesActives: 2,
    totalCotise: 150000,
    prochainTour: '15 Mars 2026',
    niveauVerification: 2,
  });

  const tontinesRecentes = [
    {
      id: 1,
      nom: 'Tontine des Amis',
      montant: 50000,
      membres: 10,
      tourActuel: 3,
      prochaineCotisation: '15 Mars 2026',
      statut: 'ACTIVE',
    },
    {
      id: 2,
      nom: 'Tontine Famille',
      montant: 25000,
      membres: 8,
      tourActuel: 5,
      prochaineCotisation: '20 Mars 2026',
      statut: 'ACTIVE',
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-700 font-medium mt-1">
            Bienvenue ! Voici un aperçu de vos tontines
          </p>
        </div>
        <Link
          href="/tontines/creer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          <PlusCircle className="h-5 w-5" />
          Nouvelle tontine
        </Link>
      </div>

      {/* Statut de vérification */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <p className="font-bold">Niveau de vérification : {stats.niveauVerification}/3</p>
            <p className="text-sm text-green-100">
              Votre identité est vérifiée. Vous pouvez participer aux tontines.
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Tontines actives</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.tontinesActives}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Total cotisé</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCotise.toLocaleString()} FCFA</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-900">Prochain tour</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.prochainTour}</p>
        </div>
      </div>

      {/* Tontines récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Mes tontines</h2>
          <Link 
            href="/tontines" 
            className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-gray-200">
          {tontinesRecentes.map((tontine) => (
            <div key={tontine.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tontine.nom}</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    {tontine.montant.toLocaleString()} FCFA / mois • {tontine.membres} membres
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">Tour {tontine.tourActuel}</p>
                <p className="text-xs text-gray-700 font-medium">
                  Prochaine: {tontine.prochaineCotisation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/tontines/creer"
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-500 transition-colors"
        >
          <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900">Créer une tontine</h3>
          <p className="text-sm text-gray-700 font-medium mt-1">
            Démarrez une nouvelle tontine avec vos proches
          </p>
        </Link>

        <Link
          href="/verification/niveau-3"
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 text-center hover:border-purple-500 transition-colors"
        >
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900">Vérification renforcée</h3>
          <p className="text-sm text-gray-700 font-medium mt-1">
            Augmentez votre niveau de confiance
          </p>
        </Link>
      </div>
    </div>
  );
}