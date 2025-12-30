import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaChartBar, FaSearch } from 'react-icons/fa';
import type { Player } from '../../shared/types';
import PlayerFormModal from '../components/PlayerFormModal';

const PlayersPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [gamesCount, setGamesCount] = useState<Record<number, number>>({});

  // Load players
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      if (window.electron?.listPlayers) {
        const data = await window.electron.listPlayers();
        setPlayers(data);

        // Load games count for each player
        const counts: Record<number, number> = {};
        for (const player of data) {
          if (window.electron?.countPlayerGames) {
            counts[player.id] = await window.electron.countPlayerGames(player.id);
          }
        }
        setGamesCount(counts);
      }
    } catch (error) {
      console.error('Error loading players:', error);
      alert('Erreur lors du chargement des joueurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Search filtering
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;

    const query = searchQuery.toLowerCase().trim();
    return players.filter(p => p.nom.toLowerCase().includes(query));
  }, [players, searchQuery]);

  // Handlers
  const handleAdd = async (nom: string) => {
    if (window.electron?.createPlayer) {
      await window.electron.createPlayer(nom);
      await loadPlayers();
    }
  };

  const handleEdit = async (nom: string) => {
    if (editingPlayer && window.electron?.updatePlayer) {
      await window.electron.updatePlayer(editingPlayer.id, nom);
      setEditingPlayer(null);
      await loadPlayers();
    }
  };

  const handleDelete = async (player: Player) => {
    const count = gamesCount[player.id] || 0;

    if (count > 0) {
      alert(`Impossible de supprimer ce joueur car il a participé à ${count} partie(s)`);
      return;
    }

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer "${player.nom}" ?`);
    if (!confirmed) return;

    try {
      if (window.electron?.deletePlayer) {
        await window.electron.deletePlayer(player.id);
        await loadPlayers();
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">Gestion des joueurs</h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaArrowLeft />
              <span>Retour</span>
            </button>
          </div>

          {/* Search and Add */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaPlus />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'Aucun joueur trouvé' : 'Aucun joueur enregistré'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-indigo-600">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-indigo-600">Date création</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-600">Parties jouées</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{player.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(player.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {gamesCount[player.id] || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingPlayer(player)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(player)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                          <button
                            disabled
                            className="text-gray-400 p-2 rounded-lg cursor-not-allowed"
                            title="Disponible prochainement"
                          >
                            <FaChartBar />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PlayerFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        title="Ajouter un joueur"
        submitLabel="Ajouter"
      />

      <PlayerFormModal
        isOpen={editingPlayer !== null}
        onClose={() => setEditingPlayer(null)}
        onSubmit={handleEdit}
        title="Modifier le joueur"
        initialName={editingPlayer?.nom || ''}
        submitLabel="Modifier"
      />
    </div>
  );
};

export default PlayersPage;
