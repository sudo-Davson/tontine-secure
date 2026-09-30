// app/(dashboard)/tontines/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
  Loader2
} from 'lucide-react';

// Types
interface TontineDetail {
  id: string;
  nom: string;
  description: string;
  type: string;
  montant: number;
  frequence: string;
  frequenceConfig: string;
  nombreMembres: number;
  nombreTours: number;
  tourActuel: number;
  montantCollecte: number;
  montantTotal: number;
  modeRotation: string;
  statut: string;
  methodePaiement: string;
  numeroCollecte: string | null;
  reglesSecurite: string;
  dateDebut: string | null;
  dateFin: string | null;
  createdAt: string;
  createur: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  membres: Array<{
    id: string;
    userId: string;
    role: string;
    statut: string;
    reputation: number;
    toursRecus: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      reputation: number;
    };
  }>;
  tours: Array<{
    id: string;
    numero: number;
    beneficiaireId: string | null;
    montant: number;
    statut: string;
    dateDebut: string | null;
    dateFin: string | null;
    datePaiement: string | null;
  }>;
  cotisations: Array<{
    id: string;
    montant: number;
    statut: string;
    dateEcheance: string;
    datePaiement: string | null;
    methodePaiement: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function TontineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tontineId = params.id as string;

  const [tontine, setTontine] = useState<TontineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('APERCU');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ============================================
  // CHARGER LA TONTINE
  // ============================================
  useEffect(() => {
    fetchTontine();
  }, [tontineId]);

  const fetchTontine = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tontines/${tontineId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setTontine(data.tontine);
      } else {
        toast.error(data.error || 'Tontine non trouvée');
        router.push('/tontines');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
      router.push('/tontines');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // COPIER LE CODE D'INVITATION
  // ============================================
  const handleCopyCode = () => {
    const code = `${tontine?.id.substring(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PAYEE':
      case 'TERMINE':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE':
      case 'A_VENIR':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_RETARD':
      case 'ANNULEE':
        return 'bg-red-100 text-red-800';
      case 'EN_COURS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'PAYEE': return 'Payée';
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_RETARD': return 'En retard';
      case 'ANNULEE': return 'Annulée';
      case 'TERMINE': return 'Terminé';
      case 'EN_COURS': return 'En cours';
      case 'A_VENIR': return 'À venir';
      case 'ACTIVE': return 'Active';
      case 'TERMINEE': return 'Terminée';
      default: return statut;
    }
  };

  const getFrequenceLabel = (freq: string) => {
    switch (freq) {
      case 'JOURNALIERE': return 'Journalière';
      case 'HEBDOMADAIRE': return 'Hebdomadaire';
      case 'BIHEBDOMADAIRE': return 'Bi-hebdomadaire';
      case 'MENSUELLE': return 'Mensuelle';
      case 'BIMENSUELLE': return 'Bimensuelle';
      case 'TRIMESTRIELLE': return 'Trimestrielle';
      case 'SEMESTRIELLE': return 'Semestrielle';
      case 'ANNUELLE': return 'Annuelle';
      case 'PERSONNALISEE': return 'Personnalisée';
      default: return freq;
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

  const formatDate = (date: string | null) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

  if (!tontine) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Tontine non trouvée
        </h2>
        <Link
          href="/tontines"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour aux tontines
        </Link>
      </div>
    );
  }

  const pourcentage = tontine.montantTotal > 0
    ? (tontine.montantCollecte / tontine.montantTotal) * 100
    : 0;

  const codeInvitation = tontine.id.substring(0, 8).toUpperCase();

  const tabs = [
    { id: 'APERCU', label: 'Aperçu', icon: TrendingUp },
    { id: 'MEMBRES', label: 'Membres', icon: Users },
    { id: 'TOURS', label: 'Tours', icon: Calendar },
    { id: 'COTISATIONS', label: 'Cotisations', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Link
          href="/tontines"
          className="p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tontine.nom}</h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {tontine.description || 'Aucune description'}
          </p>
        </div>
        <button
          onClick={handleCopyCode}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
          title="Copier le code d'invitation"
        >
          {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
          title="Inviter des membres"
        >
          <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Carte principale */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-blue-200 font-medium">Montant collecté</p>
            <p className="text-3xl font-bold">{tontine.montantCollecte.toLocaleString()} FCFA</p>
            <p className="text-blue-200 text-sm mt-1">
              sur {tontine.montantTotal.toLocaleString()} FCFA
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-200 font-medium">Tour actuel</p>
            <p className="text-3xl font-bold">{tontine.tourActuel}/{tontine.nombreTours}</p>
          </div>
          <div>
            <p className="text-blue-200 font-medium">Statut</p>
            <p className="text-lg font-bold">{getStatutLabel(tontine.statut)}</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${Math.min(pourcentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-2">
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
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== APERÇU ========== */}
      {activeTab === 'APERCU' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Informations générales
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Montant de cotisation</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {tontine.montant.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Fréquence</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {getFrequenceLabel(tontine.frequence)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Nombre de membres</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {tontine.membres.length}/{tontine.nombreMembres}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Mode de rotation</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {getModeRotationLabel(tontine.modeRotation)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Méthode de paiement</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {tontine.methodePaiement === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Créée le</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatDate(tontine.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Créateur */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Créateur de la tontine
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">
                  {tontine.createur.firstName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {tontine.createur.firstName} {tontine.createur.lastName}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {tontine.createur.email}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administrateur
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== MEMBRES ========== */}
      {activeTab === 'MEMBRES' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Membres ({tontine.membres.length}/{tontine.nombreMembres})
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Inviter
            </button>
          </div>
          <div className="space-y-3">
            {tontine.membres.map((membre) => (
              <div
                key={membre.id}
                className="flex items-center gap-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {membre.user.firstName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {membre.user.firstName} {membre.user.lastName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {membre.user.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    membre.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {membre.role}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Réputation</p>
                  <p className="text-sm text-green-600 font-bold">{membre.user.reputation}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== TOURS ========== */}
      {activeTab === 'TOURS' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Tours de collecte</h3>
          <div className="space-y-3">
            {tontine.tours.map((tour) => (
              <div
                key={tour.id}
                className="flex items-center gap-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">{tour.numero}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">Tour {tour.numero}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Bénéficiaire :{' '}
                    {tour.beneficiaireId ? 'Défini' : 'En attente'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {tour.montant.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formatDate(tour.dateDebut)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(tour.statut)}`}>
                  {getStatutLabel(tour.statut)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== COTISATIONS ========== */}
      {activeTab === 'COTISATIONS' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Cotisations récentes ({tontine.cotisations.length})
          </h3>
          {tontine.cotisations.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Aucune cotisation pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tontine.cotisations.map((cot) => (
                <div
                  key={cot.id}
                  className="flex items-center gap-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {cot.user.firstName} {cot.user.lastName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {cot.methodePaiement || 'Non défini'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {cot.montant.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {formatDate(cot.dateEcheance)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(cot.statut)}`}>
                    {getStatutLabel(cot.statut)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Inviter des membres</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
              Partagez ce code avec vos amis pour qu'ils rejoignent la tontine
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center mb-4">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {codeInvitation}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copié !' : 'Copier le code'}
            </button>
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-2 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}