// app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
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
  Star,
  Loader2,
  DollarSign
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
  statut: string;
  methodePaiement: string;
  createdAt: string;
  membres: Array<{
    id: string;
    userId: string;
    role: string;
    statut: string;
  }>;
  _count: {
    membres: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // CHARGER LES DONNÉES
  // ============================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Charger les tontines
      const tontinesResponse = await fetch('/api/tontines', {
        credentials: 'include',
      });

      const tontinesData = await tontinesResponse.json();

      if (tontinesData.success) {
        setTontines(tontinesData.tontines);
      } else {
        toast.error(tontinesData.error || 'Erreur de chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // STATISTIQUES
  // ============================================
  const stats = {
    tontinesActives: tontines.filter((t) => t.statut === 'ACTIVE').length,
    tontinesEnAttente: tontines.filter((t) => t.statut === 'EN_ATTENTE').length,
    totalCotise: tontines.reduce((sum, t) => sum + t.montantCollecte, 0),
    totalMembres: tontines.reduce((sum, t) => sum + t._count.membres, 0),
    totalTontines: tontines.length,
  };

  // Prochaine cotisation (la tontine active la plus proche)
  const prochaineTontine = tontines
    .filter((t) => t.statut === 'ACTIVE')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  // Tontines récentes (5 dernières)
  const tontinesRecentes = tontines.slice(0, 3);

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

  const getFrequenceLabel = (freq: string) => {
    switch (freq) {
      case 'JOURNALIERE': return 'jour';
      case 'HEBDOMADAIRE': return 'semaine';
      case 'BIHEBDOMADAIRE': return '2 semaines';
      case 'MENSUELLE': return 'mois';
      case 'BIMENSUELLE': return '2 mois';
      case 'TRIMESTRIELLE': return 'trimestre';
      case 'SEMESTRIELLE': return 'semestre';
      case 'ANNUELLE': return 'an';
      case 'PERSONNALISEE': return 'période';
      default: return freq;
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-bold">Chargement...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">
            Voici un aperçu de vos tontines
          </p>
        </div>
        <Link
          href="/tontines/creer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          <PlusCircle className="h-5 w-5" />
          Nouvelle tontine
        </Link>
      </div>

      {/* Statut de vérification */}
      <div className={`rounded-xl p-4 text-white ${
        (user?.kycLevel || 0) >= 2
          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
          : 'bg-gradient-to-r from-yellow-500 to-orange-500'
      }`}>
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <p className="font-bold">
              Niveau de vérification : {user?.kycLevel || 0}/3
            </p>
            <p className="text-sm opacity-90">
              {(user?.kycLevel || 0) >= 2
                ? 'Votre identité est vérifiée. Vous pouvez participer aux tontines.'
                : 'Complétez le KYC Niveau 2 pour créer des tontines.'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Tontines</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTontines}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Actives</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tontinesActives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Membres</p>
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
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total cotisé</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.totalCotise.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mes tontines */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Mes tontines ({tontines.length})
          </h2>
          <Link
            href="/tontines"
            className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {tontinesRecentes.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Aucune tontine
            </h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
              Créez votre première tontine pour commencer
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
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {tontinesRecentes.map((tontine) => (
              <Link
                key={tontine.id}
                href={`/tontines/${tontine.id}`}
                className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{tontine.nom}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {tontine.montant.toLocaleString()} FCFA / {getFrequenceLabel(tontine.frequence)} • {tontine._count.membres} membres
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${getStatutColor(tontine.statut)}`}>
                      {getStatutLabel(tontine.statut)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Tour {tontine.tourActuel}/{tontine.nombreTours}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {tontine.montantCollecte.toLocaleString()} / {tontine.montantTotal.toLocaleString()} FCFA
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/tontines/creer"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center hover:border-blue-500 transition-colors"
        >
          <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">Créer une tontine</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
            Démarrez une nouvelle tontine avec vos proches
          </p>
        </Link>

        <Link
          href="/verification/niveau-3"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center hover:border-purple-500 transition-colors"
        >
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 dark:text-white">Vérification renforcée</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
            Augmentez votre niveau de confiance
          </p>
        </Link>
      </div>
    </div>
  );
}