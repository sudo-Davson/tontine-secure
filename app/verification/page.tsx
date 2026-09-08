'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  CheckCircle, 
  Lock, 
  ChevronRight,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  CreditCard,
  User,
  Star
} from 'lucide-react';

export default function VerificationPage() {
  const [verificationLevel, setVerificationLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement du statut de vérification
    setTimeout(() => {
      setVerificationLevel(0); // L'utilisateur n'a encore rien vérifié
      setIsLoading(false);
    }, 1000);
  }, []);

  const levels = [
    {
      level: 1,
      title: 'Vérification de base',
      description: 'Email et téléphone vérifiés',
      icon: Mail,
      status: verificationLevel >= 1 ? 'completed' : 'pending',
      requirements: ['Adresse email valide', 'Numéro de téléphone actif'],
    },
    {
      level: 2,
      title: "Vérification d'identité",
      description: 'CNI ou Passeport vérifié',
      icon: CreditCard,
      status: verificationLevel >= 2 ? 'completed' : 'pending',
      requirements: ['CNI ou Passeport valide', 'Selfie de vérification', 'Correspondance des informations'],
    },
    {
      level: 3,
      title: 'Vérification renforcée',
      description: 'Pour les transactions importantes',
      icon: Star,
      status: verificationLevel >= 3 ? 'completed' : 'pending',
      requirements: ["Vérification d'adresse", 'Reconnaissance faciale', 'Score de confiance élevé'],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Chargement de votre statut de vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vérification d'Identité</h1>
        <p className="text-gray-700 mt-2 font-medium">
          Complétez les niveaux de vérification pour accéder à plus de fonctionnalités
        </p>
      </div>

      {/* Statut global */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Niveau de vérification : {verificationLevel}/3</h2>
            <p className="text-blue-100 font-medium">
              {verificationLevel === 0 && 'Commencez la vérification'}
              {verificationLevel === 1 && 'Vérification de base complétée'}
              {verificationLevel === 2 && 'Identité vérifiée'}
              {verificationLevel === 3 && 'Vérification complète'}
            </p>
          </div>
          <Shield className="h-16 w-16 text-blue-200" />
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${(verificationLevel / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Niveaux de vérification */}
      <div className="space-y-4">
        {levels.map((levelInfo) => {
          const Icon = levelInfo.icon;
          const isCompleted = levelInfo.status === 'completed';
          const isCurrent = verificationLevel + 1 === levelInfo.level;
          
          return (
            <div 
              key={levelInfo.level}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : isCurrent 
                    ? 'border-blue-300 shadow-md' 
                    : 'border-gray-200 opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted 
                    ? 'bg-green-100' 
                    : isCurrent 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isCurrent 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">Niveau {levelInfo.level}</h3>
                    {isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{levelInfo.title}</h4>
                  <p className="text-sm font-medium text-gray-700 mb-3">{levelInfo.description}</p>
                  
                  <ul className="space-y-1 mb-4">
                    {levelInfo.requirements.map((req, index) => (
                      <li key={index} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                  
                  {!isCompleted && (
                    <Link
                      href={`/verification/niveau-${levelInfo.level}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Commencer la vérification' : 'Niveau précédent requis'}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Avantages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Avantages de la vérification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">Sécurité</h4>
              <p className="text-sm font-medium text-gray-700">Protégez vos transactions et vos données</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">Confiance</h4>
              <p className="text-sm font-medium text-gray-700">Gagnez la confiance des autres membres</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">Accès complet</h4>
              <p className="text-sm font-medium text-gray-700">Débloquez toutes les fonctionnalités</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Besoin d'aide ?</h4>
            <p className="text-sm font-medium text-blue-700 mt-1">
              Contactez notre support si vous rencontrez des difficultés lors de la vérification.
              Nous sommes disponibles 24/7 pour vous aider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}