import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import type { Game, Round, TrumpSuit, GameData } from '../../shared/types';
import {
  validateRoundForm,
  isRoundFormValid,
  calculateRoundPoints,
  calculateTotalPoints,
  type RoundFormData,
  type RoundValidationErrors,
} from '../utils/roundValidation';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // Game data state
  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [callingTeam, setCallingTeam] = useState<1 | 2>(1);
  const [trumpSuit, setTrumpSuit] = useState<TrumpSuit>('pique');
  const [entryMode, setEntryMode] = useState<'2_teams' | '1_team'>('2_teams');
  const [pointsTeam1, setPointsTeam1] = useState<string>('');
  const [pointsTeam2, setPointsTeam2] = useState<string>('');
  const [announcementsTeam1, setAnnouncementsTeam1] = useState<string>('0');
  const [announcementsTeam2, setAnnouncementsTeam2] = useState<string>('0');
  const [beloteTeam, setBeloteTeam] = useState<0 | 1 | 2>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load game data on mount
  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId || !window.electron?.getGame) {
        setIsLoading(false);
        return;
      }

      try {
        const data: GameData = await window.electron.getGame(parseInt(gameId));
        setGame(data.game);
        setRounds(data.rounds);
      } catch (error) {
        console.error('Error loading game:', error);
        alert('Erreur lors du chargement de la partie');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [gameId]);

  // Form data for validation
  const formData: RoundFormData = useMemo(() => ({
    callingTeam,
    trumpSuit,
    entryMode,
    pointsTeam1,
    pointsTeam2,
    announcementsTeam1,
    announcementsTeam2,
    beloteTeam,
  }), [callingTeam, trumpSuit, entryMode, pointsTeam1, pointsTeam2, announcementsTeam1, announcementsTeam2, beloteTeam]);

  // Validation
  const validationErrors: RoundValidationErrors = useMemo(() => {
    return validateRoundForm(formData);
  }, [formData]);

  const isFormValid = useMemo(() => {
    return isRoundFormValid(formData, validationErrors);
  }, [formData, validationErrors]);

  // Calculate points with auto-calculation for 1 team mode
  const calculatedPoints = useMemo(() => {
    return calculateRoundPoints(formData);
  }, [formData]);

  // Calculate total
  const totalPoints = useMemo(() => {
    return calculateTotalPoints(formData);
  }, [formData]);

  // Submit round
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || !window.electron?.createRound || !game) return;

    setIsSubmitting(true);

    try {
      const { team1Points, team2Points } = calculatedPoints;
      const announcements1 = parseInt(announcementsTeam1) || 0;
      const announcements2 = parseInt(announcementsTeam2) || 0;

      const newRound = await window.electron.createRound({
        gameId: game.id,
        trumpSuit,
        callingTeam,
        pointsTeam1: team1Points,
        pointsTeam2: team2Points,
        announcementsTeam1: announcements1,
        announcementsTeam2: announcements2,
        beloteTeam,
      });

      // Update local state
      setRounds([...rounds, newRound]);

      // Update game scores
      const totalTeam1 = team1Points + announcements1 + (beloteTeam === 1 ? 20 : 0);
      const totalTeam2 = team2Points + announcements2 + (beloteTeam === 2 ? 20 : 0);

      setGame({
        ...game,
        score_equipe1: game.score_equipe1 + totalTeam1,
        score_equipe2: game.score_equipe2 + totalTeam2,
      });

      // Reset form
      setPointsTeam1('');
      setPointsTeam2('');
      setAnnouncementsTeam1('0');
      setAnnouncementsTeam2('0');
      setBeloteTeam(0);
    } catch (error) {
      console.error('Error creating round:', error);
      alert('Erreur lors de la création de la manche');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete last round
  const handleDeleteLastRound = async () => {
    if (!window.electron?.deleteLastRound || !game || rounds.length === 0) return;

    if (!confirm('Voulez-vous vraiment annuler la dernière manche ?')) return;

    try {
      const success = await window.electron.deleteLastRound(game.id);

      if (success) {
        const lastRound = rounds[rounds.length - 1];
        const totalTeam1 = lastRound.points_equipe1 + lastRound.annonces_equipe1 + (lastRound.belote_equipe === 1 ? 20 : 0);
        const totalTeam2 = lastRound.points_equipe2 + lastRound.annonces_equipe2 + (lastRound.belote_equipe === 2 ? 20 : 0);

        setRounds(rounds.slice(0, -1));
        setGame({
          ...game,
          score_equipe1: game.score_equipe1 - totalTeam1,
          score_equipe2: game.score_equipe2 - totalTeam2,
        });
      }
    } catch (error) {
      console.error('Error deleting last round:', error);
      alert('Erreur lors de la suppression de la manche');
    }
  };

  // Trump suit symbol
  const getTrumpSymbol = (suit: TrumpSuit): string => {
    const symbols: Record<TrumpSuit, string> = {
      pique: '♠',
      coeur: '♥',
      carreau: '♦',
      trefle: '♣',
      sans_atout: 'SA',
      tout_atout: 'TA',
    };
    return symbols[suit];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Partie introuvable</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-indigo-600">
              Partie #{game.id} - {new Date(game.date).toLocaleDateString('fr-FR')}
            </h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200"
            >
              <FaArrowLeft />
              <span>Menu</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-700 mb-2">
                {game.equipe1_nom || 'Équipe A'}
              </div>
              <div className="text-3xl font-bold text-blue-800">
                {game.score_equipe1}
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-red-700 mb-2">
                {game.equipe2_nom || 'Équipe B'}
              </div>
              <div className="text-3xl font-bold text-red-800">
                {game.score_equipe2}
              </div>
            </div>
          </div>
        </div>

        {/* Round Entry Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">
            Nouvelle manche (Manche #{rounds.length + 1})
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Calling team */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qui a pris ?
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="callingTeam"
                    value="1"
                    checked={callingTeam === 1}
                    onChange={() => setCallingTeam(1)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">{game.equipe1_nom || 'Équipe A'}</span>
                </label>
                <label className="flex-1 flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                  <input
                    type="radio"
                    name="callingTeam"
                    value="2"
                    checked={callingTeam === 2}
                    onChange={() => setCallingTeam(2)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-900">{game.equipe2_nom || 'Équipe B'}</span>
                </label>
              </div>
            </div>

            {/* Trump suit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Atout
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['pique', 'coeur', 'carreau', 'trefle', 'sans_atout', 'tout_atout'] as TrumpSuit[]).map((suit) => (
                  <label
                    key={suit}
                    className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name="trumpSuit"
                      value={suit}
                      checked={trumpSuit === suit}
                      onChange={() => setTrumpSuit(suit)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-xl">{getTrumpSymbol(suit)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Entry mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mode de saisie
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="entryMode"
                    value="2_teams"
                    checked={entryMode === '2_teams'}
                    onChange={() => setEntryMode('2_teams')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-900">Points des 2 équipes</span>
                </label>
                <label className="flex-1 flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="radio"
                    name="entryMode"
                    value="1_team"
                    checked={entryMode === '1_team'}
                    onChange={() => setEntryMode('1_team')}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-gray-900">Points d'une seule équipe</span>
                </label>
              </div>
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points de la manche
              </label>
              {entryMode === '2_teams' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Points Équipe A"
                      value={pointsTeam1}
                      onChange={(e) => setPointsTeam1(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {validationErrors.pointsTeam1 && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.pointsTeam1}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Points Équipe B"
                      value={pointsTeam2}
                      onChange={(e) => setPointsTeam2(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {validationErrors.pointsTeam2 && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.pointsTeam2}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder={`Points de l'équipe preneuse (${callingTeam === 1 ? game.equipe1_nom || 'Équipe A' : game.equipe2_nom || 'Équipe B'})`}
                    value={callingTeam === 1 ? pointsTeam1 : pointsTeam2}
                    onChange={(e) => callingTeam === 1 ? setPointsTeam1(e.target.value) : setPointsTeam2(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {validationErrors.pointsTeam1 && callingTeam === 1 && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.pointsTeam1}</p>
                  )}
                  {validationErrors.pointsTeam2 && callingTeam === 2 && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.pointsTeam2}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    → Points adversaire : {calculatedPoints.team1Points === 0 && calculatedPoints.team2Points === 0 ? '-' : callingTeam === 1 ? calculatedPoints.team2Points : calculatedPoints.team1Points}
                  </p>
                </div>
              )}

              {/* Total indicator */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span className={`text-sm font-bold ${validationErrors.general ? 'text-red-600' : 'text-green-600'}`}>
                  {totalPoints}
                </span>
                {validationErrors.general ? (
                  <FaTimes className="text-red-600" />
                ) : pointsTeam1 !== '' && (entryMode === '1_team' || pointsTeam2 !== '') ? (
                  <FaCheck className="text-green-600" />
                ) : null}
                {validationErrors.general && (
                  <span className="text-red-500 text-xs ml-2">{validationErrors.general}</span>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Annonces (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Annonces Équipe A"
                    value={announcementsTeam1}
                    onChange={(e) => setAnnouncementsTeam1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {validationErrors.announcementsTeam1 && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.announcementsTeam1}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Annonces Équipe B"
                    value={announcementsTeam2}
                    onChange={(e) => setAnnouncementsTeam2(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {validationErrors.announcementsTeam2 && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.announcementsTeam2}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Belote */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Belote/Rebelote (+20 pts)
              </label>
              <div className="flex gap-3">
                {[
                  { value: 0, label: 'Aucune' },
                  { value: 1, label: game.equipe1_nom || 'Équipe A' },
                  { value: 2, label: game.equipe2_nom || 'Équipe B' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex-1 flex items-center justify-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors"
                  >
                    <input
                      type="radio"
                      name="beloteTeam"
                      value={option.value}
                      checked={beloteTeam === option.value}
                      onChange={() => setBeloteTeam(option.value as 0 | 1 | 2)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setPointsTeam1('');
                  setPointsTeam2('');
                  setAnnouncementsTeam1('0');
                  setAnnouncementsTeam2('0');
                  setBeloteTeam(0);
                }}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                <FaTimes />
                <span>Annuler</span>
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
                <FaCheck />
                <span>{isSubmitting ? 'Validation...' : 'Valider la manche'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Round History */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-600">
              Historique des manches ({rounds.length})
            </h2>
            {rounds.length > 0 && (
              <button
                onClick={handleDeleteLastRound}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <FaTrash />
                <span>Annuler dernière manche</span>
              </button>
            )}
          </div>

          {rounds.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune manche jouée pour le moment
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rounds.slice().reverse().map((round) => (
                <div
                  key={round.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700">#{round.numero}</span>
                    <span className="text-xl">{getTrumpSymbol(round.atout)}</span>
                    <span className="text-sm text-gray-600">
                      {round.preneur_equipe === 1 ? game.equipe1_nom || 'Équipe A' : game.equipe2_nom || 'Équipe B'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-blue-700">
                      {round.points_equipe1 + round.annonces_equipe1 + (round.belote_equipe === 1 ? 20 : 0)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="font-semibold text-red-700">
                      {round.points_equipe2 + round.annonces_equipe2 + (round.belote_equipe === 2 ? 20 : 0)}
                    </span>
                    {(round.annonces_equipe1 > 0 || round.annonces_equipe2 > 0) && (
                      <span className="text-xs text-gray-500">
                        (+{round.annonces_equipe1 + round.annonces_equipe2} annonces)
                      </span>
                    )}
                    {round.belote_equipe !== 0 && (
                      <span className="text-xs text-gray-500">(+20 belote)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
