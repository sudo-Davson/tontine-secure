// app/(auth)/register/page.tsx - VERSION FINALE CORRIGÉE

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, User, Phone, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Classes pour les champs avec texte NOIR visible
  const inputClassName = "w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const inputNoIconClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas !');
      return;
    }
    if (!formData.acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);

    const success = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (success) {
      setIsLoading(false);
      alert('Inscription réussie ! Redirection vers la vérification...');
      router.push('/verification/niveau-1');
    } else {
      setIsLoading(false);
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Créer un compte</h1>
          <p className="text-gray-700 mt-2 font-medium">Rejoignez TontineSecure en quelques étapes</p>
        </div>

        {/* Message d'information KYC */}
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-800">Vérification requise</h3>
              <p className="text-sm text-yellow-700 mt-1 font-medium">
                Après l'inscription, vous devrez vérifier votre identité (KYC) pour participer aux tontines.
              </p>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                1
              </div>
              <div className={`h-1.5 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                2
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-bold text-gray-900">
            {step === 1 ? 'Étape 1 : Informations personnelles' : 'Étape 2 : Sécurité du compte'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClassName}>Prénom *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder="Jean"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClassName}>Nom *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={inputNoIconClassName}
                      placeholder="Kouassi"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Adresse email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="vous@exemple.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>Numéro de téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="+228 00 00 00 00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Format : +228 XX XX XX XX
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    if (formData.firstName.length < 2) {
                      setError('Le prénom doit contenir au moins 2 caractères');
                      return;
                    }
                    if (formData.lastName.length < 2) {
                      setError('Le nom doit contenir au moins 2 caractères');
                      return;
                    }
                    if (!formData.email.includes('@')) {
                      setError('Adresse email invalide');
                      return;
                    }
                    if (formData.phone.length < 10) {
                      setError('Numéro de téléphone invalide');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-base"
                >
                  Continuer
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className={labelClassName}>Mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    Minimum 8 caractères
                  </p>
                </div>

                <div>
                  <label className={labelClassName}>Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="••••••••"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <label className="text-sm font-bold text-gray-900">
                    J'accepte les conditions d'utilisation et la politique de confidentialité
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                      isLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Inscription...' : 'Créer mon compte'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-gray-900">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}