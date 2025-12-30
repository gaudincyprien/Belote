import { ipcMain } from 'electron';
import { StatisticsRepository } from '../database';
import type {
  GlobalStatistics,
  PlayerRanking,
  TrumpStatistics,
  GlobalRecords,
} from '../../shared/types';

/**
 * Register IPC handlers for statistics-related operations
 */
export function registerStatisticsHandlers() {
  /**
   * Get global statistics (all games combined)
   */
  ipcMain.handle('statistics:getGlobal', async (): Promise<GlobalStatistics> => {
    const statsRepo = new StatisticsRepository();

    try {
      return statsRepo.getGlobalStatistics();
    } catch (error) {
      console.error('Error getting global statistics:', error);
      throw new Error('Failed to get global statistics');
    }
  });

  /**
   * Get player rankings
   */
  ipcMain.handle('statistics:getPlayerRankings', async (): Promise<PlayerRanking[]> => {
    const statsRepo = new StatisticsRepository();

    try {
      return statsRepo.getPlayerRankings();
    } catch (error) {
      console.error('Error getting player rankings:', error);
      throw new Error('Failed to get player rankings');
    }
  });

  /**
   * Get trump statistics
   */
  ipcMain.handle('statistics:getTrumpStats', async (): Promise<TrumpStatistics[]> => {
    const statsRepo = new StatisticsRepository();

    try {
      return statsRepo.getTrumpStatistics();
    } catch (error) {
      console.error('Error getting trump statistics:', error);
      throw new Error('Failed to get trump statistics');
    }
  });

  /**
   * Get global records
   */
  ipcMain.handle('statistics:getRecords', async (): Promise<GlobalRecords> => {
    const statsRepo = new StatisticsRepository();

    try {
      return statsRepo.getGlobalRecords();
    } catch (error) {
      console.error('Error getting global records:', error);
      throw new Error('Failed to get global records');
    }
  });
}
