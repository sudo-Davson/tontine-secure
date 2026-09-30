// components/shared/ContactPicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Phone, BookUser, AlertCircle } from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import toast from 'react-hot-toast';

interface ContactPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function ContactPicker({
  value,
  onChange,
  label = 'Numéro de téléphone',
  placeholder = '+228 XX XX XX XX',
  required = false,
}: ContactPickerProps) {
  const { isSupported, isLoading, error, checkSupport, pickContact } = useContacts();

  useEffect(() => {
    checkSupport();
  }, []);

  const handlePickContact = async () => {
    const contact = await pickContact();

    if (contact && contact.tel && contact.tel.length > 0) {
      // Prendre le premier numéro
      let phone = contact.tel[0];

      // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
      phone = phone.replace(/[\s\-\(\)]/g, '');

      // Ajouter +228 si pas de préfixe international
      if (!phone.startsWith('+')) {
        // Si le numéro commence par 90, 91, 92, 93, 98, 99 (Togo)
        if (/^(90|91|92|93|98|99|70|71|72|73|78|79)/.test(phone)) {
          phone = '+228' + phone;
        }
      }

      onChange(phone);

      const contactName = contact.name && contact.name.length > 0
        ? contact.name[0]
        : 'Contact';
      toast.success(`Numéro de ${contactName} sélectionné`);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
        {label} {required && '*'}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black dark:text-white bg-white dark:bg-gray-700 font-medium"
            placeholder={placeholder}
            required={required}
          />
        </div>

        <button
          type="button"
          onClick={handlePickContact}
          disabled={isLoading}
          className={`px-4 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 flex-shrink-0 ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title="Sélectionner depuis les contacts"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <BookUser className="h-5 w-5" />
          )}
          <span className="hidden sm:inline">Contacts</span>
        </button>
      </div>

      {!isSupported && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Sélection de contacts non supportée sur cet appareil. Saisissez le numéro manuellement.
        </p>
      )}
    </div>
  );
}