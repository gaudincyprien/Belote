import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaRedo, FaCog } from 'react-icons/fa';
import type { AppSettings } from '../../shared/types';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbPath, setDbPath] = useState('');
  const [dbSize, setDbSize] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDbInfo();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      if (window.electron?.getAllSettings) {
        const currentSettings = await window.electron.getAllSettings();
        setSettings(currentSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDbInfo = async () => {
    try {
      if (window.electron?.getSettingsPath && window.electron?.getSettingsSize) {
        const path = await window.electron.getSettingsPath();
        const size = await window.electron.getSettingsSize();
        setDbPath(path);
        setDbSize(size);
      }
    } catch (error) {
      console.error('Error loading DB info:', error);
    }
  };

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (!settings || !hasChanges) return;

    setIsSaving(true);
    try {
      if (window.electron?.updateSettings) {
        await window.electron.updateSettings(settings);

        // Toggle shortcuts if the setting changed
        if (window.electron?.toggleShortcuts) {
          await window.electron.toggleShortcuts(settings.raccourcisActives);
        }

        setHasChanges(false);
        alert('Paramètres sauvegardés avec succès');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadSettings();
    setHasChanges(false);
  };

  const handleResetAll = async () => {
    const confirmed = confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?');
    if (!confirmed) return;

    try {
      if (window.electron?.resetAllSettings) {
        await window.electron.resetAllSettings();
        await loadSettings();
        setHasChanges(false);
        alert('Tous les paramètres ont été réinitialisés');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('Erreur lors de la réinitialisation');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
              <FaCog />
              <span>Paramètres</span>
            </h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎮 Jeu
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil de victoire (points)
              </label>
              <input
                type="number"
                value={settings.seuilVictoire}
                onChange={(e) => handleChange('seuilVictoire', parseInt(e.target.value, 10))}
                min="100"
                max="10000"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Entre 100 et 10000 points</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="confirmationSuppression"
                checked={settings.confirmationSuppression}
                onChange={(e) => handleChange('confirmationSuppression', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="confirmationSuppression" className="text-sm font-medium text-gray-700">
                Demander confirmation avant suppression
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sonNotifications"
                checked={settings.sonNotifications}
                onChange={(e) => handleChange('sonNotifications', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="sonNotifications" className="text-sm font-medium text-gray-700">
                Son des notifications
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎨 Apparence
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
              <div className="flex gap-4">
                {[
                  { value: 'light', label: 'Clair' },
                  { value: 'dark', label: 'Sombre' },
                  { value: 'auto', label: 'Auto (système)' },
                ].map((theme) => (
                  <label key={theme.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={settings.theme === theme.value}
                      onChange={(e) => handleChange('theme', e.target.value as AppSettings['theme'])}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille de police</label>
              <div className="flex gap-4">
                {[
                  { value: 'small', label: 'Petit' },
                  { value: 'medium', label: 'Moyen' },
                  { value: 'large', label: 'Grand' },
                ].map((size) => (
                  <label key={size.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="taillePolice"
                      value={size.value}
                      checked={settings.taillePolice === size.value}
                      onChange={(e) =>
                        handleChange('taillePolice', e.target.value as AppSettings['taillePolice'])
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{size.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ⌨️ Raccourcis clavier
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="raccourcisActives"
              checked={settings.raccourcisActives}
              onChange={(e) => handleChange('raccourcisActives', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="raccourcisActives" className="text-sm font-medium text-gray-700">
              Activer les raccourcis clavier
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Les raccourcis seront implémentés dans DEV-013
          </p>
        </div>

        {/* Language */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🌍 Langue
          </h2>
          <div className="flex gap-4">
            {[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
            ].map((lang) => (
              <label key={lang.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="langue"
                  value={lang.value}
                  checked={settings.langue === lang.value}
                  onChange={(e) => handleChange('langue', e.target.value)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💾 Données
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Emplacement de la configuration:</p>
              <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mt-1 break-all">
                {dbPath}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taille: {formatBytes(dbSize)}</p>
            </div>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaRedo />
              <span>Réinitialiser tous les paramètres</span>
            </button>
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {hasChanges && (
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 justify-end">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <FaCheck />
              <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
