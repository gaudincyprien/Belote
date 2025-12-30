import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar } from 'react-icons/fa';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {
  GlobalStatistics,
  PlayerRanking,
  TrumpStatistics,
  GlobalRecords,
} from '../../shared/types';

type TabType = 'overview' | 'rankings' | 'trumps' | 'records';

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Stats data
  const [globalStats, setGlobalStats] = useState<GlobalStatistics | null>(null);
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [trumpStats, setTrumpStats] = useState<TrumpStatistics[]>([]);
  const [records, setRecords] = useState<GlobalRecords | null>(null);

  useEffect(() => {
    loadAllStatistics();
  }, []);

  const loadAllStatistics = async () => {
    setIsLoading(true);
    try {
      if (window.electron) {
        const [global, playerRankings, trumps, recs] = await Promise.all([
          window.electron.getGlobalStatistics?.() || Promise.resolve(null),
          window.electron.getPlayerRankings?.() || Promise.resolve([]),
          window.electron.getTrumpStatistics?.() || Promise.resolve([]),
          window.electron.getGlobalRecords?.() || Promise.resolve(null),
        ]);

        setGlobalStats(global);
        setRankings(playerRankings);
        setTrumpStats(trumps);
        setRecords(recs);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      alert('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
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
      pique: '♠ Pique',
      coeur: '♥ Cœur',
      carreau: '♦ Carreau',
      trefle: '♣ Trèfle',
      sans_atout: 'Sans atout',
      tout_atout: 'Tout atout',
    };
    return labels[trump] || trump;
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Render tabs
  const renderTabs = () => (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {[
        { id: 'overview', label: 'Vue générale', icon: '📊' },
        { id: 'rankings', label: 'Classement', icon: '🏆' },
        { id: 'trumps', label: 'Atouts', icon: '🃏' },
        { id: 'records', label: 'Records', icon: '⭐' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // Tab 1: Overview
  const renderOverview = () => {
    if (!globalStats) {
      return <div className="text-center text-gray-500 py-8">Aucune donnée disponible</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total games */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Parties jouées</h3>
            <span className="text-3xl">🎮</span>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{globalStats.totalGames}</p>
        </div>

        {/* Total rounds */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Manches jouées</h3>
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{globalStats.totalRounds}</p>
        </div>

        {/* Total play time */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Temps de jeu total</h3>
            <span className="text-3xl">⏱️</span>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{formatDuration(globalStats.totalPlayTime)}</p>
        </div>

        {/* First game */}
        {globalStats.firstGameDate && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Première partie</h3>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatDate(globalStats.firstGameDate)}</p>
          </div>
        )}

        {/* Last game */}
        {globalStats.lastGameDate && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Dernière partie</h3>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatDate(globalStats.lastGameDate)}</p>
          </div>
        )}

        {/* Longest game */}
        {globalStats.longestGame && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Partie la plus longue</h3>
              <span className="text-3xl">🕐</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatDuration(globalStats.longestGame.duration)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {globalStats.longestGame.roundCount} manches • Partie #{globalStats.longestGame.gameId}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Tab 2: Player Rankings
  const renderRankings = () => {
    if (rankings.length === 0) {
      return <div className="text-center text-gray-500 py-8">Aucun joueur trouvé</div>;
    }

    return (
      <div className="space-y-6">
        {/* Rankings table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rang</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joueur</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Parties</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Victoires</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.map((player) => (
                  <tr
                    key={player.playerId}
                    onClick={() => navigate(`/player/${player.playerId}/stats`)}
                    className="hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {player.rank === 1 && <span className="text-2xl">🥇</span>}
                        {player.rank === 2 && <span className="text-2xl">🥈</span>}
                        {player.rank === 3 && <span className="text-2xl">🥉</span>}
                        {player.rank > 3 && (
                          <span className="text-gray-500 font-semibold">{player.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-indigo-600 hover:text-indigo-800">
                      {player.playerName}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{player.gamesPlayed}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{player.wins}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-indigo-600">{player.winRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Win rate chart */}
        {rankings.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Taux de victoire par joueur</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rankings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="playerName" />
                <YAxis label={{ value: 'Taux de victoire (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="winRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  // Tab 3: Trump Statistics
  const renderTrumpStats = () => {
    if (trumpStats.length === 0) {
      return <div className="text-center text-gray-500 py-8">Aucune donnée disponible</div>;
    }

    const pieData = trumpStats.map((stat) => ({
      name: getTrumpLabel(stat.trump),
      value: stat.frequency,
    }));

    const barData = trumpStats.map((stat) => ({
      trump: getTrumpLabel(stat.trump),
      successRate: stat.successRate,
    }));

    return (
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {trumpStats.map((stat) => (
            <div key={stat.trump} className="bg-white rounded-xl shadow-md p-4">
              <h4 className="font-semibold text-gray-700 mb-2">{getTrumpLabel(stat.trump)}</h4>
              <p className="text-2xl font-bold text-indigo-600">{stat.frequency} fois</p>
              <p className="text-sm text-gray-600">{stat.percentage}% du total</p>
              <p className="text-sm text-green-600 mt-1">{stat.successRate}% de réussite</p>
            </div>
          ))}
        </div>

        {/* Pie chart - Frequency */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Répartition des atouts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - Success rate */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Taux de réussite par atout</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trump" />
              <YAxis label={{ value: 'Taux de réussite (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="successRate" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Tab 4: Records
  const renderRecords = () => {
    if (!records) {
      return <div className="text-center text-gray-500 py-8">Aucune donnée disponible</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best round score */}
        {records.bestRoundScore && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border-2 border-yellow-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🏆</span>
              <h3 className="text-lg font-bold text-gray-800">Meilleur score en une manche</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600 mb-2">{records.bestRoundScore.points} points</p>
            <p className="text-gray-700">
              {records.bestRoundScore.playerName} • {getTrumpLabel(records.bestRoundScore.trump)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Partie #{records.bestRoundScore.gameId} • Manche #{records.bestRoundScore.roundNumber}
            </p>
          </div>
        )}

        {/* Fastest game */}
        {records.fastestGame && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">⚡</span>
              <h3 className="text-lg font-bold text-gray-800">Partie la plus rapide</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(records.fastestGame.duration)}
            </p>
            <p className="text-sm text-gray-600">Partie #{records.fastestGame.gameId}</p>
          </div>
        )}

        {/* Longest win streak */}
        {records.longestWinStreak && records.longestWinStreak.streakLength > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-2 border-red-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🔥</span>
              <h3 className="text-lg font-bold text-gray-800">Plus longue série de victoires</h3>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {records.longestWinStreak.streakLength} parties
            </p>
            <p className="text-gray-700">{records.longestWinStreak.playerName}</p>
          </div>
        )}

        {/* Best duo */}
        {records.bestDuo && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border-2 border-purple-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">👥</span>
              <h3 className="text-lg font-bold text-gray-800">Duo le plus performant</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {records.bestDuo.player1Name} & {records.bestDuo.player2Name}
            </p>
            <p className="text-gray-700">
              {records.bestDuo.wins} victoires / {records.bestDuo.gamesPlayed} parties
            </p>
            <p className="text-lg font-semibold text-purple-600 mt-1">{records.bestDuo.winRate}% de réussite</p>
          </div>
        )}

        {/* Most rounds game */}
        {records.mostRoundsGame && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">💯</span>
              <h3 className="text-lg font-bold text-gray-800">Partie avec le plus de manches</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">{records.mostRoundsGame.roundCount} manches</p>
            <p className="text-sm text-gray-600">Partie #{records.mostRoundsGame.gameId}</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-xl text-gray-700">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
              <FaChartBar />
              <span>Statistiques</span>
            </h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </button>
          </div>

          {/* Tabs */}
          {renderTabs()}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rankings' && renderRankings()}
          {activeTab === 'trumps' && renderTrumpStats()}
          {activeTab === 'records' && renderRecords()}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
