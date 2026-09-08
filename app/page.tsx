'use client';

import Link from 'next/link';
import { Wallet, Shield, Users, ArrowRight, CheckCircle, Lock, History } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">TontineSecure</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          La Tontine en Ligne
          <span className="block text-blue-600 mt-2">Sécurisée et Transparente</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Organisez vos tontines en toute confiance avec des règles de sécurité avancées,
          une traçabilité complète et une gestion transparente des cotisations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Pourquoi choisir TontineSecure ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sécurité Maximale</h3>
            <p className="text-gray-600">
              Vérification d'identité, séquestre des fonds et validation multi-signatures
              pour protéger chaque transaction.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion de Groupe</h3>
            <p className="text-gray-600">
              Créez des tontines avec vos amis, votre famille ou vos collègues.
              Gérez les membres et les règles facilement.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Traçabilité Totale</h3>
            <p className="text-gray-600">
              Historique complet et immuable de toutes les transactions,
              accessible à tous les membres du groupe.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Séquestre des Fonds</h3>
            <p className="text-gray-600">
              Les cotisations sont conservées dans un compte séquestre jusqu'au
              versement au bénéficiaire du tour.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Système de Réputation</h3>
            <p className="text-gray-600">
              Les membres gagnent en réputation selon leur ponctualité
              et leur fiabilité dans les paiements.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiement Mobile</h3>
            <p className="text-gray-600">
              Collectez les cotisations via Orange Money, MTN Money,
              Wave et autres solutions locales.
            </p>
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Créez votre groupe</h3>
              <p className="text-sm text-gray-600">
                Définissez le montant, la fréquence et les règles de votre tontine
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Invitez les membres</h3>
              <p className="text-sm text-gray-600">
                Chaque membre vérifie son identité et rejoint le groupe
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cotisez en ligne</h3>
              <p className="text-sm text-gray-600">
                Les paiements sont sécurisés et tracés via Mobile Money
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Recevez votre tour</h3>
              <p className="text-sm text-gray-600">
                Le bénéficiaire reçoit la collecte selon l'ordre établi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à démarrer votre tontine ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers de personnes qui font confiance à TontineSecure
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 TontineSecure. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}