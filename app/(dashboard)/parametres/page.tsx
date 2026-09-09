// app/(dashboard)/parametres/page.tsx
'use client';
import { useTheme } from '../../../context/ThemeContext';
import { useState } from 'react';
import { 
  User, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Mail,
  Phone,
  CheckCircle,
  ChevronRight,
  Camera,
  Shield,
  Wallet,
  CreditCard,
  Languages,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('PROFIL'); // PROFIL, NOTIFICATIONS, PREFERENCES
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: 'Jean',
    lastName: 'Kouassi',
    email: 'jean.kouassi@email.com',
    phone: '+228 90 12 34 56',
    langue: 'FR',
    devise: 'XOF',
    fuseauHoraire: 'Africa/Lome',
  });

  const [notifications, setNotifications] = useState({
    cotisations: true,
    tours: true,
    paiements: true,
    securite: true,
    newsletter: false,
    sms: true,
    email: true,
    push: true,
  });

  const [preferences, setPreferences] = useState({
    theme: 'LIGHT',
    langue: 'FR',
    devise: 'XOF',
    formatMontant: 'ESPACE',
    confirmationTransactions: true,
    verificationBiometrique: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleNotification = (name: string) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name as keyof typeof notifications],
    });
  };

  const handleTogglePreference = (name: string) => {
    setPreferences({
      ...preferences,
      [name]: !preferences[name as keyof typeof preferences],
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('✅ Profil mis à jour avec succès !');
  };

  const handleSaveNotifications = () => {
    alert('✅ Préférences de notifications enregistrées !');
  };

  const handleSavePreferences = () => {
    alert('✅ Préférences enregistrées !');
  };

  const inputClassName = "w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500 bg-white font-medium";
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2";

  const tabs = [
    { id: 'PROFIL', label: 'Profil', icon: User },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'PREFERENCES', label: 'Préférences', icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-700 font-medium mt-1">
          Gérez votre profil et vos préférences
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== ONGLET PROFIL ========== */}
      {activeTab === 'PROFIL' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 text-center">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">JK</span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <h3 className="font-bold text-gray-900 mt-3">Jean Kouassi</h3>
            <p className="text-sm text-gray-700 font-medium">Membre depuis Janvier 2026</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Informations personnelles</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                />
              </div>
              <div>
                <label className={labelClassName}>Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClassName} pl-10`}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${inputClassName} pl-10`}
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              Enregistrer les modifications
            </button>
          </form>

          {/* Vérification */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Vérification</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">Email vérifié</p>
                    <p className="text-sm text-gray-700 font-medium">{formData.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">Téléphone vérifié</p>
                    <p className="text-sm text-gray-700 font-medium">{formData.phone}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">Identité vérifiée (KYC Niveau 2)</p>
                    <p className="text-sm text-gray-700 font-medium">CNI vérifiée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== ONGLET NOTIFICATIONS ========== */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Types de notifications</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Rappels de cotisation</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Rappels avant chaque échéance de cotisation
                  </p>
                </div>
                <button
                  onClick={() => handleToggleNotification('cotisations')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.cotisations ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.cotisations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Tours de collecte</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Notification quand c'est votre tour
                  </p>
                </div>
                <button
                  onClick={() => handleToggleNotification('tours')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.tours ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.tours ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Paiements</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Confirmation des paiements et réceptions
                  </p>
                </div>
                <button
                  onClick={() => handleToggleNotification('paiements')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.paiements ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.paiements ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Sécurité</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Alertes de connexion et sécurité du compte
                  </p>
                </div>
                <button
                  onClick={() => handleToggleNotification('securite')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.securite ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.securite ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Actualités et mises à jour
                  </p>
                </div>
                <button
                  onClick={() => handleToggleNotification('newsletter')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.newsletter ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.newsletter ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Méthodes de notification</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <p className="font-bold text-gray-900">SMS</p>
                </div>
                <button
                  onClick={() => handleToggleNotification('sms')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.sms ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.sms ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <p className="font-bold text-gray-900">Email</p>
                </div>
                <button
                  onClick={() => handleToggleNotification('email')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <p className="font-bold text-gray-900">Push</p>
                </div>
                <button
                  onClick={() => handleToggleNotification('push')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.push ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveNotifications}
              className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              Enregistrer les préférences
            </button>
          </div>
        </div>
      )}

      {/* ========== ONGLET PRÉFÉRENCES ========== */}
      {activeTab === 'PREFERENCES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Apparence</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                    onClick={() => setTheme('LIGHT')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    theme === 'LIGHT'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                >
                    <Sun className={`h-8 w-8 mx-auto mb-2 ${theme === 'LIGHT' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-bold text-gray-900 dark:text-white">Clair</p>
                </button>
                <button
                    onClick={() => setTheme('DARK')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    theme === 'DARK'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                >
                    <Moon className={`h-8 w-8 mx-auto mb-2 ${theme === 'DARK' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="font-bold text-gray-900 dark:text-white">Sombre</p>
                </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Langue</label>
                <select
                  value={preferences.langue}
                  onChange={(e) => setPreferences({ ...preferences, langue: e.target.value })}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                >
                  <option value="FR">Français</option>
                  <option value="EN">English</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>Devise</label>
                <select
                  value={preferences.devise}
                  onChange={(e) => setPreferences({ ...preferences, devise: e.target.value })}
                  className={inputClassName}
                  style={{ color: '#000000' }}
                >
                  <option value="XOF">FCFA - Franc CFA (UEMOA)</option>
                  <option value="XAF">FCFA - Franc CFA (CEMAC)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Sécurité des transactions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Confirmation des transactions</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Demander confirmation avant chaque transaction
                  </p>
                </div>
                <button
                  onClick={() => handleTogglePreference('confirmationTransactions')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.confirmationTransactions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.confirmationTransactions ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">Vérification biométrique</p>
                  <p className="text-sm text-gray-700 font-medium">
                    Utiliser empreinte digitale ou Face ID
                  </p>
                </div>
                <button
                  onClick={() => handleTogglePreference('verificationBiometrique')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences.verificationBiometrique ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    preferences.verificationBiometrique ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              Enregistrer les préférences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}