// app/(dashboard)/portefeuille/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  CreditCard,
  History,
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

// Données simulées
const portefeuilleData = {
  soldeTotal: 2500000,
  soldeDisponible: 1800000,
  soldeEnTontine: 700000,
  totalCotise: 3500000,
  totalRecu: 5000000,
  transactions: [
    { id: 'TR001', type: 'COTISATION', description: 'Cotisation - Tontine des Amis', montant: 50000, date: '15 Mars 2026', statut: 'REUSSI', methode: 'Tmoney' },
    { id: 'TR002', type: 'RECEPTION', description: 'Réception - Tour 2 - Tontine Famille', montant: 500000, date: '10 Mars 2026', statut: 'REUSSI', methode: 'Tmoney' },
    { id: 'TR003', type: 'COTISATION', description: 'Cotisation - Tontine Commerce', montant: 100000, date: '05 Mars 2026', statut: 'REUSSI', methode: 'Flooz' },
    { id: 'TR004', type: 'RETRAIT', description: 'Retrait vers Tmoney', montant: 200000, date: '01 Mars 2026', statut: 'REUSSI', methode: 'Tmoney' },
    { id: 'TR005', type: 'COTISATION', description: 'Cotisation - Tontine des Amis', montant: 50000, date: '15 Février 2026', statut: 'REUSSI', methode: 'Tmoney' },
    { id: 'TR006', type: 'COTISATION', description: 'Cotisation - Tontine Famille', montant: 25000, date: '10 Février 2026', statut: 'REUSSI', methode: 'Flooz' },
  ],
};

export default function PortefeuillePage() {
  const [showSolde, setShowSolde] = useState(true);
  const [activeTab, setActiveTab] = useState('TOUTES');
  const [showRetraitModal, setShowRetraitModal] = useState(false);
  const [showDepotModal, setShowDepotModal] = useState(false);
  const [montant, setMontant] = useState('');
  const [methode, setMethode] = useState('TMONEY');
  const [numero, setNumero] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COTISATION': return 'bg-blue-100 text-blue-800';
      case 'RECEPTION': return 'bg-green-100 text-green-800';
      case 'RETRAIT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'COTISATION': return 'Cotisation';
      case 'RECEPTION': return 'Réception';
      case 'RETRAIT': return 'Retrait';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COTISATION': return ArrowUpRight;
      case 'RECEPTION': return ArrowDownRight;
      case 'RETRAIT': return ArrowDownRight;
      default: return ArrowUpRight;
    }
  };

  const transactionsFiltrees = portefeuilleData.transactions.filter((transaction) => {
    if (activeTab === 'TOUTES') return true;
    if (activeTab === 'ENTREES') return transaction.type === 'RECEPTION';
    if (activeTab === 'SORTIES') return transaction.type === 'COTISATION' || transaction.type === 'RETRAIT';
    return true;
  });

  const handleRetrait = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Retrait de ${montant} FCFA vers ${methode} (${numero}) initié !`);
    setShowRetraitModal(false);
    setMontant('');
    setNumero('');
  };

  const handleDepot = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Dépôt de ${montant} FCFA via ${methode} initié !`);
    setShowDepotModal(false);
    setMontant('');
  };

  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Portefeuille</h1>
          <p className="text-gray-700 font-medium mt-1">
            Gérez vos fonds et suivez vos transactions
          </p>
        </div>
        <button
          onClick={() => setShowSolde(!showSolde)}
          className="p-2 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
        >
          {showSolde ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      {/* Carte principale */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="font-bold">Solde total</span>
          </div>
          <Shield className="h-5 w-5 text-blue-200" />
        </div>
        <p className="text-4xl font-bold mb-4">
          {showSolde ? `${portefeuilleData.soldeTotal.toLocaleString()} FCFA` : '••••••••'}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Disponible</p>
            <p className="font-bold">
              {showSolde ? `${portefeuilleData.soldeDisponible.toLocaleString()} FCFA` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm font-medium">En tontine</p>
            <p className="font-bold">
              {showSolde ? `${portefeuilleData.soldeEnTontine.toLocaleString()} FCFA` : '••••••'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowDepotModal(true)}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 text-center hover:border-blue-400 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <PlusCircle className="h-5 w-5 text-green-600" />
          </div>
          <p className="font-bold text-gray-900">Déposer</p>
        </button>

        <button
          onClick={() => setShowRetraitModal(true)}
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 text-center hover:border-blue-400 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
          </div>
          <p className="font-bold text-gray-900">Retirer</p>
        </button>

        <Link
          href="/transactions"
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 text-center hover:border-blue-400 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <History className="h-5 w-5 text-blue-600" />
          </div>
          <p className="font-bold text-gray-900">Historique</p>
        </Link>

        <button
          className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 text-center hover:border-blue-400 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
            <Download className="h-5 w-5 text-purple-600" />
          </div>
          <p className="font-bold text-gray-900">Relevé</p>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Total cotisé
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {showSolde ? `${portefeuilleData.totalCotise.toLocaleString()} FCFA` : '••••••'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            Total reçu
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {showSolde ? `${portefeuilleData.totalRecu.toLocaleString()} FCFA` : '••••••'}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Transactions récentes</h3>
          <div className="flex gap-2">
            {['TOUTES', 'ENTREES', 'SORTIES'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'TOUTES' ? 'Toutes' : tab === 'ENTREES' ? 'Entrées' : 'Sorties'}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {transactionsFiltrees.map((transaction) => {
            const Icon = getTypeIcon(transaction.type);
            return (
              <div key={transaction.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {transaction.date} • {transaction.methode}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'RECEPTION' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'RECEPTION' ? '+' : '-'}
                    {transaction.montant.toLocaleString()} FCFA
                  </p>
                  <span className="text-xs font-bold text-green-600">
                    ✓ Réussi
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de retrait */}
      {showRetraitModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Retirer des fonds</h3>
              <button onClick={() => setShowRetraitModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleRetrait} className="space-y-4">
              <div>
                <label className={labelClassName}>Montant (FCFA) *</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className={inputClassName}
                  placeholder="Ex: 50000"
                  min="100"
                  style={{ color: '#000000' }}
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>Méthode *</label>
                <select
                  value={methode}
                  onChange={(e) => setMethode(e.target.value)}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                >
                  <option value="TMONEY">Tmoney (Mixx by Yas)</option>
                  <option value="FLOOZ">Flooz (Moov Money)</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Numéro *</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="tel"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className={`${inputClassName} pl-10`}
                    placeholder="Ex: 90 XX XX XX XX"
                    style={{ color: '#000000' }}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                Confirmer le retrait
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de dépôt */}
      {showDepotModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Déposer des fonds</h3>
              <button onClick={() => setShowDepotModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleDepot} className="space-y-4">
              <div>
                <label className={labelClassName}>Montant (FCFA) *</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className={inputClassName}
                  placeholder="Ex: 50000"
                  min="100"
                  style={{ color: '#000000' }}
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>Méthode *</label>
                <select
                  value={methode}
                  onChange={(e) => setMethode(e.target.value)}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                >
                  <option value="TMONEY">Tmoney (Mixx by Yas)</option>
                  <option value="FLOOZ">Flooz (Moov Money)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
              >
                Confirmer le dépôt
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}