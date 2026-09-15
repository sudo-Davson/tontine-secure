'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
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
  const { completeKYCStep } = useAuth();
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
    if (emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED') {
      completeKYCStep(1);
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
    if (emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED') {
      completeKYCStep(1);
    }
    
    setTimeout(() => {
      setPhoneStatus('VERIFIED');
      setShowPhoneCodeInput(false);
      alert('Téléphone vérifié avec succès !');
    }, 1000);
  };

  // Classes réutilisables
  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-white";
  const buttonClassName = "w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm";

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Vérification Niveau 1
        </h1>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mt-2">
          Vérifiez votre email et votre numéro de téléphone
        </p>
      </div>

      {/* Status global */}
      <div className="mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
              Vérification de base
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
              {emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED'
                ? 'Niveau 1 complété ! Vous pouvez passer au niveau 2.'
                : 'Vérifiez votre email et votre téléphone pour compléter le niveau 1.'}
            </p>
          </div>
        </div>
      </div>

      {/* Vérification Email */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            emailStatus === 'VERIFIED' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <Mail className={`h-5 w-5 sm:h-6 sm:w-6 ${emailStatus === 'VERIFIED' ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Vérification Email
              </h3>
              {emailStatus === 'VERIFIED' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {emailStatus === 'UNVERIFIED' && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Nous enverrons un code de vérification à votre adresse email
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClassName} flex-1`}
                    placeholder="votre@email.com"
                  />
                  <button
                    onClick={handleSendEmailVerification}
                    className={buttonClassName}
                  >
                    <Send className="h-4 w-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}

            {emailStatus === 'SENDING' && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Envoi du code...
              </div>
            )}

            {showEmailCodeInput && emailStatus !== 'VERIFIED' && (
              <div className="space-y-3 mt-3">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Entrez le code reçu par email
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`${inputClassName} flex-1 text-center tracking-widest`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyEmail}
                    className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
                  >
                    Vérifier
                  </button>
                </div>
                <button
                  onClick={handleSendEmailVerification}
                  disabled={countdown > 0}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-bold"
                >
                  {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                </button>
              </div>
            )}

            {emailStatus === 'VERIFIED' && (
              <p className="text-green-700 dark:text-green-400 font-bold mt-1 text-sm">
                Email vérifié avec succès
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vérification Téléphone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            phoneStatus === 'VERIFIED' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            <Phone className={`h-5 w-5 sm:h-6 sm:w-6 ${phoneStatus === 'VERIFIED' ? 'text-green-600' : 'text-purple-600'}`} />
          </div>
          
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Vérification Téléphone
              </h3>
              {phoneStatus === 'VERIFIED' && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            
            {phoneStatus === 'UNVERIFIED' && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Nous enverrons un code par SMS à votre téléphone
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${inputClassName} flex-1`}
                    placeholder="+228 XX XX XX XX"
                  />
                  <button
                    onClick={handleSendPhoneVerification}
                    className="w-full sm:w-auto px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Smartphone className="h-4 w-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            )}

            {phoneStatus === 'SENDING' && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Envoi du SMS...
              </div>
            )}

            {showPhoneCodeInput && phoneStatus !== 'VERIFIED' && (
              <div className="space-y-3 mt-3">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Entrez le code reçu par SMS
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={`${inputClassName} flex-1 text-center tracking-widest`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyPhone}
                    className="w-full sm:w-auto px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
                  >
                    Vérifier
                  </button>
                </div>
                <button
                  onClick={handleSendPhoneVerification}
                  disabled={countdown > 0}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 font-bold"
                >
                  {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le code'}
                </button>
              </div>
            )}

            {phoneStatus === 'VERIFIED' && (
              <p className="text-green-700 dark:text-green-400 font-bold mt-1 text-sm">
                Téléphone vérifié avec succès
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progression */}
      {emailStatus === 'VERIFIED' && phoneStatus === 'VERIFIED' && (
        <div className="bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                Niveau 1 complété !
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
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
      <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
        <Lock className="h-4 w-4" />
        Vos informations sont protégées et chiffrées
      </div>
    </div>
  );
}