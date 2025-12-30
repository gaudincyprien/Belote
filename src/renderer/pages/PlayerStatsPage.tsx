import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaTrophy, FaFire } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PlayerStatistics } from '../../shared/types';

const PlayerStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const [stats, setStats] = useState<PlayerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayerStats();
  }, [playerId]);

  const loadPlayerStats = async () => {
    if (!playerId) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      if (window.electron?.getPlayerStatistics) {
        const playerStats = await window.electron.getPlayerStatistics(parseInt(playerId, 10));
        setStats(playerStats);
      }
    } catch (error) {
      console.error('Error loading player statistics:', error);
      alert('Erreur lors du chargement des statistiques du joueur');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTrumpLabel = (trump: string): string => {
    const labels: { [key: string]: string } = {
      pique: '♠',
      coeur: '♥',
      carreau: '♦',
      trefle: '♣',
      sans_atout: 'SA',
      tout_atout: 'TA',
    };
    return labels[trump] || trump;
  };

  const getTrumpName = (trump: string): string => {
    const names: { [key: string]: string } = {
      pique: 'Pique',
      coeur: 'Cœur',
      carreau: 'Carreau',
      trefle: 'Trèfle',
      sans_atout: 'Sans atout',
      tout_atout: 'Tout atout',
    };
    return names[trump] || trump;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">
            <FaUser className="inline" />
          </div>
          <p className="text-xl text-gray-700">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700">Joueur introuvable</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
              <FaUser />
              <span>Profil de {stats.playerName}</span>
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Identity Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Carte d'identité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
              <p className="text-xl font-bold text-blue-600">{formatDate(stats.memberSince)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Parties jouées</p>
              <p className="text-xl font-bold text-green-600">{stats.gamesPlayed}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Victoires</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.wins} ({stats.winRate}%)
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Défaites</p>
              <p className="text-xl font-bold text-red-600">
                {stats.losses} ({(100 - stats.winRate).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Win Evolution Chart */}
        {stats.winEvolution.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📈 Évolution du taux de victoire
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.winEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gameNumber" label={{ value: 'Parties jouées', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Taux de victoire (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Taux de victoire']}
                  labelFormatter={(label) => `Partie ${label}`}
                />
                <Line type="monotone" dataKey="winRate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trump Preferences */}
        {stats.trumpStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🃏 Atouts préférés
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              {stats.trumpStats.map((trumpStat) => (
                <div
                  key={trumpStat.trump}
                  className={`rounded-lg p-4 text-center ${
                    trumpStat.trump === stats.mostEffectiveTrump
                      ? 'bg-green-100 border-2 border-green-500'
                      : trumpStat.trump === stats.leastEffectiveTrump
                        ? 'bg-red-100 border-2 border-red-500'
                        : 'bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{getTrumpLabel(trumpStat.trump)}</div>
                  <p className="text-sm text-gray-600">{getTrumpName(trumpStat.trump)}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{trumpStat.takes} prises</p>
                  <p className="text-sm text-gray-600">{trumpStat.successRate}% réussite</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.mostEffectiveTrump && (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Atout le plus efficace</p>
                  <p className="text-2xl font-bold text-green-600">
                    {getTrumpLabel(stats.mostEffectiveTrump)} {getTrumpName(stats.mostEffectiveTrump)}
                  </p>
                </div>
              )}
              {stats.leastEffectiveTrump && (
                <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Atout le moins efficace</p>
                  <p className="text-2xl font-bold text-red-600">
                    {getTrumpLabel(stats.leastEffectiveTrump)} {getTrumpName(stats.leastEffectiveTrump)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partners (4-player mode) */}
        {stats.partnerStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              👥 Partenaires favoris
            </h2>
            <div className="space-y-3">
              {stats.partnerStats.map((partner, index) => (
                <div
                  key={partner.partnerId}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <FaTrophy className="text-yellow-500 text-2xl" />}
                    <div>
                      <p className="font-semibold text-gray-800">{partner.partnerName}</p>
                      <p className="text-sm text-gray-600">
                        {partner.gamesPlayed} parties, {partner.wins} victoires
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{partner.winRate}%</p>
                    <p className="text-xs text-gray-500">réussite</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Records */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏆 Records personnels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.personalRecords.bestRoundScore && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
                <p className="text-sm text-gray-600 mb-1">Meilleure manche</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.personalRecords.bestRoundScore.points} pts</p>
                <p className="text-xs text-gray-600 mt-1">
                  Partie #{stats.personalRecords.bestRoundScore.gameId} •{' '}
                  {getTrumpLabel(stats.personalRecords.bestRoundScore.trump)}
                </p>
              </div>
            )}
            {stats.personalRecords.longestWinStreak > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-300">
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <FaFire className="text-red-500" /> Plus long streak
                </p>
                <p className="text-3xl font-bold text-red-600">{stats.personalRecords.longestWinStreak}</p>
                <p className="text-xs text-gray-600 mt-1">parties consécutives</p>
              </div>
            )}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-300">
              <p className="text-sm text-gray-600 mb-1">Moyenne points/partie</p>
              <p className="text-3xl font-bold text-blue-600">{stats.personalRecords.averagePointsPerGame} pts</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border-2 border-purple-300">
              <p className="text-sm text-gray-600 mb-1">Nombre de prises</p>
              <p className="text-3xl font-bold text-purple-600">{stats.personalRecords.totalTakes}</p>
              <p className="text-xs text-gray-600 mt-1">fois preneur</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm text-gray-600 mb-1">Belote/Rebelote</p>
              <p className="text-3xl font-bold text-green-600">{stats.personalRecords.totalBelotes}</p>
              <p className="text-xs text-gray-600 mt-1">fois</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📅 Activité récente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentActivity.lastGameDate && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Dernière partie</p>
                <p className="text-lg font-bold text-gray-800">{formatDate(stats.recentActivity.lastGameDate)}</p>
                {stats.recentActivity.lastGameResult && (
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      stats.recentActivity.lastGameResult === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stats.recentActivity.lastGameResult === 'win' ? '✓ Victoire' : '✗ Défaite'}
                  </p>
                )}
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Parties ce mois-ci</p>
              <p className="text-lg font-bold text-gray-800">{stats.recentActivity.gamesThisMonth}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Victoires ce mois-ci</p>
              <p className="text-lg font-bold text-green-600">{stats.recentActivity.winsThisMonth}</p>
              {stats.recentActivity.gamesThisMonth > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {Math.round((stats.recentActivity.winsThisMonth / stats.recentActivity.gamesThisMonth) * 100)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsPage;
