import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaSearch } from 'react-icons/fa';
import type { Game, Player, GameListResult, GameFilters } from '../../shared/types';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [gameList, setGameList] = useState<GameListResult>({
    games: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [roundCounts, setRoundCounts] = useState<Record<number, number>>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>();
  const [selectedMode, setSelectedMode] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'rounds'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Load players for filter
  useEffect(() => {
    loadPlayers();
  }, []);

  // Load games when filters change
  useEffect(() => {
    loadGames();
  }, [currentPage, sortBy, sortOrder]);

  const loadPlayers = async () => {
    try {
      if (window.electron?.listPlayers) {
        const data = await window.electron.listPlayers();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadGames = async () => {
    setIsLoading(true);
    try {
      if (window.electron?.listGames) {
        const filters: GameFilters = {
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          playerId: selectedPlayer,
          mode: selectedMode,
          sortBy,
          sortOrder,
          page: currentPage,
          pageSize: 20,
        };

        const result = await window.electron.listGames(filters);
        setGameList(result);

        // Load round counts for each game
        if (window.electron?.countGameRounds) {
          const counts: Record<number, number> = {};
          for (const game of result.games) {
            counts[game.id] = await window.electron.countGameRounds(game.id);
          }
          setRoundCounts(counts);
        }
      }
    } catch (error) {
      console.error('Error loading games:', error);
      alert('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadGames();
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedPlayer(undefined);
    setSelectedMode(undefined);
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
    setTimeout(() => loadGames(), 0);
  };

  const handleDelete = async (game: Game) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer cette partie ?\n` +
      `Date : ${new Date(game.date).toLocaleDateString('fr-FR')}\n` +
      `Mode : ${game.mode === '4_joueurs' ? '4 joueurs' : '3 joueurs'}`
    );

    if (!confirmed) return;

    try {
      if (window.electron?.deleteGame) {
        const success = await window.electron.deleteGame(game.id);
        if (success) {
          loadGames();
        } else {
          alert('Erreur lors de la suppression');
        }
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} min`;
  };

  const getScoreDisplay = (game: Game) => {
    if (game.mode === '4_joueurs') {
      return `${game.score_equipe1} - ${game.score_equipe2}`;
    } else {
      return `${game.score_equipe1} / ${game.score_equipe2} / ${game.score_equipe3}`;
    }
  };

  const getTeamsDisplay = (game: Game) => {
    if (game.mode === '4_joueurs') {
      return `${game.equipe1_nom} vs ${game.equipe2_nom}`;
    } else {
      return `${game.equipe1_nom}, ${game.equipe2_nom}, ${game.equipe3_nom}`;
    }
  };

  const renderPagination = () => {
    if (gameList.totalPages <= 1) return null;

    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(gameList.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            i === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}
        {pages}
        {endPage < gameList.totalPages && (
          <>
            {endPage < gameList.totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => setCurrentPage(gameList.totalPages)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              {gameList.totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentPage(Math.min(gameList.totalPages, currentPage + 1))}
          disabled={currentPage === gameList.totalPages}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">Historique des parties</h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaSearch />
              <span>Filtres</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date from */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Du</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Au</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Player filter */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Joueur</label>
                <select
                  value={selectedPlayer || ''}
                  onChange={(e) => setSelectedPlayer(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">Tous</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode filter */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mode</label>
                <select
                  value={selectedMode || ''}
                  onChange={(e) => setSelectedMode(e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">Tous</option>
                  <option value="4_joueurs">4 joueurs</option>
                  <option value="3_joueurs">3 joueurs</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Appliquer
              </button>
              <button
                onClick={handleResetFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <span>⬇️</span>
              <span>Trier par</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'date', label: 'Date' },
                { value: 'duration', label: 'Durée' },
                { value: 'rounds', label: 'Nb manches' },
              ].map((sort) => (
                <button
                  key={sort.value}
                  onClick={() => {
                    if (sortBy === sort.value) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(sort.value as 'date' | 'duration' | 'rounds');
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === sort.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {sort.label} {sortBy === sort.value && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {gameList.total} partie{gameList.total > 1 ? 's' : ''} trouvée{gameList.total > 1 ? 's' : ''}
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : gameList.games.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune partie trouvée
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {gameList.games.map((game) => (
                <div
                  key={game.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-500">#{game.id}</span>
                        <span className="text-sm text-gray-600">{formatDate(game.date)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          game.mode === '4_joueurs'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {game.mode === '4_joueurs' ? '4 joueurs' : '3 joueurs'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 font-medium mb-1">
                        {getTeamsDisplay(game)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-semibold">{getScoreDisplay(game)}</span>
                        <span>{formatDuration(game.duree_minutes)}</span>
                        <span>{roundCounts[game.id] || 0} manche{(roundCounts[game.id] || 0) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/game/${game.id}/results`)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        title="Voir le détail"
                      >
                        <span>Détail</span>
                      </button>
                      <button
                        onClick={() => handleDelete(game)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
