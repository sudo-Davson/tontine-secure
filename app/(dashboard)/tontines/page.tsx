// app/(dashboard)/tontines/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  PlusCircle, 
  ChevronRight,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Wallet,
  TrendingUp
} from 'lucide-react';

// Données simulées (à remplacer par les données du backend)
const tontinesSimulees = [
  {
    id: 'TNT-001',
    nom: 'Tontine des Amis',
    description: 'Tontine mensuelle entre amis pour épargner ensemble',
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
  },
  {
    id: 'TNT-002',
    nom: 'Tontine Famille',
    description: 'Tontine familiale pour les projets communs',
    montant: 25000,
    frequence: 'HEBDOMADAIRE',
    nombreMembres: 8,
    nombreTours: 8,
    tourActuel: 5,
    montantCollecte: 1000000,
    montantTotal: 2000000,
    modeRotation: 'ORDRE_FIXE',
    statut: 'ACTIVE',
    prochaineCotisation: '20 Mars 2026',
    methodePaiement: 'FLOOZ',
    dateCreation: '01 Février 2026',
  },
  {
    id: 'TNT-003',
    nom: 'Tontine Commerce',
    description: 'Tontine pour financer nos activités commerciales',
    montant: 100000,
    frequence: 'MENSUEL',
    nombreMembres: 12,
    nombreTours: 12,
    tourActuel: 0,
    montantCollecte: 0,
    montantTotal: 12000000,
    modeRotation: 'ENCHERES',
    statut: 'EN_ATTENTE',
    prochaineCotisation: 'En attente de démarrage',
    methodePaiement: 'TMONEY',
    dateCreation: '01 Mars 2026',
  },
];

export default function MesTontinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUTES');
  const [filterFrequence, setFilterFrequence] = useState('TOUTES');

  // Filtrer les tontines
  const tontinesFiltrees = tontinesSimulees.filter((tontine) => {
    const matchSearch = tontine.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tontine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'TOUTES' || tontine.statut === filterStatut;
    const matchFrequence = filterFrequence === 'TOUTES' || tontine.frequence === filterFrequence;
    return matchSearch && matchStatut && matchFrequence;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINEE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'ACTIVE':
        return 'Active';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'TERMINEE':
        return 'Terminée';
      default:
        return statut;
    }
  };

  const getFrequenceLabel = (frequence: string) => {
    switch (frequence) {
      case 'HEBDOMADAIRE':
        return 'Hebdomadaire';
      case 'BIHEBDOMADAIRE':
        return 'Bi-hebdomadaire';
      case 'MENSUEL':
        return 'Mensuel';
      case 'TRIMESTRIEL':
        return 'Trimestriel';
      default:
        return frequence;
    }
  };

  const getModeRotationLabel = (mode: string) => {
    switch (mode) {
      case 'ALEATOIRE':
        return 'Aléatoire';
      case 'ORDRE_FIXE':
        return 'Ordre fixe';
      case 'ENCHERES':
        return 'Enchères';
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tontines</h1>
          <p className="text-gray-700 font-medium mt-1">
            Gérez et suivez toutes vos tontines
          </p>
        </div>
        <Link
          href="/tontines/creer"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          <PlusCircle className="h-5 w-5" />
          Créer une tontine
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Tontines actives</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Total cotisé</p>
              <p className="text-2xl font-bold text-gray-900">2,500,000 FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Membres total</p>
              <p className="text-2xl font-bold text-gray-900">30</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Tours complétés</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white font-medium"
              placeholder="Rechercher une tontine..."
              style={{ color: '#000000' }}
            />
          </div>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium bg-white"
            style={{ color: '#000000' }}
          >
            <option value="TOUTES">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="TERMINEE">Terminées</option>
          </select>

          <select
            value={filterFrequence}
            onChange={(e) => setFilterFrequence(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium bg-white"
            style={{ color: '#000000' }}
          >
            <option value="TOUTES">Toutes les fréquences</option>
            <option value="HEBDOMADAIRE">Hebdomadaire</option>
            <option value="MENSUEL">Mensuel</option>
            <option value="TRIMESTRIEL">Trimestriel</option>
          </select>
        </div>
      </div>

      {/* Liste des tontines */}
      <div className="space-y-4">
        {tontinesFiltrees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune tontine trouvée</h3>
            <p className="text-gray-700 font-medium mb-4">
              Créez votre première tontine pour commencer à épargner ensemble
            </p>
            <Link
              href="/tontines/creer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              <PlusCircle className="h-5 w-5" />
              Créer une tontine
            </Link>
          </div>
        ) : (
          tontinesFiltrees.map((tontine) => (
            <Link
              key={tontine.id}
              href={`/tontines/${tontine.id}`}
              className="block bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-400 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{tontine.nom}</h3>
                      <p className="text-sm text-gray-700 font-medium">{tontine.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(tontine.statut)}`}>
                    {getStatutLabel(tontine.statut)}
                  </span>
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
                    <p className="text-sm font-bold text-gray-900">{tontine.nombreMembres}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Tour actuel</p>
                    <p className="text-sm font-bold text-gray-900">{tontine.tourActuel}/{tontine.nombreTours}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-700">
                      Mode : {getModeRotationLabel(tontine.modeRotation)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      Paiement : {tontine.methodePaiement === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}