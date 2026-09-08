'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  CheckCircle, 
  RefreshCw,
  Shield,
  Send,
  Smartphone,
  Lock
} from 'lucide-react';

export default function VerificationNiveau1Page() {
  const [emailStatus, setEmailStatus] = useState<'UNVERIFIED' | 'SENDING' | 'SENT' | 'VERIFIED'>('UNVERIFIED');
  const [phoneStatus, setPhoneStatus] = useState<'UNVERIFIED' | 'SENDING' | 'SENT' | 'VERIFIED'>('UNVERIFIED');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showEmailCodeInput, setShowEmailCodeInput] = useState(false);
  const [showPhoneCodeInput, setShowPhoneCodeInput] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendEmailVerification = () => {
    if (!email) {
      alert('Veuillez entrer votre adresse email');
      return;
    }
    
    setEmailStatus('SENDING');
    
    setTimeout(() => {
      setEmailStatus('SENT');
      setShowEmailCodeInput(true);
      setCountdown(60);
      alert('Code de vérification envoyé à votre email !');
    }, 1500);
  };

  const handleVerifyEmail = () => {
    if (!verificationCode) {
      alert('Veuillez entrer le code de vérification');
      return;
    }
    
    setTimeout(() => {
      setEmailStatus('VERIFIED');
      setShowEmailCodeInput(false);
      alert('Email vérifié avec succès !');
    }, 1000);
  };

  const handleSendPhoneVerification = () => {
    if (!phone) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }
    
    setPhoneStatus('SENDING');
    
    setTimeout(() => {
      setPhoneStatus('SENT');
      setShowPhoneCodeInput(true);
      setCountdown(60);
      alert('Code de vérification envoyé par SMS !');
    }, 1500);
  };

  const handleVerifyPhone = () => {
    if (!verificationCode) {
      alert('Veuillez entrer le code de vérification');
      return;
    }
    
    setTimeout(() => {
      setPhoneStatus('VERIFIED');
      setShowPhoneCodeInput(false);
      alert('Téléphone vérifié avec succès !');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vérification Niveau 1</h1>
        <p className="text-gray-900 font-medium mt-2">
          Vérifiez votre email et votre numéro de téléphone
        </p>
      </div>

      {/* Status global */}
      <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-900">Vérification de base</h3>
            <p className="text-gray-900 font-medium">
              {emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED'
                ? 'Niveau 1 complété ! Vous pouvez passer au niveau 2.'
                : 'Vérifiez votre email et votre téléphone pour compléter le niveau 1.'}
            </p>
          </div>
        </div>
      </div>

      {/* Vérification Email */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            emailStatus === 'VERIFIED' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <Mail className={`h-6 w-6 ${emailStatus === 'VERIFIED' ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">Vérification Email</h3>
              {emailStatus === 'VERIFIED' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {emailStatus === 'UNVERIFIED' && (
              <div className="space-y-3">
                <p className="text-gray-900 font-medium">
                  Nous enverrons un code de vérification à votre adresse email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium"
                    placeholder="votre@email.com"
                    style={{ color: '#000000' }}
                  />
                  <button
                    onClick={handleSendEmailVerification}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold"
                  >
                    <Send className="h-4 w-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}

            {emailStatus === 'SENDING' && (
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Envoi du code...
              </div>
            )}

            {showEmailCodeInput && emailStatus !== 'VERIFIED' && (
              <div className="space-y-3 mt-3">
                <p className="text-gray-900 font-medium">
                  Entrez le code reçu par email
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    style={{ color: '#000000' }}
                  />
                  <button
                    onClick={handleVerifyEmail}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                  >
                    Vérifier
                  </button>
                </div>
                <button
                  onClick={handleSendEmailVerification}
                  disabled={countdown > 0}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-bold"
                >
                  {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                </button>
              </div>
            )}

            {emailStatus === 'VERIFIED' && (
              <p className="text-green-700 font-bold mt-1">
                Email vérifié avec succès
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vérification Téléphone */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            phoneStatus === 'VERIFIED' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            <Phone className={`h-6 w-6 ${phoneStatus === 'VERIFIED' ? 'text-green-600' : 'text-purple-600'}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">Vérification Téléphone</h3>
              {phoneStatus === 'VERIFIED' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {phoneStatus === 'UNVERIFIED' && (
              <div className="space-y-3">
                <p className="text-gray-900 font-medium">
                  Nous enverrons un code par SMS à votre téléphone
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium"
                    placeholder="+228 XX XX XX XX"
                    style={{ color: '#000000' }}
                  />
                  <button
                    onClick={handleSendPhoneVerification}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-bold"
                  >
                    <Smartphone className="h-4 w-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}

            {phoneStatus === 'SENDING' && (
              <div className="flex items-center gap-2 text-gray-900 font-medium">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Envoi du SMS...
              </div>
            )}

            {showPhoneCodeInput && phoneStatus !== 'VERIFIED' && (
              <div className="space-y-3 mt-3">
                <p className="text-gray-900 font-medium">
                  Entrez le code reçu par SMS
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    style={{ color: '#000000' }}
                  />
                  <button
                    onClick={handleVerifyPhone}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                  >
                    Vérifier
                  </button>
                </div>
                <button
                  onClick={handleSendPhoneVerification}
                  disabled={countdown > 0}
                  className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 font-bold"
                >
                  {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                </button>
              </div>
            )}

            {phoneStatus === 'VERIFIED' && (
              <p className="text-green-700 font-bold mt-1">
                Téléphone vérifié avec succès
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progression */}
      {emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED' && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-bold text-gray-900">Niveau 1 complété !</h3>
              <p className="text-gray-900 font-medium mt-1">
                Vous pouvez maintenant passer au niveau 2 pour la vérification d'identité.
              </p>
              <a 
                href="/verification/niveau-2" 
                className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold"
              >
                Passer au niveau 2
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Sécurité */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-900 font-medium">
        <Lock className="h-4 w-4" />
        Vos informations sont protégées et chiffrées
      </div>
    </div>
  );
}