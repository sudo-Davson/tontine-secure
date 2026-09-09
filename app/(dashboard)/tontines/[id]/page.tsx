// app/(dashboard)/tontines/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Shield, 
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  TrendingUp,
  Copy,
  Share2,
  UserPlus,
  History,
  Settings,
  LogOut
} from 'lucide-react';

// Données simulées (à remplacer par les données du backend)
const tontineDetail = {
  id: 'TNT-001',
  nom: 'Tontine des Amis',
  description: 'Tontine mensuelle entre amis pour épargner ensemble et réaliser nos projets.',
  montant: 50000,
  frequence: 'MENSUEL',
  nombreMembres: 10,
  nombreTours: 10,
  tourActuel: 3,
  montantCollecte: 1500000,
  montantTotal: 5000000,
  modeRotation: 'ALEATOIRE',
  statut: 'ACTIVE',
  prochaineCotisation: '15 Mars 2026',
  methodePaiement: 'TMONEY',
  dateCreation: '15 Janvier 2026',
  createur: {
    nom: 'Jean Kouassi',
    telephone: '+228 90 12 34 56',
  },
  membres: [
    { id: 'M001', nom: 'Jean Kouassi', telephone: '+228 90 12 34 56', statut: 'ADMIN', reputation: 95, toursRecus: 1 },
    { id: 'M002', nom: 'Marie Adjoua', telephone: '+228 91 23 45 67', statut: 'MEMBRE', reputation: 88, toursRecus: 1 },
    { id: 'M003', nom: 'Pierre Mensah', telephone: '+228 92 34 56 78', statut: 'MEMBRE', reputation: 92, toursRecus: 1 },
    { id: 'M004', nom: 'Ama Koffi', telephone: '+228 93 45 67 89', statut: 'MEMBRE', reputation: 75, toursRecus: 0 },
    { id: 'M005', nom: 'Kossi Agbo', telephone: '+228 94 56 78 90', statut: 'MEMBRE', reputation: 80, toursRecus: 0 },
  ],
  tours: [
    { id: 'T001', numero: 1, beneficiaire: 'Jean Kouassi', montant: 500000, date: '15 Février 2026', statut: 'TERMINE' },
    { id: 'T002', numero: 2, beneficiaire: 'Marie Adjoua', montant: 500000, date: '15 Mars 2026', statut: 'TERMINE' },
    { id: 'T003', numero: 3, beneficiaire: 'Pierre Mensah', montant: 500000, date: '15 Avril 2026', statut: 'EN_COURS' },
    { id: 'T004', numero: 4, beneficiaire: 'En attente', montant: 500000, date: '15 Mai 2026', statut: 'A_VENIR' },
  ],
  transactions: [
    { id: 'TR001', membre: 'Ama Koffi', montant: 50000, date: '01 Mars 2026', statut: 'PAYE', methode: 'Tmoney' },
    { id: 'TR002', membre: 'Kossi Agbo', montant: 50000, date: '02 Mars 2026', statut: 'PAYE', methode: 'Tmoney' },
    { id: 'TR003', membre: 'Jean Kouassi', montant: 50000, date: '03 Mars 2026', statut: 'PAYE', methode: 'Tmoney' },
    { id: 'TR004', membre: 'Marie Adjoua', montant: 50000, date: 'En attente', statut: 'EN_ATTENTE', methode: 'Tmoney' },
    { id: 'TR005', membre: 'Pierre Mensah', montant: 50000, date: 'En attente', statut: 'EN_ATTENTE', methode: 'Tmoney' },
  ],
};

