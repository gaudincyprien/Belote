import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar } from 'react-icons/fa';
import type { Game, Round, GameData, FinalizeGameParams } from '../../shared/types';
import { calculateGameStatistics } from '../utils/gameStatistics';

const GameResultsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
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

    loadData();
  }, [gameId]);

  // Calculer les statistiques
  const statistics = useMemo(() => {
    if (!game || rounds.length === 0) return null;
    return calculateGameStatistics(game, rounds);
  }, [game, rounds]);

  // Finaliser la partie
  const handleFinalize = async () => {
    if (!game || !window.electron?.finalizeGame) return;

    setIsFinalizing(true);

    try {
      const params: FinalizeGameParams = {
        gameId: game.id,
        forced: true,
      };

      const finalizedGame = await window.electron.finalizeGame(params);
      setGame(finalizedGame);
      alert('Partie finalisée avec succès !');
    } catch (error) {
      console.error('Error finalizing game:', error);
      alert('Erreur lors de la finalisation de la partie');
    } finally {
      setIsFinalizing(false);
    }
  };

  // Symbole d'atout
  const getTrumpSymbol = (suit: string): string => {
    const symbols: Record<string, string> = {
      pique: '♠',
      coeur: '♥',
      carreau: '♦',
      trefle: '♣',
      sans_atout: 'SA',
      tout_atout: 'TA',
    };
    return symbols[suit] || suit;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!game || !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Données introuvables</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  const is3PlayerMode = game.mode === '3_joueurs';

  // Déterminer le gagnant et les scores
  const winnerName = is3PlayerMode
    ? (statistics.winner === 1 ? game.equipe1_nom || 'Joueur 1' :
       statistics.winner === 2 ? game.equipe2_nom || 'Joueur 2' :
       game.equipe3_nom || 'Joueur 3')
    : (statistics.winner === 1 ? 'Équipe A' : 'Équipe B');

  const teamName = game.mode === '4_joueurs'
    ? (statistics.winner === 1 ? game.equipe1_nom : game.equipe2_nom)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft />
              <span>Retour au menu</span>
            </button>
            <span className="text-4xl">🏆</span>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            FIN DE LA PARTIE
          </h1>

          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-green-600 mb-2">
              Gagnant : {winnerName} {teamName ? `(${teamName})` : ''}
            </p>
            {is3PlayerMode && statistics.finalScores3 ? (
              <div className="flex items-center justify-center gap-4 text-xl text-gray-700">
                <span className="font-bold text-blue-700">{statistics.finalScores3.player1}</span>
                <span>-</span>
                <span className="font-bold text-red-700">{statistics.finalScores3.player2}</span>
                <span>-</span>
                <span className="font-bold text-green-700">{statistics.finalScores3.player3}</span>
              </div>
            ) : (
              <p className="text-xl text-gray-700">
                Score final : <span className="font-bold">{statistics.finalScores.team1}</span> - {statistics.finalScores.team2}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <FaChartBar />
              <span>Manches : {statistics.totalRounds}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span>Durée : {statistics.duration} min</span>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 STATISTIQUES</h2>

          {/* Répartition des prises */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Répartition des prises :</h3>
            {is3PlayerMode && statistics.roundDistribution3 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">{game.equipe1_nom || 'Joueur 1'}</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {statistics.roundDistribution3.player1.count} manches ({statistics.roundDistribution3.player1.percentage}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">{game.equipe2_nom || 'Joueur 2'}</p>
                  <p className="text-2xl font-bold text-red-900">
                    {statistics.roundDistribution3.player2.count} manches ({statistics.roundDistribution3.player2.percentage}%)
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">{game.equipe3_nom || 'Joueur 3'}</p>
                  <p className="text-2xl font-bold text-green-900">
                    {statistics.roundDistribution3.player3.count} manches ({statistics.roundDistribution3.player3.percentage}%)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">Équipe A</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {statistics.roundDistribution.team1.count} manches ({statistics.roundDistribution.team1.percentage}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">Équipe B</p>
                  <p className="text-2xl font-bold text-red-900">
                    {statistics.roundDistribution.team2.count} manches ({statistics.roundDistribution.team2.percentage}%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Atouts joués */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Atouts joués :</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-2xl">♠</span>
                <p className="text-sm text-gray-600">Pique : {statistics.trumpDistribution.pique}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-2xl text-red-500">♥</span>
                <p className="text-sm text-gray-600">Cœur : {statistics.trumpDistribution.coeur}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-2xl text-red-500">♦</span>
                <p className="text-sm text-gray-600">Carreau : {statistics.trumpDistribution.carreau}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-2xl">♣</span>
                <p className="text-sm text-gray-600">Trèfle : {statistics.trumpDistribution.trefle}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-sm font-bold">SA</span>
                <p className="text-sm text-gray-600">Sans atout : {statistics.trumpDistribution.sans_atout}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <span className="text-sm font-bold">TA</span>
                <p className="text-sm text-gray-600">Tout atout : {statistics.trumpDistribution.tout_atout}</p>
              </div>
            </div>
          </div>

          {/* Taux de réussite */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Taux de réussite (prises gagnées) :</h3>
            {is3PlayerMode && statistics.successRate3 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">{game.equipe1_nom || 'Joueur 1'}</p>
                  <p className="text-lg text-blue-900">
                    {statistics.successRate3.player1.successful}/{statistics.successRate3.player1.total} réussies ({statistics.successRate3.player1.percentage}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">{game.equipe2_nom || 'Joueur 2'}</p>
                  <p className="text-lg text-red-900">
                    {statistics.successRate3.player2.successful}/{statistics.successRate3.player2.total} réussies ({statistics.successRate3.player2.percentage}%)
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">{game.equipe3_nom || 'Joueur 3'}</p>
                  <p className="text-lg text-green-900">
                    {statistics.successRate3.player3.successful}/{statistics.successRate3.player3.total} réussies ({statistics.successRate3.player3.percentage}%)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">Équipe A</p>
                  <p className="text-lg text-blue-900">
                    {statistics.successRate.team1.successful}/{statistics.successRate.team1.total} réussies ({statistics.successRate.team1.percentage}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">Équipe B</p>
                  <p className="text-lg text-red-900">
                    {statistics.successRate.team2.successful}/{statistics.successRate.team2.total} réussies ({statistics.successRate.team2.percentage}%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Meilleures manches */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Meilleures manches :</h3>
            {is3PlayerMode && statistics.bestRounds3 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">{game.equipe1_nom || 'Joueur 1'}</p>
                  {statistics.bestRounds3.player1 ? (
                    <p className="text-lg text-blue-900">
                      {statistics.bestRounds3.player1.points} pts (manche #{statistics.bestRounds3.player1.roundNumber}, {getTrumpSymbol(statistics.bestRounds3.player1.trump)})
                    </p>
                  ) : (
                    <p className="text-gray-500">Aucune manche</p>
                  )}
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">{game.equipe2_nom || 'Joueur 2'}</p>
                  {statistics.bestRounds3.player2 ? (
                    <p className="text-lg text-red-900">
                      {statistics.bestRounds3.player2.points} pts (manche #{statistics.bestRounds3.player2.roundNumber}, {getTrumpSymbol(statistics.bestRounds3.player2.trump)})
                    </p>
                  ) : (
                    <p className="text-gray-500">Aucune manche</p>
                  )}
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">{game.equipe3_nom || 'Joueur 3'}</p>
                  {statistics.bestRounds3.player3 ? (
                    <p className="text-lg text-green-900">
                      {statistics.bestRounds3.player3.points} pts (manche #{statistics.bestRounds3.player3.roundNumber}, {getTrumpSymbol(statistics.bestRounds3.player3.trump)})
                    </p>
                  ) : (
                    <p className="text-gray-500">Aucune manche</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">Équipe A</p>
                  {statistics.bestRounds.team1 ? (
                    <p className="text-lg text-blue-900">
                      {statistics.bestRounds.team1.points} pts (manche #{statistics.bestRounds.team1.roundNumber}, {getTrumpSymbol(statistics.bestRounds.team1.trump)})
                    </p>
                  ) : (
                    <p className="text-gray-500">Aucune manche</p>
                  )}
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">Équipe B</p>
                  {statistics.bestRounds.team2 ? (
                    <p className="text-lg text-red-900">
                      {statistics.bestRounds.team2.points} pts (manche #{statistics.bestRounds.team2.roundNumber}, {getTrumpSymbol(statistics.bestRounds.team2.trump)})
                    </p>
                  ) : (
                    <p className="text-gray-500">Aucune manche</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Annonces */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Annonces totales :</h3>
            {is3PlayerMode && statistics.totalAnnouncements3 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">{game.equipe1_nom || 'Joueur 1'}</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalAnnouncements3.player1} pts</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">{game.equipe2_nom || 'Joueur 2'}</p>
                  <p className="text-2xl font-bold text-red-900">{statistics.totalAnnouncements3.player2} pts</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">{game.equipe3_nom || 'Joueur 3'}</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.totalAnnouncements3.player3} pts</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">Équipe A</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalAnnouncements.team1} pts</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">Équipe B</p>
                  <p className="text-2xl font-bold text-red-900">{statistics.totalAnnouncements.team2} pts</p>
                </div>
              </div>
            )}
          </div>

          {/* Belote/Rebelote */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Belote/Rebelote :</h3>
            {is3PlayerMode && statistics.beloteCount3 ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">{game.equipe1_nom || 'Joueur 1'}</p>
                  <p className="text-lg text-blue-900">
                    {statistics.beloteCount3.player1} fois ({statistics.beloteCount3.player1 * 20} pts)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">{game.equipe2_nom || 'Joueur 2'}</p>
                  <p className="text-lg text-red-900">
                    {statistics.beloteCount3.player2} fois ({statistics.beloteCount3.player2 * 20} pts)
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-green-800 font-semibold">{game.equipe3_nom || 'Joueur 3'}</p>
                  <p className="text-lg text-green-900">
                    {statistics.beloteCount3.player3} fois ({statistics.beloteCount3.player3 * 20} pts)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-semibold">Équipe A</p>
                  <p className="text-lg text-blue-900">
                    {statistics.beloteCount.team1} fois ({statistics.beloteCount.team1 * 20} pts)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-red-800 font-semibold">Équipe B</p>
                  <p className="text-lg text-red-900">
                    {statistics.beloteCount.team2} fois ({statistics.beloteCount.team2 * 20} pts)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex gap-4">
            {!game.terminee && (
              <button
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              >
                {isFinalizing ? 'Finalisation...' : 'Finaliser la partie'}
              </button>
            )}
            <button
              onClick={() => navigate('/new-game')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              Nouvelle partie
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200"
            >
              Retour accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameResultsPage;
