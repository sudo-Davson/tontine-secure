'use client';

import { useState } from 'react';
import { tontineService, REGLES, Membre } from '../../../lib/services/tontine-service';
import { notificationService } from '../../../lib/services/notification-service';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  User,
  DollarSign,
  Bell,
  Shield,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export default function DemoPage() {
  const [resultatsCreation, setResultatsCreation] = useState<any[]>([]);
  const [resultatPenalite, setResultatPenalite] = useState<string>('');
  const [resultatReputation, setResultatReputation] = useState<string>('');
  const [resultatNotifications, setResultatNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('CREATION');

  // ============================================
  // TEST 1 : CRÉATION DE TONTINE
  // ============================================
  const testerCreation = () => {
    const tests = [
      {
        test: 'Test 1 : KYC insuffisant (Niveau 1)',
        ...tontineService.canCreateTontine({
          kycLevel: 1,
          reputation: 85,
          tontinesActives: 1,
        }),
      },
      {
        test: 'Test 2 : Réputation insuffisante (50%)',
        ...tontineService.canCreateTontine({
          kycLevel: 2,
          reputation: 50,
          tontinesActives: 1,
        }),
      },
      {
        test: 'Test 3 : Trop de tontines actives (3)',
        ...tontineService.canCreateTontine({
          kycLevel: 2,
          reputation: 85,
          tontinesActives: 3,
        }),
      },
      {
        test: 'Test 4 : Toutes les conditions OK',
        ...tontineService.canCreateTontine({
          kycLevel: 2,
          reputation: 85,
          tontinesActives: 1,
        }),
      },
    ];

    setResultatsCreation(tests);
  };

  // ============================================
  // TEST 2 : CALCUL DES PÉNALITÉS
  // ============================================
  const testerPenalites = () => {
    const dateEcheance = new Date('2026-03-01');
    const datePaiement = new Date('2026-03-06');
    
    const penalite = tontineService.calculatePenalite(
      dateEcheance,
      datePaiement,
      500
    );

    setResultatPenalite(
      `Date d'échéance : 01 Mars 2026\n` +
      `Date de paiement : 06 Mars 2026\n` +
      `Jours de retard : 5 jours\n` +
      `Pénalité par jour : 500 FCFA\n` +
      `Pénalité totale : ${penalite} FCFA`
    );
  };

  // ============================================
  // TEST 3 : RÉPUTATION
  // ============================================
  const testerReputation = () => {
    let membre: Membre = {
        id: 'M001',
        nom: 'Jean Kouassi',
        telephone: '+228 90 00 00 00',
        reputation: 80,
        statut: 'ACTIF',
        nbRetards: 0,
        nbAbsences: 0,
        toursRecus: 0,
    };

    let historique = `Réputation initiale : 80%\n\n`;

    // Paiement à temps
    membre = tontineService.updateReputation(membre, 'PAIEMENT');
    historique += `✅ Paiement à temps : +${REGLES.BONUS_PAIEMENT_A_TEMPS} points → ${membre.reputation}%\n`;

    // Retard
    membre = tontineService.updateReputation(membre, 'RETARD');
    historique += `⚠️ Retard : -${REGLES.PENALITE_RETARD_REPUTATION} points → ${membre.reputation}%\n`;

    // Absence
    membre = tontineService.updateReputation(membre, 'ABSENCE');
    historique += `❌ Absence : -${REGLES.PENALITE_NON_PAIEMENT_REPUTATION} points → ${membre.reputation}%\n`;

    // Abandon
    membre = tontineService.updateReputation(membre, 'ABANDON');
    historique += `🚫 Abandon : -${REGLES.PENALITE_ABANDON_REPUTATION} points → ${membre.reputation}%\n`;
    historique += `\nStatut final : ${membre.statut}`;

    setResultatReputation(historique);
  };

  // ============================================
  // TEST 4 : NOTIFICATIONS
  // ============================================
  const testerNotifications = () => {
    const messages: string[] = [];

    // Rappels
    const rappels = notificationService.genererRappelsCotisation(
      'Tontine des Amis',
      50000,
      new Date('2026-03-15')
    );
    messages.push(`📋 Rappels générés : ${rappels.length}`);

    // Retard
    const retard = notificationService.notifierRetard(
      'Tontine des Amis',
      'Pierre Mensah',
      50000,
      3
    );
    messages.push(`⚠️ ${retard.titre}: ${retard.message}`);

    // Pénalité
    const penalite = notificationService.notifierPenalite(
      'Tontine des Amis',
      'Pierre Mensah',
      1500
    );
    messages.push(`💸 ${penalite.titre}: ${penalite.message}`);

    // Distribution
    const distribution = notificationService.notifierDistribution(
      'Tontine des Amis',
      'Marie Adjoua',
      500000,
      3
    );
    messages.push(`🎉 ${distribution.titre}: ${distribution.message}`);

    setResultatNotifications(messages);
  };

  const tabs = [
    { id: 'CREATION', label: 'Règles de création', icon: Shield, action: testerCreation },
    { id: 'PENALITES', label: 'Pénalités', icon: DollarSign, action: testerPenalites },
    { id: 'REPUTATION', label: 'Réputation', icon: TrendingUp, action: testerReputation },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell, action: testerNotifications },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Démonstration Logique Métier</h1>
        <p className="text-gray-700 font-medium mt-1 dark:text-gray-300">
          Testez les règles métier en action
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2 dark:bg-gray-800 dark:border-gray-600">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  tab.action();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Résultats */}
      <div className="space-y-4">
        {/* Test 1 : Création */}
        {activeTab === 'CREATION' && resultatsCreation.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">
              Résultats des tests de création
            </h2>
            <div className="space-y-3">
              {resultatsCreation.map((resultat, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    resultat.success
                      ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                      : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {resultat.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{resultat.test}</p>
                      <p className={`text-sm font-medium ${resultat.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {resultat.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test 2 : Pénalités */}
        {activeTab === 'PENALITES' && resultatPenalite && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">
              Résultat du calcul de pénalité
            </h2>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 dark:bg-yellow-900 dark:border-yellow-700">
              <pre className="font-bold text-gray-900 dark:text-white whitespace-pre-line">
                {resultatPenalite}
              </pre>
            </div>
          </div>
        )}

        {/* Test 3 : Réputation */}
        {activeTab === 'REPUTATION' && resultatReputation && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">
              Évolution de la réputation
            </h2>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 dark:bg-purple-900 dark:border-purple-700">
              <pre className="font-bold text-gray-900 dark:text-white whitespace-pre-line">
                {resultatReputation}
              </pre>
            </div>
          </div>
        )}

        {/* Test 4 : Notifications */}
        {activeTab === 'NOTIFICATIONS' && resultatNotifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600">
            <h2 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">
              Notifications générées
            </h2>
            <div className="space-y-3">
              {resultatNotifications.map((message, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700"
                >
                  <p className="font-bold text-gray-900 dark:text-white">{message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info règles */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 dark:bg-gray-800 dark:border-gray-600">
        <h3 className="font-bold text-gray-900 mb-2 dark:text-white">Règles métier implémentées :</h3>
        <ul className="space-y-1 text-sm text-gray-700 font-medium dark:text-gray-300">
          <li>• KYC Niveau 2 minimum pour créer une tontine</li>
          <li>• Réputation minimum : {REGLES.REPUTATION_MIN_POUR_CREER}%</li>
          <li>• Maximum : {REGLES.MAX_TONTINES_SIMULTANEES} tontines simultanées</li>
          <li>• Bonus paiement : +{REGLES.BONUS_PAIEMENT_A_TEMPS} points</li>
          <li>• Pénalité retard : -{REGLES.PENALITE_RETARD_REPUTATION} points</li>
          <li>• Pénalité absence : -{REGLES.PENALITE_NON_PAIEMENT_REPUTATION} points</li>
          <li>• Pénalité abandon : -{REGLES.PENALITE_ABANDON_REPUTATION} points</li>
        </ul>
      </div>
    </div>
  );
}