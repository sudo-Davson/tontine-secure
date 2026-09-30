// app/(dashboard)/tontines/creer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import { tontineService, REGLES } from '../../../../lib/services/tontine-service';
import { 
  frequenceService, 
  FrequenceConfig,
  TypeFrequence,
  JourSemaine,
  SemaineDuMois 
} from '../../../../lib/services/frequence-service';
import { 
  Users, 
  Calendar, 
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  DollarSign,
  Smartphone,
  AlertCircle,
  Repeat,
  Shuffle,
  Trophy,
  Lock,
  Eye,
  EyeOff,
  Info,
  Loader2
} from 'lucide-react';

// ============================================
// CONSTANTES
// ============================================
const typesFrequence = [
  { id: 'JOURNALIERE', label: 'Journalière', description: 'Tous les jours' },
  { id: 'HEBDOMADAIRE', label: 'Hebdomadaire', description: 'Chaque semaine' },
  { id: 'BIHEBDOMADAIRE', label: 'Bi-hebdomadaire', description: 'Toutes les 2 semaines' },
  { id: 'MENSUELLE', label: 'Mensuelle', description: 'Chaque mois' },
  { id: 'BIMENSUELLE', label: 'Bimensuelle', description: 'Tous les 2 mois' },
  { id: 'TRIMESTRIELLE', label: 'Trimestrielle', description: 'Tous les 3 mois' },
  { id: 'SEMESTRIELLE', label: 'Semestrielle', description: 'Tous les 6 mois' },
  { id: 'ANNUELLE', label: 'Annuelle', description: 'Chaque année' },
  { id: 'PERSONNALISEE', label: 'Personnalisée', description: 'Intervalle personnalisé' },
];

const joursSemaine = [
  { id: 'LUNDI', label: 'Lundi' },
  { id: 'MARDI', label: 'Mardi' },
  { id: 'MERCREDI', label: 'Mercredi' },
  { id: 'JEUDI', label: 'Jeudi' },
  { id: 'VENDREDI', label: 'Vendredi' },
  { id: 'SAMEDI', label: 'Samedi' },
  { id: 'DIMANCHE', label: 'Dimanche' },
];

const semainesDuMois = [
  { id: 'PREMIERE', label: '1er' },
  { id: 'DEUXIEME', label: '2ème' },
  { id: 'TROISIEME', label: '3ème' },
  { id: 'QUATRIEME', label: '4ème' },
  { id: 'DERNIERE', label: 'Dernier' },
];

const modesRotation = [
  { id: 'ALEATOIRE', label: 'Aléatoire', description: 'L\'ordre des bénéficiaires est tiré au sort', icon: Shuffle },
  { id: 'ORDRE_FIXE', label: 'Ordre fixe', description: 'L\'ordre est défini à l\'avance', icon: Repeat },
  { id: 'ENCHERES', label: 'Enchères', description: 'Le membre qui propose le plus reçoit le tour', icon: Trophy },
];

