import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation globale',
      items: [
        { keys: 'Ctrl+N', description: 'Nouvelle partie' },
        { keys: 'Ctrl+H', description: 'Historique des parties' },
        { keys: 'Ctrl+S', description: 'Statistiques' },
        { keys: 'Ctrl+,', description: 'Paramètres' },
        { keys: 'Ctrl+Q', description: 'Quitter l\'application' },
        { keys: 'F1', description: 'Afficher cette aide' },
        { keys: 'Échap', description: 'Retour/Annuler' },
      ],
    },
    {
      category: 'En jeu',
      items: [
        { keys: 'Ctrl+Enter', description: 'Valider la manche courante' },
        { keys: 'Ctrl+Z', description: 'Annuler la dernière manche' },
        { keys: 'Tab', description: 'Navigation entre champs' },
        { keys: 'Échap', description: 'Annuler la saisie' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">⌨️ Raccourcis clavier</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Les raccourcis peuvent être activés ou désactivés dans les paramètres
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
