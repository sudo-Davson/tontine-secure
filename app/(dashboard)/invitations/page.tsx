// app/(dashboard)/invitations/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { invitationService, INVITATIONS_SIMULEES, Invitation } from '../../../lib/services/invitation-service';
import { 
  Mail, 
  CheckCircle, 
  XCircle,
  Users,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  Search
} from 'lucide-react';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>(INVITATIONS_SIMULEES);
  const [filterStatut, setFilterStatut] = useState<'TOUTES' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE'>('TOUTES');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAccepter = (id: string) => {
    setInvitations(invitationService.accepterInvitation(invitations, id));
    // Rediriger vers la tontine
    const invitation = invitations.find(inv => inv.id === id);
    if (invitation) {
      setTimeout(() => {
        window.location.href = `/tontines/${invitation.tontineId}`;
      }, 500);
    }
  };

  const handleRefuser = (id: string) => {
    setInvitations(invitationService.refuserInvitation(invitations, id));
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTEE': return 'bg-green-100 text-green-800';
      case 'REFUSEE': return 'bg-red-100 text-red-800';
      case 'EXPIREE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ACCEPTEE': return 'Acceptée';
      case 'REFUSEE': return 'Refusée';
      case 'EXPIREE': return 'Expirée';
      default: return statut;
    }
  };

  const getFrequenceLabel = (freq: string) => {
    switch (freq) {
      case 'HEBDOMADAIRE': return 'Hebdomadaire';
      case 'MENSUEL': return 'Mensuel';
      case 'TRIMESTRIEL': return 'Trimestriel';
      default: return freq;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getJoursRestants = (dateExpiration: Date) => {
    const diff = new Date(dateExpiration).getTime() - new Date().getTime();
    const jours = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (jours < 0) return 'Expirée';
    if (jours === 0) return 'Expire aujourd\'hui';
    if (jours === 1) return 'Expire demain';
    return `Expire dans ${jours} jours`;
  };

  const invitationsFiltrees = invitations.filter(inv => {
    const matchStatut = filterStatut === 'TOUTES' || inv.statut === filterStatut;
    const matchSearch = inv.tontineNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.createurNom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatut && matchSearch;
  });

  const enAttente = invitationService.compterEnAttente(invitations);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invitations</h1>
            <p className="text-gray-700 font-medium dark:text-gray-300">
              {enAttente > 0 ? `${enAttente} invitation${enAttente > 1 ? 's' : ''} en attente` : 'Toutes vos invitations'}
            </p>
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500 bg-white font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Rechercher une invitation..."
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'TOUTES', label: 'Toutes' },
          { id: 'EN_ATTENTE', label: 'En attente' },
          { id: 'ACCEPTEE', label: 'Acceptées' },
          { id: 'REFUSEE', label: 'Refusées' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilterStatut(filter.id as any)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              filterStatut === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Liste des invitations */}
      {invitationsFiltrees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center dark:bg-gray-800 dark:border-gray-600">
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Aucune invitation
          </h3>
          <p className="text-gray-700 font-medium dark:text-gray-300 mb-4">
            {searchTerm || filterStatut !== 'TOUTES'
              ? 'Aucun résultat pour votre recherche'
              : 'Vous n\'avez aucune invitation pour le moment'}
          </p>
          <Link
            href="/tontines"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
          >
            Voir mes tontines
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitationsFiltrees.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-600"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{invitation.tontineNom}</h3>
                    <p className="text-sm text-gray-700 font-medium dark:text-gray-300 mt-1">
                      {invitation.tontineDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {invitation.createurNom.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700 font-medium dark:text-gray-300">
                        Invité par {invitation.createurNom}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutColor(invitation.statut)}`}>
                  {getStatutLabel(invitation.statut)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Montant</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {invitation.montantCotisation.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Fréquence</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getFrequenceLabel(invitation.frequence)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600 font-bold">Expiration</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {getJoursRestants(invitation.dateExpiration)}
                    </p>
                  </div>
                </div>
              </div>

              {invitation.statut === 'EN_ATTENTE' && !invitationService.isExpiree(invitation) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRefuser(invitation.id)}
                    className="flex-1 py-2.5 px-4 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors font-bold"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleAccepter(invitation.id)}
                    className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Accepter
                  </button>
                </div>
              )}

              {invitation.statut === 'ACCEPTEE' && (
                <Link
                  href={`/tontines/${invitation.tontineId}`}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  Voir la tontine
                  <ChevronRight className="h-5 w-5" />
                </Link>
              )}

              {invitation.statut === 'REFUSEE' && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Vous avez refusé cette invitation
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}