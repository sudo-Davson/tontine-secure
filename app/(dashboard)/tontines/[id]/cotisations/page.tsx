// app/(dashboard)/tontines/[id]/cotisations/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Smartphone,
  Shield,
  TrendingUp
} from 'lucide-react';

// Données simulées des cotisations
const cotisationsSimulees = [
  { id: 'COT001', membre: 'Jean Kouassi', montant: 50000, statut: 'PAYEE', dateEcheance: '01 Mars 2026', datePaiement: '28 Février 2026', methode: 'TMONEY' },
  { id: 'COT002', membre: 'Marie Adjoua', montant: 50000, statut: 'PAYEE', dateEcheance: '01 Mars 2026', datePaiement: '01 Mars 2026', methode: 'TMONEY' },
  { id: 'COT003', membre: 'Pierre Mensah', montant: 50000, statut: 'PAYEE', dateEcheance: '01 Mars 2026', datePaiement: '01 Mars 2026', methode: 'FLOOZ' },
  { id: 'COT004', membre: 'Ama Koffi', montant: 50000, statut: 'EN_RETARD', dateEcheance: '01 Mars 2026', datePaiement: null, methode: null },
  { id: 'COT005', membre: 'Kossi Agbo', montant: 50000, statut: 'EN_ATTENTE', dateEcheance: '01 Mars 2026', datePaiement: null, methode: null },
];

export default function CotisationsPage() {
  const params = useParams();
  const [filterStatut, setFilterStatut] = useState('TOUTES');

  const cotisationsFiltrees = cotisationsSimulees.filter(cot => {
    if (filterStatut === 'TOUTES') return true;
    return cot.statut === filterStatut;
  });

  const stats = {
    totalCotisations: cotisationsSimulees.length,
    payees: cotisationsSimulees.filter(c => c.statut === 'PAYEE').length,
    enRetard: cotisationsSimulees.filter(c => c.statut === 'EN_RETARD').length,
    montantCollecte: cotisationsSimulees.filter(c => c.statut === 'PAYEE').reduce((sum, c) => sum + c.montant, 0),
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PAYEE': return 'bg-green-100 text-green-800';
      case 'EN_RETARD': return 'bg-red-100 text-red-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'PAYEE': return 'Payée';
      case 'EN_RETARD': return 'En retard';
      case 'EN_ATTENTE': return 'En attente';
      default: return statut;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/tontines/${params.id}`} className="p-2 bg-white rounded-lg border-2 border-gray-200">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotisations - Tour 3</h1>
          <p className="text-gray-700 font-medium">Suivi des cotisations du tour actuel</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">Total cotisations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCotisations}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">Payées</p>
          <p className="text-2xl font-bold text-green-600">{stats.payees}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">En retard</p>
          <p className="text-2xl font-bold text-red-600">{stats.enRetard}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-900">Montant collecté</p>
          <p className="text-2xl font-bold text-gray-900">{stats.montantCollecte.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Progression */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-3">Progression du tour</h3>
        <div className="bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 rounded-full h-3"
            style={{ width: `${(stats.payees / stats.totalCotisations) * 100}%` }}
          />
        </div>
        <p className="text-sm font-bold text-gray-700 mt-2">
          {stats.payees}/{stats.totalCotisations} membres ont cotisé
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {['TOUTES', 'PAYEE', 'EN_RETARD', 'EN_ATTENTE'].map((statut) => (
          <button
            key={statut}
            onClick={() => setFilterStatut(statut)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              filterStatut === statut
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            {statut === 'TOUTES' ? 'Toutes' : getStatutLabel(statut)}
          </button>
        ))}
      </div>

      {/* Liste des cotisations */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">
        <div className="divide-y divide-gray-200">
          {cotisationsFiltrees.map((cotisation) => (
            <div key={cotisation.id} className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatutColor(cotisation.statut)}`}>
                {cotisation.statut === 'PAYEE' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : cotisation.statut === 'EN_RETARD' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{cotisation.membre}</p>
                <p className="text-sm text-gray-700 font-medium">
                  Échéance : {cotisation.dateEcheance}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{cotisation.montant.toLocaleString()} FCFA</p>
                {cotisation.datePaiement && (
                  <p className="text-sm text-gray-700 font-medium">
                    Payé le : {cotisation.datePaiement}
                  </p>
                )}
                {cotisation.methode && (
                  <p className="text-xs text-gray-600 font-medium">
                    {cotisation.methode === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(cotisation.statut)}`}>
                {getStatutLabel(cotisation.statut)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-900">Distribution du tour</h3>
            <p className="text-gray-700 font-medium mt-1">
              {stats.payees === stats.totalCotisations 
                ? '✅ Toutes les cotisations sont payées. La distribution peut avoir lieu.' 
                : `⏳ ${stats.totalCotisations - stats.payees} membre(s) n'ont pas encore cotisé.`}
            </p>
          </div>
        </div>
        {stats.payees === stats.totalCotisations && (
          <button className="mt-4 w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold">
            Procéder à la distribution
          </button>
        )}
      </div>
    </div>
  );
}