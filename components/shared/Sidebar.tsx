// components/shared/Sidebar.tsx
'use client';

import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Shield, 
  LogOut,
  TrendingUp,
  X,
  Menu,
  Bell,
  History,
  Settings,
  Mail
} from 'lucide-react';
import { useState } from 'react';
import { notificationService, NOTIFICATIONS_SIMULEES } from '../../lib/services/notification-service';
import { invitationService, INVITATIONS_SIMULEES } from '../../lib/services/invitation-service';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mes Tontines', href: '/tontines', icon: Users },
  { name: 'Portefeuille', href: '/portefeuille', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Invitations', href: '/invitations', icon: Mail },
  { name: 'Vérification', href: '/verification', icon: Shield },
  { name: 'Sécurité', href: '/securite', icon: Shield },
  { name: 'Paramètres', href: '/parametres', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const nonLues = notificationService.compterNonLues(NOTIFICATIONS_SIMULEES);
  const invitationsEnAttente = invitationService.compterEnAttente(INVITATIONS_SIMULEES);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    toast.success('Déconnexion réussie !');
    await logout();
  };

  // Initiales de l'utilisateur
  const initiales = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>

      {/* Overlay sombre */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          w-64 bg-gray-900 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-800">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">TontineSecure</h1>
            <p className="text-xs text-gray-400 truncate">Tontine en ligne</p>
          </div>
          <button
            onClick={closeMenu}
            className="lg:hidden p-1 hover:bg-gray-800 rounded-lg flex-shrink-0"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                
                {item.name === 'Notifications' && nonLues > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {nonLues}
                  </span>
                )}
                
                {item.name === 'Invitations' && invitationsEnAttente > 0 && (
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {invitationsEnAttente}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Info utilisateur */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{initiales}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@email.com'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1 hover:bg-gray-800 rounded-lg flex-shrink-0" 
              aria-label="Déconnexion"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}