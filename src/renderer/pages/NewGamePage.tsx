import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import type { GameMode } from '../../shared/types';
import {
  validatePlayerNames,
  isFormValid as checkFormValidity,
  type PlayerNames,
  type ValidationErrors,
} from '../utils/gameValidation';
import PlayerAutocompleteInput from '../components/PlayerAutocompleteInput';

const NewGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>('4_joueurs');
  const [playerNames, setPlayerNames] = useState<PlayerNames>({
    player1: '',
    player2: '',
    player3: '',
    player4: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation logic
  const validationErrors = useMemo((): ValidationErrors => {
    return validatePlayerNames(playerNames, gameMode);
  }, [playerNames, gameMode]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return checkFormValidity(playerNames, gameMode, validationErrors);
  }, [playerNames, gameMode, validationErrors]);

  const handlePlayerNameChange = (playerKey: keyof PlayerNames, value: string) => {
    setPlayerNames(prev => ({
      ...prev,
      [playerKey]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      // Trim all names
      const trimmedNames = {
        player1: playerNames.player1.trim(),
        player2: playerNames.player2.trim(),
        player3: playerNames.player3.trim(),
        player4: playerNames.player4.trim(),
      };

      // Create game via IPC
      if (window.electron?.createGame) {
        const gameId = await window.electron.createGame({
          mode: gameMode,
          playerNames: gameMode === '4_joueurs'
            ? [trimmedNames.player1, trimmedNames.player2, trimmedNames.player3, trimmedNames.player4]
            : [trimmedNames.player1, trimmedNames.player2, trimmedNames.player3],
        });

        // Navigate to game page
        navigate(`/game/${gameId}`);
      } else {
        console.error('electron.createGame is not available');
        // For development, navigate anyway
        navigate('/game/1');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Erreur lors de la création de la partie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-6">
            Nouvelle partie
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mode de jeu
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="gameMode"
                    value="4_joueurs"
                    checked={gameMode === '4_joueurs'}
                    onChange={(e) => setGameMode(e.target.value as GameMode)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-900">4 joueurs (2 équipes de 2)</span>
                </label>
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="gameMode"
                    value="3_joueurs"
                    checked={gameMode === '3_joueurs'}
                    onChange={(e) => setGameMode(e.target.value as GameMode)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-900">3 joueurs</span>
                </label>
              </div>
            </div>

            {/* Player names */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Noms des joueurs
              </label>

              {gameMode === '4_joueurs' ? (
                <div className="space-y-4">
                  {/* Team A */}
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="text-sm font-semibold text-blue-700 mb-3">Équipe A</div>
                    <div className="space-y-3">
                      <PlayerAutocompleteInput
                        value={playerNames.player1}
                        onChange={(value) => handlePlayerNameChange('player1', value)}
                        placeholder="Nom joueur 1"
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        error={validationErrors.player1}
                      />
                      <PlayerAutocompleteInput
                        value={playerNames.player3}
                        onChange={(value) => handlePlayerNameChange('player3', value)}
                        placeholder="Nom joueur 3"
                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        error={validationErrors.player3}
                      />
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                    <div className="text-sm font-semibold text-red-700 mb-3">Équipe B</div>
                    <div className="space-y-3">
                      <PlayerAutocompleteInput
                        value={playerNames.player2}
                        onChange={(value) => handlePlayerNameChange('player2', value)}
                        placeholder="Nom joueur 2"
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        error={validationErrors.player2}
                      />
                      <PlayerAutocompleteInput
                        value={playerNames.player4}
                        onChange={(value) => handlePlayerNameChange('player4', value)}
                        placeholder="Nom joueur 4"
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        error={validationErrors.player4}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      Chacun joue pour soi, rotation du joueur au pot
                    </p>
                  </div>
                  {['player1', 'player2', 'player3'].map((playerKey, index) => (
                    <PlayerAutocompleteInput
                      key={playerKey}
                      value={playerNames[playerKey as keyof PlayerNames]}
                      onChange={(value) => handlePlayerNameChange(playerKey as keyof PlayerNames, value)}
                      placeholder={`Nom joueur ${index + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      error={validationErrors[playerKey as keyof PlayerNames]}
                    />
                  ))}
                </div>
              )}

              {validationErrors.general && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.general}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                <FaArrowLeft />
                <span>Retour</span>
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                  isFormValid && !isSubmitting
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaPlay />
                <span>{isSubmitting ? 'Démarrage...' : 'Démarrer la partie'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewGamePage;
