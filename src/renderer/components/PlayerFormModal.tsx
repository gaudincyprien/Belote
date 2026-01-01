import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { validatePlayerName, isPlayerFormValid } from '../utils/playerValidation';

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nom: string) => Promise<void>;
  title: string;
  initialName?: string;
  submitLabel?: string;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialName = '',
  submitLabel = 'Créer'
}) => {
  const [nom, setNom] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNom(initialName);
    }
  }, [isOpen, initialName]);

  // Validation
  const errors = useMemo(() => validatePlayerName(nom), [nom]);
  const isValid = useMemo(() => isPlayerFormValid(nom, errors), [nom, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(nom.trim());
      onClose();
    } catch (error) {
      console.error('Error submitting player:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom du joueur
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Entrez le nom..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          {errors.nom && (
            <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-all ${
              isValid && !isSubmitting
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'En cours...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlayerFormModal;
