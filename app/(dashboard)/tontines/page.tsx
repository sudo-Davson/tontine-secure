// app/(dashboard)/tontines/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Users, 
  PlusCircle, 
  ChevronRight,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Wallet,
  TrendingUp,
  Loader2
} from 'lucide-react';

// Types
interface Tontine {
  id: string;
  nom: string;
  description: string;
  montant: number;
  frequence: string;
  nombreMembres: number;
  nombreTours: number;
  tourActuel: number;
  montantCollecte: number;
  montantTotal: number;
  modeRotation: string;
  statut: string;
  methodePaiement: string;
  createdAt: string;
  createur: {
    id: string;
    firstName: string;
    lastName: string;
  };
  membres: Array<{
    id: string;
    userId: string;
    role: string;
    statut: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    membres: number;
  };
}

export default function MesTontinesPage() {
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUTES');
  const [filterFrequence, setFilterFrequence] = useState('TOUTES');

  // ============================================
  // CHARGER LES TONTINES
  // ============================================
  useEffect(() => {
    fetchTontines();
  }, []);

  const fetchTontines = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tontines', {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setTontines(data.tontines);
      } else {
        toast.error(data.error || 'Erreur de chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FILTRER
  // ============================================
  const tontinesFiltrees = tontines.filter((tontine) => {
    const matchSearch =
      tontine.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tontine.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'TOUTES' || tontine.statut === filterStatut;
    const matchFrequence = filterFrequence === 'TOUTES' || tontine.frequence === filterFrequence;
    return matchSearch && matchStatut && matchFrequence;
  });

  // ============================================
  // STATISTIQUES
  // ============================================
  const stats = {
    total: tontines.length,
    actives: tontines.filter((t) => t.statut === 'ACTIVE').length,
    totalCotise: tontines.reduce((sum, t) => sum + t.montantCollecte, 0),
    totalMembres: tontines.reduce((sum, t) => sum + t._count.membres, 0),
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'TERMINEE': return 'bg-gray-100 text-gray-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'ACTIVE': return 'Active';
      case 'EN_ATTENTE': return 'En attente';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  };

  const getFrequenceLabel = (frequence: string) => {
    switch (frequence) {
      case 'JOURNALIERE': return 'Journalière';
      case 'HEBDOMADAIRE': return 'Hebdomadaire';
      case 'BIHEBDOMADAIRE': return 'Bi-hebdomadaire';
      case 'MENSUELLE': return 'Mensuelle';
      case 'BIMENSUELLE': return 'Bimensuelle';
      case 'TRIMESTRIELLE': return 'Trimestrielle';
      case 'SEMESTRIELLE': return 'Semestrielle';
      case 'ANNUELLE': return 'Annuelle';
      case 'PERSONNALISEE': return 'Personnalisée';
      default: return frequence;
    }
  };

  const getModeRotationLabel = (mode: string) => {
    switch (mode) {
      case 'ALEATOIRE': return 'Aléatoire';
      case 'ORDRE_FIXE': return 'Ordre fixe';
      case 'ENCHERES': return 'Enchères';
      default: return mode;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Tontines</h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Tontines actives</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.actives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Total cotisé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCotise.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Membres total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembres}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Tontines totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
              placeholder="Rechercher une tontine..."
            />
          </div>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white font-medium bg-white dark:bg-gray-700"
          >
            <option value="TOUTES">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="TERMINEE">Terminées</option>
          </select>

          <select
            value={filterFrequence}
            onChange={(e) => setFilterFrequence(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white font-medium bg-white dark:bg-gray-700"
          >
            <option value="TOUTES">Toutes les fréquences</option>
            <option value="JOURNALIERE">Journalière</option>
            <option value="HEBDOMADAIRE">Hebdomadaire</option>
            <option value="MENSUELLE">Mensuelle</option>
            <option value="TRIMESTRIELLE">Trimestrielle</option>
          </select>
        </div>
      </div>

      {/* Liste des tontines */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-bold">Chargement...</p>
        </div>
      ) : tontinesFiltrees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {tontines.length === 0 ? 'Aucune tontine' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
            {tontines.length === 0
              ? 'Créez votre première tontine pour commencer à épargner ensemble'
              : 'Aucune tontine ne correspond à vos filtres'}
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
        <div className="space-y-4">
          {tontinesFiltrees.map((tontine) => (
            <Link
              key={tontine.id}
              href={`/tontines/${tontine.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {tontine.nom}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {tontine.description || 'Aucune description'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Créée par {tontine.createur.firstName} {tontine.createur.lastName} •{' '}
                        {formatDate(tontine.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(tontine.statut)}`}>
                    {getStatutLabel(tontine.statut)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Montant</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {tontine.montant.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Fréquence</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getFrequenceLabel(tontine.frequence)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Membres</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {tontine._count.membres}/{tontine.nombreMembres}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Tour actuel</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {tontine.tourActuel}/{tontine.nombreTours}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Mode : {getModeRotationLabel(tontine.modeRotation)}
                    </span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Paiement : {tontine.methodePaiement === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}