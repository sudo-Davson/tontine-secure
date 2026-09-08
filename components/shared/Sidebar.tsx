// components/shared/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Settings, 
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
  Shield,
  History
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes Tontines', href: '/tontines', icon: Users },
  { name: 'Portefeuille', href: '/portefeuille', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Sécurité', href: '/securite', icon: Shield },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
  { name: 'Vérification', href: '/verification', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Bouton menu mobile - TOUJOURS VISIBLE avec fond bleu */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Menu"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
      </button>

      {/* Overlay pour mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-gray-900 flex flex-col z-40
      `}>
        {/* Logo - texte BLANC */}
        <div className="flex items-center gap-2 px-6 py-8">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TontineSecure</h1>
            <p className="text-xs text-gray-300">Tontine en ligne</p>
          </div>
        </div>

        {/* Navigation - texte BLANC */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Stats rapides - texte BLANC */}
        <div className="px-3 mb-4">
          <div className="rounded-lg bg-gray-800 p-3">
            <p className="text-xs font-semibold text-white mb-2">Mes Tontines</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1 text-gray-200">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Actives
                </span>
                <span className="text-xs font-bold text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1 text-gray-200">
                  <AlertCircle className="h-3 w-3 text-yellow-400" />
                  En attente
                </span>
                <span className="text-xs font-bold text-white">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* User info - texte BLANC */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">U</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Utilisateur</p>
              <p className="text-xs text-gray-300">user@email.com</p>
            </div>
            <button className="text-gray-300 hover:text-white">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}