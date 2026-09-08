'use client';

import { useState, useRef } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Camera,
  MapPin,
  Building2,
  FileCheck,
  Star,
  Lock,
  RefreshCw,
  X,
  CreditCard,
  Award,
  TrendingUp,
  User
} from 'lucide-react';

export default function VerificationNiveau3Page() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [addressProof, setAddressProof] = useState<string | null>(null);
  const [incomeProof, setIncomeProof] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    country: 'CI',
    postalCode: '',
    profession: '',
    employer: '',
    monthlyIncome: '',
    sourceOfFunds: '',
    expectedMonthlyContribution: '',
  });

  const faceInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (image: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image trop grande. Maximum 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // app/verification/niveau-3/page.tsx

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // ============================================
    // 🚀 BACKEND : ICI ON ENVERRA LES DONNÉES AU BACKEND
    // ============================================
    // Quand le backend sera prêt, on fera :
    //
    // const verificationData = {
    //   userId: 'user_id',
    //   address: formData.address,
    //   city: formData.city,
    //   country: formData.country,
    //   profession: formData.profession,
    //   monthlyIncome: formData.monthlyIncome,
    //   sourceOfFunds: formData.sourceOfFunds,
    //   addressProof: addressProof,
    //   incomeProof: incomeProof,
    //   faceImage: faceImage,
    // };
    //
    // const response = await fetch('/api/kyc/verify-level-3', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(verificationData),
    // });
    //
    // const result = await response.json();
    // ============================================
    
    // Simulation
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Vérification renforcée soumise !');
      window.location.href = '/verification/statut';
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vérification Renforcée - Niveau 3</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pour les transactions importantes et une confiance maximale
        </p>
      </div>

      {/* Info */}
      <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Award className="h-12 w-12" />
          <div>
            <h2 className="text-xl font-bold">Niveau Premium</h2>
            <p className="text-purple-100 mt-1">
              Ce niveau permet d'accéder aux tontines de montants élevés et renforce votre réputation
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['Adresse', 'Revenus', 'Face Match', 'Confirmation'].map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                  step > index + 1 ? 'bg-green-500' :
                  step === index + 1 ? 'bg-purple-600' : 'bg-gray-200'
                } text-white font-semibold`}>
                  {step > index + 1 ? <CheckCircle className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs mt-2 text-center">{label}</span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Vérification d'Adresse
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Rue 12, Cocody, Abidjan"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Abidjan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="CI">Côte d'Ivoire</option>
                    <option value="SN">Sénégal</option>
                    <option value="TG">Togo</option>
                    <option value="BJ">Bénin</option>
                    <option value="BF">Burkina Faso</option>
                    <option value="ML">Mali</option>
                    <option value="GN">Guinée</option>
                    <option value="NE">Niger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="01 BP 1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificatif de domicile
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => addressInputRef.current?.click()}
                >
                  {addressProof ? (
                    <div className="relative">
                      <img src={addressProof} alt="Justificatif" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddressProof(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Facture d'électricité, eau, ou téléphone</p>
                      <p className="text-xs text-gray-500 mt-1">Document de moins de 3 mois</p>
                    </div>
                  )}
                </div>
                <input
                  ref={addressInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setAddressProof)}
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Informations sur les Revenus
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Commerçant, Ingénieur..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employeur
                  </label>
                  <input
                    type="text"
                    name="employer"
                    value={formData.employer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Entreprise XYZ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenu mensuel (FCFA)
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 300000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source des fonds
                  </label>
                  <select
                    name="sourceOfFunds"
                    value={formData.sourceOfFunds}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="SALAIRE">Salaire</option>
                    <option value="COMMERCE">Commerce</option>
                    <option value="AGRICULTURE">Agriculture</option>
                    <option value="EPARGNE">Épargne</option>
                    <option value="INVESTISSEMENT">Investissement</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant mensuel prévu pour les cotisations (FCFA)
                </label>
                <input
                  type="number"
                  name="expectedMonthlyContribution"
                  value={formData.expectedMonthlyContribution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: 100000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificatif de revenus
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => incomeInputRef.current?.click()}
                >
                  {incomeProof ? (
                    <div className="relative">
                      <img src={incomeProof} alt="Justificatif de revenus" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIncomeProof(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Fiche de paie ou relevé bancaire</p>
                      <p className="text-xs text-gray-500 mt-1">Document de moins de 3 mois</p>
                    </div>
                  )}
                </div>
                <input
                  ref={incomeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setIncomeProof)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-600" />
              Vérification Faciale (Face Match)
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Nous allons comparer votre visage avec la photo de votre document d'identité.
                  Assurez-vous d'être dans un endroit bien éclairé.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prenez un selfie en direct
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => faceInputRef.current?.click()}
                >
                  {faceImage ? (
                    <div className="relative">
                      <img src={faceImage} alt="Face" className="w-full h-64 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFaceImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-12">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Cliquez pour prendre un selfie</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Regardez directement la caméra, sans lunettes ni casquette
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={faceInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setFaceImage)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Continuer
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Adresse</h3>
                <p className="text-gray-700">{formData.address || 'Non fournie'}</p>
                <p className="text-gray-700">{formData.city}, {formData.country}</p>
                {addressProof && <p className="text-green-600">✓ Justificatif fourni</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Revenus</h3>
                <p className="text-gray-700">Profession: {formData.profession || 'Non fournie'}</p>
                <p className="text-gray-700">Revenu mensuel: {formData.monthlyIncome || '0'} FCFA</p>
                <p className="text-gray-700">Cotisation prévue: {formData.expectedMonthlyContribution || '0'} FCFA</p>
                {incomeProof && <p className="text-green-600">✓ Justificatif fourni</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Vérification faciale</h3>
                {faceImage ? (
                  <p className="text-green-600">✓ Selfie fourni</p>
                ) : (
                  <p className="text-red-600">✗ Selfie manquant</p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Important</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      La vérification renforcée peut prendre 48-72 heures. Vous serez notifié par email et SMS.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Soumission en cours...
                    </span>
                  ) : (
                    'Soumettre la vérification'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Avantages */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Avantages du Niveau 3</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Montants élevés</h4>
              <p className="text-sm text-gray-600">
                Accédez aux tontines de gros montants
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Réputation premium</h4>
              <p className="text-sm text-gray-600">
                Badge vérifié renforcé sur votre profil
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Sécurité maximale</h4>
              <p className="text-sm text-gray-600">
                Protection renforcée pour vos transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}