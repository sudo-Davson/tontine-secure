// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, Mail, Lock, Eye, EyeOff, AlertCircle, Monitor, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingSession, setExistingSession] = useState<any>(null);
  const [showForceModal, setShowForceModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Adresse email invalide');
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe invalide');
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Connexion réussie !');
      window.location.href = '/dashboard';
    } else {
      setIsLoading(false);

      if (result.code === 'SESSION_ACTIVE' && result.existingSession) {
        setExistingSession(result.existingSession);
        setShowForceModal(true);
        return;
      }

      setError(result.error || 'Email ou mot de passe incorrect');
      toast.error(result.error || 'Email ou mot de passe incorrect');
    }
  };

  const handleForceLogin = async () => {
    setShowForceModal(false);
    setIsLoading(true);

    const result = await login(email, password, true);

    if (result.success) {
      toast.success('Connexion réussie !');
      setTimeout(() => router.push('/dashboard'), 1000);
    } else {
      setIsLoading(false);
      setError(result.error || 'Erreur');
      toast.error(result.error || 'Erreur');
    }

    setExistingSession(null);
  };

  const inputClassName = "w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">TontineSecure</h1>
          <p className="text-gray-700 mt-2 font-medium">Connexion à votre compte</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClassName}>Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="vous@exemple.com"
                  style={{ color: '#000000' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName}
                  placeholder="••••••••"
                  style={{ color: '#000000' }}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-colors ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-gray-900">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showForceModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Session active détectée
                </h3>
                <p className="text-sm text-gray-600">
                  Un autre appareil est connecté
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <Monitor className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700">Appareil</p>
                  <p className="text-sm text-gray-900 truncate">
                    {existingSession?.userAgent?.substring(0, 60) || 'Appareil inconnu'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700">Connecté depuis</p>
                  <p className="text-sm text-gray-900">
                    {existingSession?.createdAt
                      ? new Date(existingSession.createdAt).toLocaleString('fr-FR')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 font-medium mb-5">
              Pour vous connecter ici, vous devez d'abord déconnecter l'autre appareil.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForceModal(false);
                  setExistingSession(null);
                }}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleForceLogin}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
              >
                Se connecter ici
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}