// app/(dashboard)/tarifs/page.tsx
'use client';

import { useState } from 'react';
import { fraisService, FRAIS_CONFIG } from '../../../lib/services/frais-service';
import { ABONNEMENTS } from '../../../lib/services/abonnement-service';
import { 
  CheckCircle, 
  XCircle,
  Crown,
  Briefcase,
  Wallet,
  TrendingUp,
  Info
} from 'lucide-react';

export default function TarifsPage() {
  const [periode, setPeriode] = useState<'MENSUEL' | 'ANNUEL'>('MENSUEL');

  const abonnements = [
    {
      type: 'GRATUIT' as const,
      nom: 'Gratuit',
      icone: Wallet,
      description: 'Pour découvrir',
      prix: ABONNEMENTS.GRATUIT.montantMensuel,
      avantages: [
        { label: '2 tontines maximum', inclus: true },
        { label: '10 membres par tontine', inclus: true },
        { label: 'Vérification KYC de base', inclus: true },
        { label: 'Notifications email', inclus: true },
        { label: 'Notifications SMS', inclus: false },
        { label: 'Rapports avancés', inclus: false },
        { label: 'Support prioritaire', inclus: false },
      ],
    },
    {
      type: 'PREMIUM' as const,
      nom: 'Premium',
      icone: Crown,
      description: 'Pour les particuliers',
      prix: periode === 'MENSUEL' ? ABONNEMENTS.PREMIUM.montantMensuel : 25000,
      populaire: true,
      avantages: [
        { label: '10 tontines maximum', inclus: true },
        { label: '50 membres par tontine', inclus: true },
        { label: 'Vérification KYC complète', inclus: true },
        { label: 'Notifications SMS illimitées', inclus: true },
        { label: 'Rapports avancés', inclus: true },
        { label: 'Support prioritaire', inclus: true },
        { label: 'API Access', inclus: false },
      ],
    },
    {
      type: 'BUSINESS' as const,
      nom: 'Business',
      icone: Briefcase,
      description: 'Pour les entreprises',
      prix: periode === 'MENSUEL' ? ABONNEMENTS.BUSINESS.montantMensuel : 100000,
      avantages: [
        { label: 'Tontines illimitées', inclus: true },
        { label: 'Membres illimités', inclus: true },
        { label: 'Vérification KYC complète', inclus: true },
        { label: 'Notifications SMS illimitées', inclus: true },
        { label: 'Rapports avancés', inclus: true },
        { label: 'Support prioritaire', inclus: true },
        { label: 'API Access', inclus: true },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarifs et Abonnements</h1>
        <p className="text-gray-700 font-medium mt-2 dark:text-gray-300">
          Choisissez le plan qui vous convient
        </p>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setPeriode('MENSUEL')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            periode === 'MENSUEL'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setPeriode('ANNUEL')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            periode === 'ANNUEL'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Annuel (-2 mois)
        </button>
      </div>

      {/* Cartes d'abonnement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {abonnements.map((abo) => {
          const Icon = abo.icone;
          return (
            <div
              key={abo.type}
              className={`bg-white rounded-2xl shadow-lg border-2 p-6 dark:bg-gray-800 ${
                abo.populaire
                  ? 'border-blue-500 shadow-blue-200'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              {abo.populaire && (
                <div className="bg-blue-600 text-white text-center py-1 rounded-full text-xs font-bold mb-4">
                  LE PLUS POPULAIRE
                </div>
              )}
              <div className="text-center mb-6">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  abo.type === 'PREMIUM' ? 'bg-yellow-100' : abo.type === 'BUSINESS' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-7 w-7 ${
                    abo.type === 'PREMIUM' ? 'text-yellow-600' : abo.type === 'BUSINESS' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{abo.nom}</h2>
                <p className="text-sm text-gray-700 font-medium dark:text-gray-300">{abo.description}</p>
              </div>

              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {abo.prix.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-700 font-medium dark:text-gray-300">
                  {periode === 'MENSUEL' ? '/mois' : '/an'}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {abo.avantages.map((avantage, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {avantage.inclus ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      avantage.inclus ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                    }`}>
                      {avantage.label}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                abo.type === 'PREMIUM'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : abo.type === 'BUSINESS'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                {abo.type === 'GRATUIT' ? 'Commencer gratuitement' : 'Choisir ce plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Frais de transaction */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600">
        <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Frais de transaction
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg dark:bg-blue-900 dark:border-blue-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Cotisation</h3>
            <p className="text-2xl font-bold text-blue-600">{FRAIS_CONFIG.COTISATION.pourcentage}%</p>
            <p className="text-sm text-gray-700 font-medium dark:text-gray-300">
              Min : {FRAIS_CONFIG.COTISATION.minimum} FCFA | Max : {FRAIS_CONFIG.COTISATION.maximum} FCFA
            </p>
          </div>
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg dark:bg-green-900 dark:border-green-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Distribution</h3>
            <p className="text-2xl font-bold text-green-600">{FRAIS_CONFIG.DISTRIBUTION.pourcentage}%</p>
            <p className="text-sm text-gray-700 font-medium dark:text-gray-300">
              Min : {FRAIS_CONFIG.DISTRIBUTION.minimum} FCFA | Max : {FRAIS_CONFIG.DISTRIBUTION.maximum} FCFA
            </p>
          </div>
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg dark:bg-red-900 dark:border-red-700">
            <h3 className="font-bold text-gray-900 dark:text-white">Retrait</h3>
            <p className="text-2xl font-bold text-red-600">{FRAIS_CONFIG.RETRAIT.pourcentage}%</p>
            <p className="text-sm text-gray-700 font-medium dark:text-gray-300">
              Min : {FRAIS_CONFIG.RETRAIT.minimum} FCFA | Max : {FRAIS_CONFIG.RETRAIT.maximum} FCFA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}