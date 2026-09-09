// app/(dashboard)/securite/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Key,
  Fingerprint,
  LogOut,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  User,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function SecuritePage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [codePin, setCodePin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas !');
      return;
    }
    if (newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    alert('✅ Mot de passe modifié avec succès !');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (codePin.length !== 4) {
      alert('Le code PIN doit contenir 4 chiffres');
      return;
    }
    alert('✅ Code PIN modifié avec succès !');
    setCodePin('');
    setShowPinModal(false);
  };

  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="text-gray-700 font-medium mt-1">
          Gérez vos paramètres de sécurité et protégez votre compte
        </p>
      </div>

      {/* Statut de sécurité */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-12 w-12" />
          <div>
            <h2 className="text-xl font-bold">Compte sécurisé</h2>
            <p className="text-green-100 font-medium">
              Votre compte est protégé avec toutes les mesures de sécurité
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm font-bold">Vérification KYC</p>
            <p className="text-lg font-bold">Niveau 2/3</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm font-bold">2FA</p>
            <p className="text-lg font-bold">Activée</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <p className="text-sm font-bold">Code PIN</p>
            <p className="text-lg font-bold">Configuré</p>
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Mot de passe</h3>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelClassName}>Mot de passe actuel *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`${inputClassName} pl-10 pr-12`}
                placeholder="••••••••"
                style={{ color: '#000000' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClassName}>Nouveau mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClassName} pl-10 pr-12`}
                placeholder="••••••••"
                minLength={8}
                style={{ color: '#000000' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-700 font-medium mt-1">
              Minimum 8 caractères, avec majuscules et chiffres recommandés
            </p>
          </div>

          <div>
            <label className={labelClassName}>Confirmer le nouveau mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClassName} pl-10 pr-12`}
                placeholder="••••••••"
                minLength={8}
                style={{ color: '#000000' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            Modifier le mot de passe
          </button>
        </form>
      </div>

      {/* Code PIN */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Key className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Code PIN</h3>
              <p className="text-sm text-gray-700 font-medium">
                Utilisé pour confirmer les transactions
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPinModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold text-sm"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* Vérification KYC */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Vérification d'identité (KYC)</h3>
              <p className="text-sm text-gray-700 font-medium">
                Niveau 2 - Identité vérifiée
              </p>
            </div>
          </div>
          <Link
            href="/verification"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm flex items-center gap-2"
          >
            Voir le statut
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Sessions actives */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Sessions actives</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg">
            <Smartphone className="h-8 w-8 text-gray-500" />
            <div className="flex-1">
              <p className="font-bold text-gray-900">Téléphone - Chrome</p>
              <p className="text-sm text-gray-700 font-medium">
                Lomé, Togo • Actif maintenant
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
              Actif
            </span>
          </div>
          
          <div className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-lg">
            <Smartphone className="h-8 w-8 text-gray-500" />
            <div className="flex-1">
              <p className="font-bold text-gray-900">Ordinateur - Firefox</p>
              <p className="text-sm text-gray-700 font-medium">
                Lomé, Togo • Il y a 2 heures
              </p>
            </div>
            <button className="text-red-600 font-bold text-sm hover:text-red-700">
              Déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900">Zone dangereuse</h3>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between p-4 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <p className="font-bold text-red-900">Supprimer mon compte</p>
                <p className="text-sm text-red-700 font-medium">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white border-2 border-red-200 rounded-lg hover:border-red-400 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <p className="font-bold text-red-900">Déconnexion de tous les appareils</p>
                <p className="text-sm text-red-700 font-medium">
                  Déconnecter votre compte de tous les appareils connectés
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Modal Code PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Modifier le code PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className={labelClassName}>Nouveau code PIN *</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={codePin}
                    onChange={(e) => setCodePin(e.target.value)}
                    className={`${inputClassName} pl-10 pr-12 text-center tracking-widest`}
                    placeholder="••••"
                    maxLength={4}
                    style={{ color: '#000000' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold"
              >
                Confirmer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-red-900">Supprimer le compte</h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-700 font-medium mb-4">
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </p>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 font-bold">
                ⚠️ Toutes vos tontines, transactions et données seront supprimées définitivement.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-bold"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Compte supprimé (simulation)');
                  setShowDeleteModal(false);
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}