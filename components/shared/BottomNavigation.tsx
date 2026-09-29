// components/shared/BottomNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  PlusCircle, 
  Wallet, 
  User 
} from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Tontines', href: '/tontines', icon: Users },
    { name: 'Créer', href: '/tontines/creer', icon: PlusCircle, special: true },
    { name: 'Portefeuille', href: '/portefeuille', icon: Wallet },
    { name: 'Profil', href: '/parametres', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-end h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          
          if (item.special) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex min-w-0 flex-col items-center justify-center -mt-6"
              >
                <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="mt-1 max-w-full truncate px-1 text-[10px] text-gray-600">{item.name}</span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center px-1 py-2 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="mt-1 max-w-full truncate px-1 text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
