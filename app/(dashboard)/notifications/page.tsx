// app/(dashboard)/notifications/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  notificationService, 
  NOTIFICATIONS_SIMULEES,
  Notification,
  NotificationType 
} from '../../../lib/services/notification-service';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Mail,
  Trash2,
  Check,
  Search,
  Filter
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS_SIMULEES);
  const [filterType, setFilterType] = useState<NotificationType | 'TOUTES'>('TOUTES');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les notifications
  const notificationsFiltrees = notifications.filter(n => {
    const matchType = filterType === 'TOUTES' || n.type === filterType;
    const matchSearch = n.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const nonLues = notificationService.compterNonLues(notifications);

  const handleMarquerCommeLue = (id: string) => {
    setNotifications(notificationService.marquerCommeLue(notifications, id));
  };

  const handleMarquerToutCommeLu = () => {
    setNotifications(notificationService.marquerToutCommeLu(notifications));
  };

  const handleSupprimer = (id: string) => {
    setNotifications(notificationService.supprimerNotification(notifications, id));
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'RAPPEL': return Clock;
      case 'ECHEANCE': return AlertCircle;
      case 'RETARD': return AlertCircle;
      case 'PENALITE': return DollarSign;
      case 'DISTRIBUTION': return TrendingUp;
      case 'PAIEMENT': return CheckCircle;
      case 'INVITATION': return Mail;
      default: return Bell;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'RAPPEL': return 'bg-yellow-100 text-yellow-800';
      case 'ECHEANCE': return 'bg-orange-100 text-orange-800';
      case 'RETARD': return 'bg-red-100 text-red-800';
      case 'PENALITE': return 'bg-red-100 text-red-800';
      case 'DISTRIBUTION': return 'bg-green-100 text-green-800';
      case 'PAIEMENT': return 'bg-blue-100 text-blue-800';
      case 'INVITATION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'RAPPEL': return 'Rappel';
      case 'ECHEANCE': return 'Échéance';
      case 'RETARD': return 'Retard';
      case 'PENALITE': return 'Pénalité';
      case 'DISTRIBUTION': return 'Distribution';
      case 'PAIEMENT': return 'Paiement';
      case 'INVITATION': return 'Invitation';
      case 'INFO': return 'Info';
      default: return type;
    }
  };

  const formatDate = (date: Date) => {
    const maintenant = new Date();
    const diff = maintenant.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const heures = Math.floor(diff / (1000 * 60 * 60));
    const jours = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (heures < 24) return `Il y a ${heures}h`;
    if (jours < 7) return `Il y a ${jours}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const types = [
    { id: 'TOUTES', label: 'Toutes' },
    { id: 'RAPPEL', label: 'Rappels' },
    { id: 'RETARD', label: 'Retards' },
    { id: 'PENALITE', label: 'Pénalités' },
    { id: 'DISTRIBUTION', label: 'Distributions' },
    { id: 'PAIEMENT', label: 'Paiements' },
    { id: 'INVITATION', label: 'Invitations' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-700 font-medium dark:text-gray-300">
              {nonLues > 0 ? `${nonLues} notification${nonLues > 1 ? 's' : ''} non lue${nonLues > 1 ? 's' : ''}` : 'Toutes vos notifications'}
            </p>
          </div>
        </div>
        {nonLues > 0 && (
          <button
            onClick={handleMarquerToutCommeLu}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm"
          >
            <Check className="h-4 w-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Rechercher une notification..."
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id as NotificationType | 'TOUTES')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              filterType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Liste des notifications */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-600">
        {notificationsFiltrees.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-700 font-medium dark:text-gray-300">
              {searchTerm || filterType !== 'TOUTES' 
                ? 'Aucun résultat pour votre recherche' 
                : 'Vous n\'avez aucune notification pour le moment'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {notificationsFiltrees.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notification.lu ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {notification.titre}
                          </h3>
                          {!notification.lu && (
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium mt-1 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(notification.type)}`}>
                            {getTypeLabel(notification.type)}
                          </span>
                          <span className="text-xs text-gray-600 font-medium dark:text-gray-400">
                            {formatDate(notification.date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.lu && (
                          <button
                            onClick={() => handleMarquerCommeLue(notification.id)}
                            className="p-2 hover:bg-gray-200 rounded-lg dark:hover:bg-gray-600"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSupprimer(notification.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg dark:hover:bg-gray-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {notification.lien && (
                      <Link
                        href={notification.lien}
                        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
                      >
                        Voir plus →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
