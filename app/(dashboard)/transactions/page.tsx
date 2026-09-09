// app/(dashboard)/transactions/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  History,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Données simulées (à remplacer par le backend)
const transactionsSimulees = [
  { id: 'TR001', type: 'COTISATION', description: 'Cotisation - Tontine des Amis', montant: 50000, date: '15 Mars 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260315-001', tontine: 'Tontine des Amis' },
  { id: 'TR002', type: 'RECEPTION', description: 'Réception - Tour 3 - Tontine des Amis', montant: 500000, date: '10 Mars 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260310-002', tontine: 'Tontine des Amis' },
  { id: 'TR003', type: 'COTISATION', description: 'Cotisation - Tontine Commerce', montant: 100000, date: '05 Mars 2026', statut: 'REUSSI', methode: 'FLOOZ', reference: 'FL-20260305-003', tontine: 'Tontine Commerce' },
  { id: 'TR004', type: 'RETRAIT', description: 'Retrait vers Tmoney', montant: 200000, date: '01 Mars 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260301-004', tontine: 'N/A' },
  { id: 'TR005', type: 'COTISATION', description: 'Cotisation - Tontine des Amis', montant: 50000, date: '15 Février 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260215-005', tontine: 'Tontine des Amis' },
  { id: 'TR006', type: 'COTISATION', description: 'Cotisation - Tontine Famille', montant: 25000, date: '10 Février 2026', statut: 'REUSSI', methode: 'FLOOZ', reference: 'FL-20260210-006', tontine: 'Tontine Famille' },
  { id: 'TR007', type: 'RECEPTION', description: 'Réception - Tour 5 - Tontine Famille', montant: 250000, date: '05 Février 2026', statut: 'REUSSI', methode: 'FLOOZ', reference: 'FL-20260205-007', tontine: 'Tontine Famille' },
  { id: 'TR008', type: 'COTISATION', description: 'Cotisation - Tontine des Amis', montant: 50000, date: '15 Janvier 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260115-008', tontine: 'Tontine des Amis' },
  { id: 'TR009', type: 'PENALITE', description: 'Pénalité de retard - Tontine Famille', montant: 500, date: '12 Janvier 2026', statut: 'REUSSI', methode: 'FLOOZ', reference: 'FL-20260112-009', tontine: 'Tontine Famille' },
  { id: 'TR010', type: 'COTISATION', description: 'Cotisation - Tontine Commerce', montant: 100000, date: '05 Janvier 2026', statut: 'REUSSI', methode: 'TMONEY', reference: 'TM-20260105-010', tontine: 'Tontine Commerce' },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TOUS');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const [filterMethode, setFilterMethode] = useState('TOUTES');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Filtrer les transactions
  const transactionsFiltrees = transactionsSimulees.filter((transaction) => {
    const matchSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'TOUS' || transaction.type === filterType;
    const matchStatut = filterStatut === 'TOUS' || transaction.statut === filterStatut;
    const matchMethode = filterMethode === 'TOUTES' || transaction.methode === filterMethode;
    return matchSearch && matchType && matchStatut && matchMethode;
  });

  // Pagination
  const totalPages = Math.ceil(transactionsFiltrees.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = transactionsFiltrees.slice(indexOfFirst, indexOfLast);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COTISATION': return 'bg-blue-100 text-blue-800';
      case 'RECEPTION': return 'bg-green-100 text-green-800';
      case 'RETRAIT': return 'bg-red-100 text-red-800';
      case 'PENALITE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'COTISATION': return 'Cotisation';
      case 'RECEPTION': return 'Réception';
      case 'RETRAIT': return 'Retrait';
      case 'PENALITE': return 'Pénalité';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COTISATION': return ArrowUpRight;
      case 'RECEPTION': return ArrowDownRight;
      case 'RETRAIT': return ArrowDownRight;
      case 'PENALITE': return ArrowUpRight;
      default: return ArrowUpRight;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'REUSSI': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ECHOUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'REUSSI': return 'Réussi';
      case 'EN_ATTENTE': return 'En attente';
      case 'ECHOUE': return 'Échoué';
      default: return statut;
    }
  };

  const getMethodeColor = (methode: string) => {
    switch (methode) {
      case 'TMONEY': return 'bg-blue-50 text-blue-700';
      case 'FLOOZ': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-700 font-medium mt-1">
            Historique complet de vos transactions
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors font-bold text-gray-900">
          <Download className="h-5 w-5" />
          Télécharger le relevé
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Total transactions</p>
              <p className="text-2xl font-bold text-gray-900">128</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Total entrées</p>
              <p className="text-2xl font-bold text-green-600">5,000,000 FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Total sorties</p>
              <p className="text-2xl font-bold text-red-600">3,500,000 FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Solde net</p>
              <p className="text-2xl font-bold text-gray-900">1,500,000 FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClassName} pl-10`}
              placeholder="Rechercher..."
              style={{ color: '#000000' }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={inputClassName}
            style={{ color: '#000000' }}
          >
            <option value="TOUS">Tous les types</option>
            <option value="COTISATION">Cotisations</option>
            <option value="RECEPTION">Réceptions</option>
            <option value="RETRAIT">Retraits</option>
            <option value="PENALITE">Pénalités</option>
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className={inputClassName}
            style={{ color: '#000000' }}
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="REUSSI">Réussis</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ECHOUE">Échoués</option>
          </select>

          <select
            value={filterMethode}
            onChange={(e) => setFilterMethode(e.target.value)}
            className={inputClassName}
            style={{ color: '#000000' }}
          >
            <option value="TOUTES">Toutes les méthodes</option>
            <option value="TMONEY">Tmoney</option>
            <option value="FLOOZ">Flooz</option>
          </select>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">
        <div className="divide-y divide-gray-200">
          {currentTransactions.map((transaction) => {
            const Icon = getTypeIcon(transaction.type);
            return (
              <div key={transaction.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(transaction.type)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{transaction.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getMethodeColor(transaction.methode)}`}>
                      {transaction.methode === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      Ref: {transaction.reference}
                    </span>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'RECEPTION' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'RECEPTION' ? '+' : '-'}
                    {transaction.montant.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-700 font-medium">{transaction.date}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(transaction.statut)}`}>
                  {getStatutLabel(transaction.statut)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}