export default function TontineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('APERCU'); // APERCU, MEMBRES, TOURS, TRANSACTIONS
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PAYE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'TERMINE': return 'bg-blue-100 text-blue-800';
      case 'EN_COURS': return 'bg-purple-100 text-purple-800';
      case 'A_VENIR': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'PAYE': return 'Payé';
      case 'EN_ATTENTE': return 'En attente';
      case 'TERMINE': return 'Terminé';
      case 'EN_COURS': return 'En cours';
      case 'A_VENIR': return 'À venir';
      default: return statut;
    }
  };

  const tabs = [
    { id: 'APERCU', label: 'Aperçu', icon: TrendingUp },
    { id: 'MEMBRES', label: 'Membres', icon: Users },
    { id: 'TOURS', label: 'Tours', icon: Calendar },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Link
          href="/tontines"
          className="p-2 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{tontineDetail.nom}</h1>
          <p className="text-gray-700 font-medium">{tontineDetail.description}</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="p-2 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
          title="Copier le lien"
        >
          {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-700" />}
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="p-2 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
          title="Inviter des membres"
        >
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Carte principale */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-200 font-medium">Montant collecté</p>
            <p className="text-3xl font-bold">{tontineDetail.montantCollecte.toLocaleString()} FCFA</p>
            <p className="text-blue-200 text-sm mt-1">
              sur {tontineDetail.montantTotal.toLocaleString()} FCFA
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 font-medium">Tour actuel</p>
            <p className="text-3xl font-bold">{tontineDetail.tourActuel}/{tontineDetail.nombreTours}</p>
          </div>
          <div>
            <p className="text-blue-200 font-medium">Prochaine cotisation</p>
            <p className="text-lg font-bold">{tontineDetail.prochaineCotisation}</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2"
            style={{ width: `${(tontineDetail.montantCollecte / tontineDetail.montantTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      {activeTab === 'APERCU' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Informations générales</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Montant de cotisation</span>
                <span className="font-bold text-gray-900">{tontineDetail.montant.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Fréquence</span>
                <span className="font-bold text-gray-900">{tontineDetail.frequence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Nombre de membres</span>
                <span className="font-bold text-gray-900">{tontineDetail.nombreMembres}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Mode de rotation</span>
                <span className="font-bold text-gray-900">{tontineDetail.modeRotation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Méthode de paiement</span>
                <span className="font-bold text-gray-900">{tontineDetail.methodePaiement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Créée le</span>
                <span className="font-bold text-gray-900">{tontineDetail.dateCreation}</span>
              </div>
            </div>
          </div>

          {/* Créateur */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Créateur de la tontine</h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">
                  {tontineDetail.createur.nom.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{tontineDetail.createur.nom}</p>
                <p className="text-sm text-gray-700 font-medium">{tontineDetail.createur.telephone}</p>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vérifié (Niveau 2)
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MEMBRES' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Membres ({tontineDetail.membres.length})</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm">
              <UserPlus className="h-4 w-4" />
              Inviter
            </button>
          </div>
          <div className="space-y-3">
            {tontineDetail.membres.map((membre) => (
              <div key={membre.id} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-bold text-gray-700">{membre.nom.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{membre.nom}</p>
                  <p className="text-sm text-gray-700 font-medium">{membre.telephone}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  membre.statut === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {membre.statut}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Réputation</p>
                  <p className="text-sm text-green-600 font-bold">{membre.reputation}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'TOURS' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Tours de collecte</h3>
          <div className="space-y-3">
            {tontineDetail.tours.map((tour) => (
              <div key={tour.id} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">{tour.numero}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">Tour {tour.numero}</p>
                  <p className="text-sm text-gray-700 font-medium">Bénéficiaire : {tour.beneficiaire}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{tour.montant.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-700 font-medium">{tour.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(tour.statut)}`}>
                  {getStatutLabel(tour.statut)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Transactions récentes</h3>
          <div className="space-y-3">
            {tontineDetail.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{transaction.membre}</p>
                  <p className="text-sm text-gray-700 font-medium">{transaction.methode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{transaction.montant.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-700 font-medium">{transaction.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(transaction.statut)}`}>
                  {getStatutLabel(transaction.statut)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Inviter des membres</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-700 font-medium mb-4">
              Partagez ce code avec vos amis pour qu'ils rejoignent la tontine
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center mb-4">
              <p className="text-2xl font-bold text-blue-600">TNT-001-XYZ</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copié !' : 'Copier le code'}
            </button>
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-2 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}