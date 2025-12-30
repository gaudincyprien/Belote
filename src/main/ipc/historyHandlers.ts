import { ipcMain } from 'electron';
import { DatabaseService, GameRepository } from '../database';
import type { Game } from '../../shared/types';

export interface GameFilters {
  dateFrom?: string;
  dateTo?: string;
  playerId?: number;
  mode?: string;
  sortBy?: 'date' | 'duration' | 'rounds';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface GameListResult {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Register IPC handlers for history-related operations
 */
export function registerHistoryHandlers() {
  /**
   * Get games with filters, sorting, and pagination
   */
  ipcMain.handle('history:listGames', async (_event, filters: GameFilters = {}): Promise<GameListResult> => {
    const db = DatabaseService.getInstance();
    const gameRepo = new GameRepository();

    try {
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 20;
      const offset = (page - 1) * pageSize;

      // Get filtered and sorted games
      const games = gameRepo.findWithFilters({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        playerId: filters.playerId,
        mode: filters.mode,
        sortBy: filters.sortBy || 'date',
        sortOrder: filters.sortOrder || 'desc',
        limit: pageSize,
        offset: offset,
      });

      // Get total count for pagination
      const total = gameRepo.countWithFilters({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        playerId: filters.playerId,
        mode: filters.mode,
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        games,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error listing games:', error);
      throw new Error('Failed to list games');
    }
  });

  /**
   * Get round count for a game
   */
  ipcMain.handle('history:countRounds', async (_event, gameId: number): Promise<number> => {
    const gameRepo = new GameRepository();

    try {
      return gameRepo.countRounds(gameId);
    } catch (error) {
      console.error('Error counting rounds:', error);
      throw new Error('Failed to count rounds');
    }
  });

  /**
   * Delete a game
   */
  ipcMain.handle('history:deleteGame', async (_event, gameId: number): Promise<boolean> => {
    const gameRepo = new GameRepository();

    try {
      return gameRepo.delete(gameId);
    } catch (error) {
      console.error('Error deleting game:', error);
      throw new Error('Failed to delete game');
    }
  });
}
