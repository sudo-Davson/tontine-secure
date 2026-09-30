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
  AlertCircle,
  TrendingUp,
  Copy,
  Share2,
  UserPlus,
  History,
  Loader2,
  Trash2,
  Wallet,
  Play
} from 'lucide-react';
import ContactPicker from '../../../../components/shared/ContactPicker';

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
    retireLe: string | null;
    raisonRetrait: string | null;
    montantCotise: number;
    montantPenalite: number;
    montantRembourse: number;
    pourcentagePenalite: number;
    statutRemboursement: string;
    rembourseLe: string | null;
    reputation: number;
    toursRecus: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      reputation: number;
      kycLevel: number;
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
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string; montantCotise: number } | null>(null);
  const [removeRaison, setRemoveRaison] = useState('');
  const [removeType, setRemoveType] = useState('VOLONTAIRE');
  const [isRemoving, setIsRemoving] = useState(false);
  const [copied, setCopied] = useState(false);

  // États pour l'ajout de membre
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // États pour le remboursement
  const [showRembourseModal, setShowRembourseModal] = useState(false);
  const [membreToRembourse, setMembreToRembourse] = useState<any>(null);
  const [rembourseMethode, setRembourseMethode] = useState('TMONEY');
  const [rembourseTelephone, setRembourseTelephone] = useState('');
  const [rembourseNote, setRembourseNote] = useState('');
  const [isRemboursing, setIsRemboursing] = useState(false);

  // États pour les cotisations
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [cotisationToPayer, setCotisationToPayer] = useState<any>(null);
  const [payerMethode, setPayerMethode] = useState('TMONEY');
  const [payerTelephone, setPayerTelephone] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // États pour démarrer la tontine
  const [showDemarrerModal, setShowDemarrerModal] = useState(false);
  const [isDemarrant, setIsDemarrant] = useState(false);

  // ============================================
  // CHARGER LA TONTINE
  // ============================================
  useEffect(() => {
    fetchTontine();
  }, [tontineId]);

  const fetchTontine = async (retry = 0) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tontines/${tontineId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setTontine(data.tontine);
      } else {
        if (retry < 2) {
          await new Promise((r) => setTimeout(r, 2000));
          return fetchTontine(retry + 1);
        }
        toast.error(data.error || 'Tontine non trouvée');
        router.push('/tontines');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (retry < 2) {
        await new Promise((r) => setTimeout(r, 2000));
        return fetchTontine(retry + 1);
      }
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
  // AJOUTER UN MEMBRE
  // ============================================
  const handleAddMember = async () => {
    if (!inviteEmail && !invitePhone) {
      toast.error('Entrez un email ou un téléphone');
      return;
    }

    try {
      setIsAddingMember(true);

      const response = await fetch(`/api/tontines/${tontineId}/membres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail || undefined,
          phone: invitePhone || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Membre ajouté avec succès !');
        setShowInviteModal(false);
        setInviteEmail('');
        setInvitePhone('');
        fetchTontine();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsAddingMember(false);
    }
  };

  // ============================================
  // OUVRIR LA MODAL DE RETRAIT
  // ============================================
  const openRemoveModal = (userId: string, name: string, montantCotise: number) => {
    setMemberToRemove({ userId, name, montantCotise });
    setRemoveRaison("Retiré par l'admin");
    setRemoveType('VOLONTAIRE');
    setShowRemoveModal(true);
  };

  // ============================================
  // CONFIRMER LE RETRAIT
  // ============================================
  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    try {
      setIsRemoving(true);

      const response = await fetch(`/api/tontines/${tontineId}/membres/${memberToRemove.userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          raison: removeRaison,
          typeRetrait: removeType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.calcul && data.calcul.montantCotise > 0) {
          toast.success(
            `Membre retiré. Cotisé : ${data.calcul.montantCotise.toLocaleString()} FCFA | Pénalité : ${data.calcul.montantPenalite.toLocaleString()} FCFA (${data.calcul.pourcentagePenalite}%) | Remboursé : ${data.calcul.montantRembourse.toLocaleString()} FCFA`,
            { duration: 6000 }
          );
        } else {
          toast.success('Membre retiré avec succès');
        }
        setShowRemoveModal(false);
        setMemberToRemove(null);
        fetchTontine();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsRemoving(false);
    }
  };

  // ============================================
  // REMBOURSER UN MEMBRE
  // ============================================
  const openRembourseModal = (membre: any) => {
    setMembreToRembourse(membre);
    setRembourseMethode('TMONEY');
    setRembourseTelephone(membre.user.phoneNumber || '');
    setRembourseNote('');
    setShowRembourseModal(true);
  };

  const handleConfirmRembourse = async () => {
    if (!membreToRembourse) return;

    if (!rembourseTelephone) {
      toast.error('Entrez le numéro de téléphone');
      return;
    }

    try {
      setIsRemboursing(true);

      const response = await fetch(
        `/api/tontines/${tontineId}/membres/${membreToRembourse.userId}/rembourser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            methode: rembourseMethode,
            telephone: rembourseTelephone,
            note: rembourseNote,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, { duration: 5000 });
        setShowRembourseModal(false);
        setMembreToRembourse(null);
        fetchTontine();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsRemboursing(false);
    }
  };

  // ============================================
  // PAYER UNE COTISATION
  // ============================================
  const openPayerModal = (cotisation: any) => {
    setCotisationToPayer(cotisation);
    setPayerMethode(tontine?.methodePaiement || 'TMONEY');
    setPayerTelephone('');
    setShowPayerModal(true);
  };

  const handleConfirmPayer = async () => {
    if (!cotisationToPayer) return;

    if (!payerTelephone) {
      toast.error('Entrez le numéro de téléphone');
      return;
    }

    try {
      setIsPaying(true);

      const response = await fetch('/api/cotisations/payer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cotisationId: cotisationToPayer.id,
          methode: payerMethode,
          telephone: payerTelephone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, { duration: 5000 });
        setShowPayerModal(false);
        setCotisationToPayer(null);
        fetchTontine();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsPaying(false);
    }
  };

  // ============================================
  // DÉMARRER LA TONTINE
  // ============================================
  const handleDemarrer = async () => {
    try {
      setIsDemarrant(true);

      const response = await fetch(`/api/tontines/${tontineId}/demarrer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message, { duration: 6000 });
        setShowDemarrerModal(false);
        fetchTontine();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsDemarrant(false);
    }
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

  const membresActifs = tontine.membres.filter((m) => m.statut !== 'RETIRE');
  const membresRetires = tontine.membres.filter((m) => m.statut === 'RETIRE');

  const tabs = [
    { id: 'APERCU', label: 'Aperçu', icon: TrendingUp },
    { id: 'MEMBRES', label: 'Membres', icon: Users },
    { id: 'TOURS', label: 'Tours', icon: Calendar },
    { id: 'COTISATIONS', label: 'Cotisations', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Bouton Démarrer (si EN_ATTENTE et admin) */}
      {tontine.statut === 'EN_ATTENTE' && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Play className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Démarrer la tontine</h2>
                <p className="text-green-100 text-sm">
                  {membresActifs.length}/{tontine.nombreMembres} membres • Prêt à démarrer
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDemarrerModal(true)}
              disabled={membresActifs.length < 2}
              className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 flex-shrink-0 ${
                membresActifs.length < 2
                  ? 'bg-white/30 text-white/70 cursor-not-allowed'
                  : 'bg-white text-green-600 hover:bg-green-50'
              }`}
            >
              <Play className="h-5 w-5" />
              {membresActifs.length < 2 ? 'Minimum 2 membres requis' : 'Démarrer maintenant'}
            </button>
          </div>
        </div>
      )}

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
                  {membresActifs.length}/{tontine.nombreMembres}
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
              Membres ({membresActifs.length}/{tontine.nombreMembres})
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Inviter
            </button>
          </div>

          {/* Membres actifs */}
          <div className="space-y-3">
            {membresActifs.map((membre) => (
              <div
                key={membre.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    {membre.user.firstName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {membre.user.firstName} {membre.user.lastName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                    {membre.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">Réputation</p>
                    <p className="text-sm text-green-600 font-bold">{membre.user.reputation}%</p>
                  </div>
                  {membre.role !== 'ADMIN' && tontine.statut === 'EN_ATTENTE' && (
                    <button
                      onClick={() =>
                        openRemoveModal(
                          membre.userId,
                          `${membre.user.firstName} ${membre.user.lastName}`,
                          membre.montantCotise || 0
                        )
                      }
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Retirer ce membre"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Membres retirés */}
          {membresRetires.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Membres retirés ({membresRetires.length})
              </h4>
              <div className="space-y-3">
                {membresRetires.map((membre) => (
                  <div
                    key={membre.id}
                    className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-red-700 dark:text-red-300 text-sm">
                          {membre.user.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate text-sm">
                          {membre.user.firstName} {membre.user.lastName}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-400 truncate">
                          {membre.user.email}
                        </p>
                        {membre.retireLe && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-0.5">
                            Retiré le {formatDate(membre.retireLe)}
                          </p>
                        )}
                        {membre.raisonRetrait && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                            {membre.raisonRetrait}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex-shrink-0">
                        RETIRÉ
                      </span>
                    </div>

                    {membre.montantCotise > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            💰 Cotisé
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {membre.montantCotise.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            ⚠️ Pénalité ({membre.pourcentagePenalite}%)
                          </span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            -{membre.montantPenalite.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-1.5 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-green-700 dark:text-green-400 font-bold">
                            ✅ À rembourser
                          </span>
                          <span className="font-bold text-green-700 dark:text-green-400">
                            {membre.montantRembourse.toLocaleString()} FCFA
                          </span>
                        </div>

                        {membre.statutRemboursement === 'EN_ATTENTE' && (
                          <button
                            onClick={() => openRembourseModal(membre)}
                            className="w-full mt-2 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-xs flex items-center justify-center gap-2"
                          >
                            <Wallet className="h-4 w-4" />
                            Rembourser {membre.montantRembourse.toLocaleString()} FCFA
                          </button>
                        )}
                        {membre.statutRemboursement === 'REMBOURSE' && (
                          <div className="text-center pt-1">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                              ✅ Remboursé
                            </p>
                            {membre.rembourseLe && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                le {formatDate(membre.rembourseLe)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">{tour.numero}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white">Tour {tour.numero}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Bénéficiaire : {tour.beneficiaireId ? 'Défini' : 'En attente'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {tour.montant.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formatDate(tour.dateDebut)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${getStatutColor(tour.statut)}`}>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Cotisations ({tontine.cotisations.length})
            </h3>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Payées : {tontine.cotisations.filter((c) => c.statut === 'PAYEE').length}/{tontine.cotisations.length}
            </div>
          </div>

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
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-2 border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    cot.statut === 'PAYEE' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      cot.statut === 'PAYEE' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {cot.user.firstName} {cot.user.lastName}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Échéance : {formatDate(cot.dateEcheance)}
                    </p>
                    {cot.methodePaiement && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Payé via {cot.methodePaiement === 'TMONEY' ? 'Tmoney' : 'Flooz'}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {cot.montant.toLocaleString()} FCFA
                    </p>
                    {cot.datePaiement && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Payé le {formatDate(cot.datePaiement)}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${getStatutColor(cot.statut)}`}>
                    {getStatutLabel(cot.statut)}
                  </span>
                  {cot.statut !== 'PAYEE' && (
                    <button
                      onClick={() => openPayerModal(cot)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm flex items-center gap-2 flex-shrink-0"
                    >
                      <Wallet className="h-4 w-4" />
                      Payer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== MODAL : DÉMARRER LA TONTINE ========== */}
      {showDemarrerModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Démarrer la tontine
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 dark:text-green-200 font-bold mb-2">
                ✅ Prêt à démarrer
              </p>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>• {membresActifs.length} membre(s) actif(s)</li>
                <li>• {tontine.nombreTours} tour(s)</li>
                <li>• {membresActifs.length * tontine.nombreTours} cotisation(s) seront créées</li>
                <li>• Montant par tour : {(tontine.montant * membresActifs.length).toLocaleString()} FCFA</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-bold">
                ⚠️ Une fois démarrée, la tontine ne peut plus être modifiée.
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-6">
              Voulez-vous vraiment démarrer cette tontine ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDemarrerModal(false)}
                disabled={isDemarrant}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDemarrer}
                disabled={isDemarrant}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isDemarrant
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isDemarrant ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Démarrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL : RETIRER UN MEMBRE ========== */}
      {showRemoveModal && memberToRemove && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Retirer un membre
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {memberToRemove.name}
                </p>
              </div>
            </div>

            {memberToRemove.montantCotise > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Ce membre a cotisé {memberToRemove.montantCotise.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Une pénalité sera appliquée selon le type de retrait.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Type de retrait
                </label>
                <select
                  value={removeType}
                  onChange={(e) => setRemoveType(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                >
                  <option value="VOLONTAIRE">Volontaire (20%)</option>
                  <option value="RAISON_VALABLE">Raison valable (5%)</option>
                  <option value="EXCLUSION">Exclusion (50%)</option>
                  <option value="AMIABLE">À l'amiable (0%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Raison
                </label>
                <textarea
                  value={removeRaison}
                  onChange={(e) => setRemoveRaison(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                  placeholder="Raison du retrait..."
                />
              </div>

              {memberToRemove.montantCotise > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-1 text-xs">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Aperçu du calcul :</p>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cotisé</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {memberToRemove.montantCotise.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600 font-medium">Pénalité</span>
                    <span className="font-bold text-red-600">
                      -{removeType === 'VOLONTAIRE' ? '20' :
                        removeType === 'RAISON_VALABLE' ? '5' :
                        removeType === 'EXCLUSION' ? '50' : '0'}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setMemberToRemove(null);
                }}
                disabled={isRemoving}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isRemoving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Retrait...
                  </>
                ) : (
                  'Confirmer le retrait'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL : REMBOURSER ========== */}
      {showRembourseModal && membreToRembourse && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Rembourser un membre
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {membreToRembourse.user.firstName} {membreToRembourse.user.lastName}
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 dark:text-green-200 font-bold">
                💰 Montant à rembourser : {membreToRembourse.montantRembourse.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Effectuez le transfert manuellement puis confirmez.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Méthode
                </label>
                <select
                  value={rembourseMethode}
                  onChange={(e) => setRembourseMethode(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                >
                  <option value="TMONEY">Tmoney (Mixx by Yas)</option>
                  <option value="FLOOZ">Flooz (Moov Money)</option>
                </select>
              </div>

              <ContactPicker
                value={rembourseTelephone}
                onChange={setRembourseTelephone}
                label="Numéro de téléphone"
                placeholder="+228 XX XX XX XX"
                required
              />

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Note (optionnel)
                </label>
                <input
                  type="text"
                  value={rembourseNote}
                  onChange={(e) => setRembourseNote(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                  placeholder="Ex: Transfert Tmoney effectué"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRembourseModal(false);
                  setMembreToRembourse(null);
                }}
                disabled={isRemboursing}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRembourse}
                disabled={isRemboursing}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isRemboursing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRemboursing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL : PAYER UNE COTISATION ========== */}
      {showPayerModal && cotisationToPayer && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Payer une cotisation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cotisationToPayer.user.firstName} {cotisationToPayer.user.lastName}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-bold">
                💰 Montant à payer : {cotisationToPayer.montant.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                ⓘ Paiement simulé. Les vraies APIs Tmoney/Flooz seront intégrées plus tard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Méthode de paiement
                </label>
                <select
                  value={payerMethode}
                  onChange={(e) => setPayerMethode(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                >
                  <option value="TMONEY">Tmoney (Mixx by Yas)</option>
                  <option value="FLOOZ">Flooz (Moov Money)</option>
                </select>
              </div>

              <ContactPicker
                value={payerTelephone}
                onChange={setPayerTelephone}
                label="Numéro de téléphone"
                placeholder="+228 XX XX XX XX"
                required
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPayerModal(false);
                  setCotisationToPayer(null);
                }}
                disabled={isPaying}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPayer}
                disabled={isPaying}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isPaying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Paiement...
                  </>
                ) : (
                  'Payer maintenant'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL : INVITER ========== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Inviter un membre</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInvitePhone('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
              Entrez l'email ou le téléphone d'un utilisateur existant
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                OU
              </div>

              <ContactPicker
                value={invitePhone}
                onChange={setInvitePhone}
                label="Téléphone"
                placeholder="+228 XX XX XX XX"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInvitePhone('');
                }}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleAddMember}
                disabled={isAddingMember || (!inviteEmail && !invitePhone)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  isAddingMember || (!inviteEmail && !invitePhone)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAddingMember ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  'Ajouter'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}