const methodesPaiement = [
  { id: 'TMONEY', label: 'Tmoney (Mixx by Yas)', description: 'Paiement via Tmoney', couleur: 'bg-blue-600', icone: Smartphone },
  { id: 'FLOOZ', label: 'Flooz (Moov Money)', description: 'Paiement via Flooz', couleur: 'bg-yellow-500', icone: Smartphone },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function CreerTontinePage() {
  const router = useRouter();
  const { kycLevel, user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [canCreate, setCanCreate] = useState(true);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type: 'EPARGNE',
    montantCotisation: '',
    nombreMembres: '',
    modeRotation: 'ALEATOIRE',
    frequence: {
      type: 'MENSUELLE' as TypeFrequence,
      jourSemaine: 'LUNDI' as JourSemaine,
      jourDuMois: 1,
      intervalleJours: 7,
      semaineDuMois: 'PREMIERE' as SemaineDuMois,
      utiliserSemaineDuMois: false,
    } as FrequenceConfig,
    methodePaiement: 'TMONEY',
    numeroTmoney: '',
    numeroFlooz: '',
    codePin: '',
    confirmationPin: '',
    reglesSecurite: {
      verificationIdentite: true,
      multiSignatures: true,
      nombreValidateurs: 2,
      penaliteRetard: '500',
      delaiGrace: '3',
    },
  });

  // Vérifier si l'utilisateur peut créer une tontine
  useEffect(() => {
    const verification = tontineService.canCreateTontine({
      kycLevel: kycLevel,
      reputation: user?.reputation || 85,
      tontinesActives: 0,
    });

    if (!verification.success) {
      setCanCreate(false);
      setError(verification.message);
    }
  }, [kycLevel, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggle = (name: string) => {
    setFormData({
      ...formData,
      reglesSecurite: {
        ...formData.reglesSecurite,
        [name]: !formData.reglesSecurite[name as keyof typeof formData.reglesSecurite],
      },
    });
  };

  const updateFrequence = (updates: Partial<FrequenceConfig>) => {
    setFormData({
      ...formData,
      frequence: { ...formData.frequence, ...updates },
    });
  };

  // ============================================
  // CALCULS
  // ============================================
  const montantTotalParTour = formData.montantCotisation && formData.nombreMembres
    ? parseInt(formData.montantCotisation) * parseInt(formData.nombreMembres)
    : 0;

  const frequenceLabel = frequenceService.getLibelleFrequence(formData.frequence);
  const nombreCotisationsParAn = frequenceService.getNombreCotisationsParAn(formData.frequence);
  const montantTotalParAn = montantTotalParTour * nombreCotisationsParAn;
  const prochainesDates = frequenceService.calculerProchainesDates(formData.frequence, 3);

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = () => {
    setError('');

    if (step === 1) {
      if (formData.nom.length < 3) {
        setError('Le nom doit contenir au moins 3 caractères');
        return false;
      }
      if (formData.description.length < 10) {
        setError('La description doit contenir au moins 10 caractères');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.montantCotisation || parseInt(formData.montantCotisation) < 100) {
        setError('Le montant minimum est de 100 FCFA');
        return false;
      }
      if (!formData.nombreMembres || parseInt(formData.nombreMembres) < 2) {
        setError('Il faut au moins 2 membres');
        return false;
      }
      if (parseInt(formData.nombreMembres) > 50) {
        setError('Maximum 50 membres');
        return false;
      }
      if (formData.frequence.type === 'PERSONNALISEE') {
        if (!formData.frequence.intervalleJours || formData.frequence.intervalleJours < 1) {
          setError('L\'intervalle doit être au moins 1 jour');
          return false;
        }
      }
    }

    if (step === 3) {
      if (formData.methodePaiement === 'TMONEY' && !formData.numeroTmoney) {
        setError('Veuillez entrer votre numéro Tmoney');
        return false;
      }
      if (formData.methodePaiement === 'FLOOZ' && !formData.numeroFlooz) {
        setError('Veuillez entrer votre numéro Flooz');
        return false;
      }
    }

    if (step === 4) {
      if (formData.codePin.length !== 4) {
        setError('Le code PIN doit contenir 4 chiffres');
        return false;
      }
      if (formData.codePin !== formData.confirmationPin) {
        setError('Les codes PIN ne correspondent pas');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  // ============================================
  // SOUMISSION À L'API
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        nom: formData.nom,
        description: formData.description,
        type: formData.type,
        montant: parseFloat(formData.montantCotisation),
        frequence: formData.frequence.type,
        frequenceConfig: formData.frequence,
        nombreMembres: parseInt(formData.nombreMembres),
        modeRotation: formData.modeRotation,
        methodePaiement: formData.methodePaiement,
        numeroCollecte: formData.methodePaiement === 'TMONEY'
          ? formData.numeroTmoney
          : formData.numeroFlooz,
        codePin: formData.codePin,
        reglesSecurite: formData.reglesSecurite,
      };

      const response = await fetch('/api/tontines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Tontine créée avec succès !');
        setTimeout(() => {
          router.push(`/tontines/${data.tontine.id}`);
        }, 1500);
      } else {
        setError(data.error || 'Erreur lors de la création');
        toast.error(data.error || 'Erreur lors de la création');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      setError('Erreur réseau');
      toast.error('Erreur réseau');
      setIsSubmitting(false);
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-white";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2 dark:text-white";

  const steps = ['Informations', 'Paramètres', 'Paiement', 'Sécurité'];

  // ============================================
  // SI L'UTILISATEUR NE PEUT PAS CRÉER
  // ============================================
  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Création impossible</h2>
          <p className="text-gray-700 font-medium mb-6">{error}</p>
          <button
            onClick={() => router.push('/verification')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            Aller à la vérification
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer une Tontine</h1>
        <p className="text-gray-700 font-medium mt-1 dark:text-gray-300">
          Configurez votre tontine en quelques étapes
        </p>
      </div>

      {/* Info séquestre */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900">Sécurité des fonds</h3>
            <p className="text-sm text-gray-700 font-medium mt-1">
              Les cotisations seront conservées dans un compte séquestre sécurisé jusqu'à la distribution.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > index + 1 
                    ? 'bg-green-500 text-white' 
                    : step === index + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                }`}>
                  {step > index + 1 ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs font-bold text-gray-900 mt-2 hidden md:block dark:text-white">{label}</span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-2 ${step > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-bold text-gray-900 mt-4 md:hidden dark:text-white">
          Étape {step} sur 4 : {steps[step - 1]}
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== ÉTAPE 1 ========== */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Nom de la tontine *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Ex: Tontine des Amis 2026"
                />
              </div>
              <div>
                <label className={labelClassName}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClassName}
                  placeholder="Décrivez le but de cette tontine..."
                />
              </div>
              <div>
                <label className={labelClassName}>Type de tontine</label>
                <select name="type" value={formData.type} onChange={handleChange} className={inputClassName}>
                  <option value="EPARGNE">Épargne simple</option>
                  <option value="CREDIT">Crédit rotatif</option>
                  <option value="MIXTE">Mixte</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========== ÉTAPE 2 ========== */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Paramètres financiers</h2>
            <div className="space-y-6">
              <div>
                <label className={labelClassName}>Montant de cotisation (FCFA) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="number"
                    name="montantCotisation"
                    value={formData.montantCotisation}
                    onChange={handleChange}
                    className={`${inputClassName} pl-10`}
                    placeholder="Ex: 5000"
                    min="100"
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Nombre de membres *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="number"
                    name="nombreMembres"
                    value={formData.nombreMembres}
                    onChange={handleChange}
                    className={`${inputClassName} pl-10`}
                    placeholder="Ex: 10"
                    min="2"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Type de fréquence *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {typesFrequence.map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => updateFrequence({ type: freq.id as TypeFrequence })}
                      className={`p-3 border-2 rounded-lg text-center transition-colors ${
                        formData.frequence.type === freq.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Calendar className={`h-5 w-5 mx-auto mb-1 ${formData.frequence.type === freq.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="text-xs font-bold text-gray-900">{freq.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {(formData.frequence.type === 'HEBDOMADAIRE' || formData.frequence.type === 'BIHEBDOMADAIRE') && (
                <div>
                  <label className={labelClassName}>Jour de la semaine *</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {joursSemaine.map((jour) => (
                      <button
                        key={jour.id}
                        type="button"
                        onClick={() => updateFrequence({ jourSemaine: jour.id as JourSemaine })}
                        className={`p-2 border-2 rounded-lg text-center transition-colors ${
                          formData.frequence.jourSemaine === jour.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="text-xs font-bold text-gray-900">{jour.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {['MENSUELLE', 'BIMENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE'].includes(formData.frequence.type) && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!formData.frequence.utiliserSemaineDuMois}
                        onChange={() => updateFrequence({ utiliserSemaineDuMois: false })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-bold text-gray-900">Jour du mois</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formData.frequence.utiliserSemaineDuMois}
                        onChange={() => updateFrequence({ utiliserSemaineDuMois: true })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-bold text-gray-900">Semaine du mois</span>
                    </label>
                  </div>

                  {!formData.frequence.utiliserSemaineDuMois && (
                    <div>
                      <label className={labelClassName}>Jour du mois (1-31) *</label>
                      <input
                        type="number"
                        value={formData.frequence.jourDuMois || 1}
                        onChange={(e) => updateFrequence({ jourDuMois: parseInt(e.target.value) })}
                        className={inputClassName}
                        min="1"
                        max="31"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.frequence.type === 'PERSONNALISEE' && (
                <div>
                  <label className={labelClassName}>Intervalle en jours *</label>
                  <input
                    type="number"
                    value={formData.frequence.intervalleJours || 7}
                    onChange={(e) => updateFrequence({ intervalleJours: parseInt(e.target.value) })}
                    className={inputClassName}
                    min="1"
                  />
                </div>
              )}

              {/* Récapitulatif */}
              {montantTotalParTour > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Récapitulatif automatique
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Fréquence</p>
                      <p className="text-sm font-bold text-gray-900">{frequenceLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Montant par tour</p>
                      <p className="text-sm font-bold text-gray-900">{montantTotalParTour.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Total/an</p>
                      <p className="text-sm font-bold text-gray-900">{montantTotalParAn.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-blue-200">
                    <p className="text-xs text-gray-600 font-bold mb-2">Prochaines dates :</p>
                    {prochainesDates.map((date, i) => (
                      <p key={i} className="text-sm font-medium text-gray-900">
                        • {frequenceService.formaterDate(date)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className={labelClassName}>Mode de rotation *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {modesRotation.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, modeRotation: mode.id })}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          formData.modeRotation === mode.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mx-auto mb-2 ${formData.modeRotation === mode.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className="text-sm font-bold text-gray-900">{mode.label}</p>
                        <p className="text-xs text-gray-700 font-medium mt-1">{mode.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== ÉTAPE 3 ========== */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Méthodes de paiement</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Choisissez votre opérateur *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {methodesPaiement.map((methode) => {
                    const Icon = methode.icone;
                    return (
                      <button
                        key={methode.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, methodePaiement: methode.id })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          formData.methodePaiement === methode.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-full ${methode.couleur} flex items-center justify-center mx-auto mb-2`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{methode.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.methodePaiement === 'TMONEY' && (
                <div>
                  <label className={labelClassName}>Numéro Tmoney *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="tel"
                      name="numeroTmoney"
                      value={formData.numeroTmoney}
                      onChange={handleChange}
                      className={`${inputClassName} pl-10`}
                      placeholder="Ex: 90 XX XX XX XX"
                    />
                  </div>
                </div>
              )}

              {formData.methodePaiement === 'FLOOZ' && (
                <div>
                  <label className={labelClassName}>Numéro Flooz *</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="tel"
                      name="numeroFlooz"
                      value={formData.numeroFlooz}
                      onChange={handleChange}
                      className={`${inputClassName} pl-10`}
                      placeholder="Ex: 90 XX XX XX XX"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== ÉTAPE 4 ========== */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">Règles de sécurité</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.reglesSecurite.verificationIdentite}
                  onChange={() => handleToggle('verificationIdentite')}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <p className="font-bold text-gray-900">Vérification d'identité obligatoire</p>
                  <p className="text-sm text-gray-700 font-medium">Tous les membres doivent être vérifiés (KYC 2)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.reglesSecurite.multiSignatures}
                  onChange={() => handleToggle('multiSignatures')}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <p className="font-bold text-gray-900">Validation multi-signatures</p>
                  <p className="text-sm text-gray-700 font-medium">Transactions importantes = plusieurs validations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>Pénalité de retard (FCFA/jour)</label>
                  <input
                    type="number"
                    value={formData.reglesSecurite.penaliteRetard}
                    onChange={(e) => setFormData({
                      ...formData,
                      reglesSecurite: { ...formData.reglesSecurite, penaliteRetard: e.target.value }
                    })}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Délai de grâce (jours)</label>
                  <input
                    type="number"
                    value={formData.reglesSecurite.delaiGrace}
                    onChange={(e) => setFormData({
                      ...formData,
                      reglesSecurite: { ...formData.reglesSecurite, delaiGrace: e.target.value }
                    })}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Code PIN de sécurité *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="codePin"
                    value={formData.codePin}
                    onChange={handleChange}
                    className={`${inputClassName} pl-10`}
                    placeholder="••••"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClassName}>Confirmer le code PIN *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmationPin"
                  value={formData.confirmationPin}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="••••"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Boutons de navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Retour
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2"
            >
              Continuer
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la tontine'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}