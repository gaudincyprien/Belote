import { ipcMain } from 'electron';
import { DatabaseService, GameRepository, PlayerRepository } from '../database';
import type { CreateGameParams } from '../../shared/types';

/**
 * Register IPC handlers for game-related operations
 */
export function registerGameHandlers() {
  /**
   * Create a new game with players
   * Returns the game ID
   */
  ipcMain.handle('game:create', async (_event, params: CreateGameParams): Promise<number> => {
    const db = DatabaseService.getInstance();
    const gameRepo = new GameRepository(db);
    const playerRepo = new PlayerRepository(db);

    try {
      // Start transaction
      db.getDatabase().transaction(() => {
        // Create or get players
        const playerIds: number[] = [];
        for (const playerName of params.playerNames) {
          // Try to find existing player
          let player = playerRepo.findByName(playerName);

          if (!player) {
            // Create new player
            const playerId = playerRepo.create({ nom: playerName });
            player = playerRepo.findById(playerId);
          }

          if (player) {
            playerIds.push(player.id);
          }
        }

        // Determine team names based on mode
        let equipe1_nom = null;
        let equipe2_nom = null;

        if (params.mode === '4_joueurs') {
          // For 4 players: Team A (players 1 & 3) vs Team B (players 2 & 4)
          equipe1_nom = `${params.playerNames[0]} & ${params.playerNames[2]}`;
          equipe2_nom = `${params.playerNames[1]} & ${params.playerNames[3]}`;
        }

        // Create the game
        const gameId = gameRepo.create({
          mode: params.mode,
          equipe1_nom,
          equipe2_nom,
          score_equipe1: 0,
          score_equipe2: 0,
          gagnant: null,
          terminee: false,
          duree_minutes: null,
        });

        // Link players to the game
        if (params.mode === '4_joueurs') {
          // 4 players mode: players alternate teams
          gameRepo.addPlayer(gameId, playerIds[0], 1); // Player 1 -> Team A
          gameRepo.addPlayer(gameId, playerIds[1], 2); // Player 2 -> Team B
          gameRepo.addPlayer(gameId, playerIds[2], 1); // Player 3 -> Team A
          gameRepo.addPlayer(gameId, playerIds[3], 2); // Player 4 -> Team B
        } else {
          // 3 players mode: each player is their own team
          gameRepo.addPlayer(gameId, playerIds[0], 1);
          gameRepo.addPlayer(gameId, playerIds[1], 2);
          gameRepo.addPlayer(gameId, playerIds[2], 3);
        }

        return gameId;
      })();

      // Get the created game
      const games = gameRepo.findAll();
      const latestGame = games[games.length - 1];

      return latestGame.id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw new Error('Failed to create game');
    }
  });
}
