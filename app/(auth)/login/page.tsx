// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

    const success = await login(email, password);
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
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
            <p className="text-sm font-bold text-red-700">{error}</p>
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
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-base"
            >
              Se connecter
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
    </div>
  );
}