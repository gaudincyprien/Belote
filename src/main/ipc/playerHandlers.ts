import { ipcMain } from 'electron';
import { DatabaseService, PlayerRepository } from '../database';
import type { Player } from '../../shared/types';

/**
 * Register IPC handlers for player-related operations
 */
export function registerPlayerHandlers() {
  /**
   * Get all players
   * Returns list of all players sorted alphabetically
   */
  ipcMain.handle('player:list', async (): Promise<Player[]> => {
    const db = DatabaseService.getInstance();
    const playerRepo = new PlayerRepository(db);

    try {
      return playerRepo.findAll();
    } catch (error) {
      console.error('Error listing players:', error);
      throw new Error('Failed to list players');
    }
  });

  /**
   * Create a new player
   * Returns the created player
   */
  ipcMain.handle('player:create', async (_event, nom: string): Promise<Player> => {
    const db = DatabaseService.getInstance();
    const playerRepo = new PlayerRepository(db);

    try {
      // Check for duplicates
      const existing = playerRepo.findByName(nom);
      if (existing) {
        throw new Error('Un joueur avec ce nom existe déjà');
      }

      return playerRepo.create(nom);
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  });

  /**
   * Update a player's name
   * Returns the updated player
   */
  ipcMain.handle('player:update', async (_event, id: number, nom: string): Promise<Player | null> => {
    const db = DatabaseService.getInstance();
    const playerRepo = new PlayerRepository(db);

    try {
      // Check if player exists
      const player = playerRepo.findById(id);
      if (!player) {
        throw new Error('Joueur non trouvé');
      }

      // Check for duplicate name (excluding current player)
      const existing = playerRepo.findByName(nom);
      if (existing && existing.id !== id) {
        throw new Error('Un joueur avec ce nom existe déjà');
      }

      return playerRepo.update(id, nom);
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  });

  /**
   * Delete a player
   * Blocks deletion if player has played games
   * Returns true if deleted successfully
   */
  ipcMain.handle('player:delete', async (_event, id: number): Promise<boolean> => {
    const db = DatabaseService.getInstance();
    const playerRepo = new PlayerRepository(db);

    try {
      // Check if player has games
      const gamesCount = playerRepo.countGames(id);
      if (gamesCount > 0) {
        throw new Error(`Impossible de supprimer ce joueur car il a participé à ${gamesCount} partie(s)`);
      }

      return playerRepo.delete(id);
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  });

  /**
   * Count games played by a player
   * Returns the number of games
   */
  ipcMain.handle('player:countGames', async (_event, playerId: number): Promise<number> => {
    const db = DatabaseService.getInstance();
    const playerRepo = new PlayerRepository(db);

    try {
      return playerRepo.countGames(playerId);
    } catch (error) {
      console.error('Error counting player games:', error);
      throw new Error('Failed to count player games');
    }
  });
}
