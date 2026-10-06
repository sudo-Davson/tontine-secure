// hooks/useContacts.ts
'use client';

import { useState } from 'react';

export interface Contact {
  name: string[];
  tel: string[];
}

export function useContacts() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'API Contacts est supportée
  const checkSupport = () => {
    if (typeof window === 'undefined') return false;
    const supported = 'contacts' in navigator && 'ContactsManager' in window;
    setIsSupported(supported);
    return supported;
  };

  // Sélectionner un contact
  const pickContact = async (): Promise<Contact | null> => {
    setError(null);

    // Vérifier le support
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      setError('Votre navigateur ne supporte pas la sélection de contacts. Veuillez saisir le numéro manuellement.');
      return null;
    }

    try {
      setIsLoading(true);

      const props = ['name', 'tel'];
      const options = { multiple: false };

      // @ts-ignore - ContactsManager n'est pas dans les types TypeScript standards
      const contacts = await (navigator as any).contacts.select(props, options);

      if (contacts && contacts.length > 0) {
        return contacts[0] as Contact;
      }

      return null;
    } catch (err: any) {
      console.error('Erreur contacts:', err);
      setError('Impossible d\'accéder aux contacts. Vérifiez les permissions.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isLoading,
    error,
    checkSupport,
    pickContact,
  };
}