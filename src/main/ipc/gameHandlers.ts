import { ipcMain } from 'electron';
import { DatabaseService, GameRepository, PlayerRepository, RoundRepository } from '../database';
import type { CreateGameParams, GameData, CreateRoundParams, Round } from '../../shared/types';

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

  /**
   * Get complete game data (game + players + rounds)
   */
  ipcMain.handle('game:get', async (_event, gameId: number): Promise<GameData> => {
    const gameRepo = new GameRepository();
    const roundRepo = new RoundRepository();

    try {
      const game = gameRepo.findById(gameId);
      if (!game) throw new Error('Game not found');

      const players = gameRepo.getPlayers(gameId);
      const rounds = roundRepo.findByGame(gameId);

      return { game, players, rounds };
    } catch (error) {
      console.error('Error getting game:', error);
      throw new Error('Failed to get game');
    }
  });

  /**
   * Create a new round and update game scores
   */
  ipcMain.handle('game:createRound', async (_event, params: CreateRoundParams): Promise<Round> => {
    const gameRepo = new GameRepository();
    const roundRepo = new RoundRepository();
    const db = DatabaseService.getInstance();

    try {
      return db.getDatabase().transaction(() => {
        // Compter les manches existantes
        const roundCount = roundRepo.countByGame(params.gameId);

        // Créer la manche
        const round = roundRepo.create({
          partie_id: params.gameId,
          numero: roundCount + 1,
          atout: params.trumpSuit,
          preneur_equipe: params.callingTeam,
          points_equipe1: params.pointsTeam1,
          points_equipe2: params.pointsTeam2,
          annonces_equipe1: params.announcementsTeam1,
          annonces_equipe2: params.announcementsTeam2,
          belote_equipe: params.beloteTeam,
        });

        // Calculer les points totaux avec annonces et belote
        const totalTeam1 = params.pointsTeam1 + params.announcementsTeam1 + (params.beloteTeam === 1 ? 20 : 0);
        const totalTeam2 = params.pointsTeam2 + params.announcementsTeam2 + (params.beloteTeam === 2 ? 20 : 0);

        // Mettre à jour les scores cumulés de la partie
        const game = gameRepo.findById(params.gameId)!;
        gameRepo.update(params.gameId, {
          score_equipe1: game.score_equipe1 + totalTeam1,
          score_equipe2: game.score_equipe2 + totalTeam2,
        });

        return round;
      })();
    } catch (error) {
      console.error('Error creating round:', error);
      throw new Error('Failed to create round');
    }
  });

  /**
   * Delete last round and revert game scores
   */
  ipcMain.handle('game:deleteLastRound', async (_event, gameId: number): Promise<boolean> => {
    const gameRepo = new GameRepository();
    const roundRepo = new RoundRepository();
    const db = DatabaseService.getInstance();

    try {
      return db.getDatabase().transaction(() => {
        const lastRound = roundRepo.findLastByGame(gameId);
        if (!lastRound) return false;

        // Calculer les points à soustraire
        const totalTeam1 = lastRound.points_equipe1 + lastRound.annonces_equipe1 + (lastRound.belote_equipe === 1 ? 20 : 0);
        const totalTeam2 = lastRound.points_equipe2 + lastRound.annonces_equipe2 + (lastRound.belote_equipe === 2 ? 20 : 0);

        // Soustraire les scores
        const game = gameRepo.findById(gameId)!;
        gameRepo.update(gameId, {
          score_equipe1: game.score_equipe1 - totalTeam1,
          score_equipe2: game.score_equipe2 - totalTeam2,
        });

        // Supprimer la manche
        return roundRepo.delete(lastRound.id);
      })();
    } catch (error) {
      console.error('Error deleting last round:', error);
      throw new Error('Failed to delete last round');
    }
  });
}
