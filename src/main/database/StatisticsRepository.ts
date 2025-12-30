import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import type {
  GlobalStatistics,
  PlayerRanking,
  TrumpStatistics,
  GlobalRecords,
  TrumpSuit,
} from '../../shared/types';

/**
 * Repository pour calculer les statistiques globales
 */
export class StatisticsRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  /**
   * Calculate global statistics (all games combined)
   */
  getGlobalStatistics(): GlobalStatistics {
    // Total games
    const totalGamesResult = this.db
      .prepare('SELECT COUNT(*) as count FROM parties WHERE terminee = 1')
      .get() as { count: number };
    const totalGames = totalGamesResult.count;

    // Total rounds
    const totalRoundsResult = this.db
      .prepare(`
        SELECT COUNT(*) as count
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        WHERE p.terminee = 1
      `)
      .get() as { count: number };
    const totalRounds = totalRoundsResult.count;

    // Total play time
    const totalPlayTimeResult = this.db
      .prepare('SELECT SUM(duree_minutes) as total FROM parties WHERE terminee = 1')
      .get() as { total: number | null };
    const totalPlayTime = totalPlayTimeResult.total || 0;

    // First and last game dates
    const firstGameResult = this.db
      .prepare('SELECT date FROM parties WHERE terminee = 1 ORDER BY date ASC LIMIT 1')
      .get() as { date: string } | undefined;
    const firstGameDate = firstGameResult?.date || null;

    const lastGameResult = this.db
      .prepare('SELECT date FROM parties WHERE terminee = 1 ORDER BY date DESC LIMIT 1')
      .get() as { date: string } | undefined;
    const lastGameDate = lastGameResult?.date || null;

    // Longest game (by duration and rounds)
    const longestGameResult = this.db
      .prepare(`
        SELECT
          p.id as gameId,
          p.duree_minutes as duration,
          (SELECT COUNT(*) FROM manches WHERE partie_id = p.id) as roundCount
        FROM parties p
        WHERE p.terminee = 1
        ORDER BY p.duree_minutes DESC, roundCount DESC
        LIMIT 1
      `)
      .get() as { gameId: number; duration: number; roundCount: number } | undefined;

    const longestGame = longestGameResult
      ? {
          gameId: longestGameResult.gameId,
          duration: longestGameResult.duration,
          roundCount: longestGameResult.roundCount,
        }
      : null;

    return {
      totalGames,
      totalRounds,
      totalPlayTime,
      firstGameDate,
      lastGameDate,
      longestGame,
    };
  }

  /**
   * Get player rankings with win rates
   */
  getPlayerRankings(): PlayerRanking[] {
    const rankings = this.db
      .prepare(`
        WITH player_games AS (
          SELECT
            j.id as playerId,
            j.nom as playerName,
            COUNT(DISTINCT p.id) as gamesPlayed,
            SUM(
              CASE
                WHEN (p.mode = '4_joueurs' AND pj.equipe = p.gagnant) THEN 1
                WHEN (p.mode = '3_joueurs' AND pj.equipe = p.gagnant) THEN 1
                ELSE 0
              END
            ) as wins
          FROM joueurs j
          LEFT JOIN parties_joueurs pj ON j.id = pj.joueur_id
          LEFT JOIN parties p ON pj.partie_id = p.id AND p.terminee = 1
          GROUP BY j.id
          HAVING gamesPlayed > 0
        )
        SELECT
          playerId,
          playerName,
          gamesPlayed,
          wins,
          ROUND((CAST(wins AS FLOAT) / gamesPlayed * 100), 1) as winRate
        FROM player_games
        ORDER BY winRate DESC, wins DESC, gamesPlayed DESC
      `)
      .all() as Array<{
        playerId: number;
        playerName: string;
        gamesPlayed: number;
        wins: number;
        winRate: number;
      }>;

    // Add rank
    return rankings.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * Get trump statistics (frequency and success rate)
   */
  getTrumpStatistics(): TrumpStatistics[] {
    const totalRoundsResult = this.db
      .prepare('SELECT COUNT(*) as count FROM manches')
      .get() as { count: number };
    const totalRounds = totalRoundsResult.count;

    if (totalRounds === 0) {
      return [];
    }

    const trumpStats = this.db
      .prepare(`
        SELECT
          atout as trump,
          COUNT(*) as frequency,
          SUM(
            CASE
              WHEN (
                (preneur_equipe = 1 AND points_equipe1 + annonces_equipe1 > points_equipe2 + annonces_equipe2) OR
                (preneur_equipe = 2 AND points_equipe2 + annonces_equipe2 > points_equipe1 + annonces_equipe1) OR
                (preneur_equipe = 3 AND points_equipe3 + annonces_equipe3 > GREATEST(points_equipe1 + annonces_equipe1, points_equipe2 + annonces_equipe2))
              ) THEN 1
              ELSE 0
            END
          ) as successful
        FROM manches
        GROUP BY atout
      `)
      .all() as Array<{
        trump: TrumpSuit;
        frequency: number;
        successful: number;
      }>;

    return trumpStats.map((stat) => ({
      trump: stat.trump,
      frequency: stat.frequency,
      percentage: Math.round((stat.frequency / totalRounds) * 100 * 10) / 10,
      successRate: stat.frequency > 0 ? Math.round((stat.successful / stat.frequency) * 100 * 10) / 10 : 0,
    }));
  }

  /**
   * Get global records
   */
  getGlobalRecords(): GlobalRecords {
    // Best round score
    const bestRoundResult = this.db
      .prepare(`
        SELECT
          m.partie_id as gameId,
          m.numero as roundNumber,
          m.atout as trump,
          CASE
            WHEN m.points_equipe1 >= m.points_equipe2 AND (m.points_equipe3 IS NULL OR m.points_equipe1 >= m.points_equipe3) THEN m.points_equipe1 + m.annonces_equipe1
            WHEN m.points_equipe2 >= m.points_equipe1 AND (m.points_equipe3 IS NULL OR m.points_equipe2 >= m.points_equipe3) THEN m.points_equipe2 + m.annonces_equipe2
            ELSE m.points_equipe3 + m.annonces_equipe3
          END as points,
          CASE
            WHEN m.points_equipe1 >= m.points_equipe2 AND (m.points_equipe3 IS NULL OR m.points_equipe1 >= m.points_equipe3) THEN 1
            WHEN m.points_equipe2 >= m.points_equipe1 AND (m.points_equipe3 IS NULL OR m.points_equipe2 >= m.points_equipe3) THEN 2
            ELSE 3
          END as winningTeam
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        WHERE p.terminee = 1
        ORDER BY points DESC
        LIMIT 1
      `)
      .get() as
        | { gameId: number; roundNumber: number; points: number; trump: TrumpSuit; winningTeam: number }
        | undefined;

    let bestRoundScore = null;
    if (bestRoundResult) {
      // Get player name for the winning team
      const playerNameResult = this.db
        .prepare(`
          SELECT j.nom as playerName
          FROM parties_joueurs pj
          INNER JOIN joueurs j ON pj.joueur_id = j.id
          WHERE pj.partie_id = ? AND pj.equipe = ?
          LIMIT 1
        `)
        .get(bestRoundResult.gameId, bestRoundResult.winningTeam) as { playerName: string } | undefined;

      bestRoundScore = {
        gameId: bestRoundResult.gameId,
        roundNumber: bestRoundResult.roundNumber,
        playerName: playerNameResult?.playerName || 'Unknown',
        points: bestRoundResult.points,
        trump: bestRoundResult.trump,
      };
    }

    // Fastest game
    const fastestGameResult = this.db
      .prepare(`
        SELECT id as gameId, duree_minutes as duration
        FROM parties
        WHERE terminee = 1 AND duree_minutes IS NOT NULL
        ORDER BY duree_minutes ASC
        LIMIT 1
      `)
      .get() as { gameId: number; duration: number } | undefined;

    const fastestGame = fastestGameResult
      ? { gameId: fastestGameResult.gameId, duration: fastestGameResult.duration }
      : null;

    // Longest win streak
    // This is complex - we need to find consecutive wins for each player
    const longestWinStreak = this.calculateLongestWinStreak();

    // Best duo (4-player mode only)
    const bestDuoResult = this.db
      .prepare(`
        WITH duo_stats AS (
          SELECT
            pj1.joueur_id as player1Id,
            j1.nom as player1Name,
            pj2.joueur_id as player2Id,
            j2.nom as player2Name,
            COUNT(*) as gamesPlayed,
            SUM(CASE WHEN p.gagnant = pj1.equipe THEN 1 ELSE 0 END) as wins
          FROM parties_joueurs pj1
          INNER JOIN parties_joueurs pj2
            ON pj1.partie_id = pj2.partie_id
            AND pj1.equipe = pj2.equipe
            AND pj1.joueur_id < pj2.joueur_id
          INNER JOIN parties p ON pj1.partie_id = p.id
          INNER JOIN joueurs j1 ON pj1.joueur_id = j1.id
          INNER JOIN joueurs j2 ON pj2.joueur_id = j2.id
          WHERE p.mode = '4_joueurs' AND p.terminee = 1
          GROUP BY pj1.joueur_id, pj2.joueur_id
          HAVING gamesPlayed >= 3
        )
        SELECT
          player1Id,
          player1Name,
          player2Id,
          player2Name,
          gamesPlayed,
          wins,
          ROUND((CAST(wins AS FLOAT) / gamesPlayed * 100), 1) as winRate
        FROM duo_stats
        ORDER BY winRate DESC, wins DESC
        LIMIT 1
      `)
      .get() as
        | {
            player1Id: number;
            player1Name: string;
            player2Id: number;
            player2Name: string;
            gamesPlayed: number;
            wins: number;
            winRate: number;
          }
        | undefined;

    const bestDuo = bestDuoResult || null;

    // Most rounds in a game
    const mostRoundsGameResult = this.db
      .prepare(`
        SELECT
          partie_id as gameId,
          COUNT(*) as roundCount
        FROM manches
        GROUP BY partie_id
        ORDER BY roundCount DESC
        LIMIT 1
      `)
      .get() as { gameId: number; roundCount: number } | undefined;

    const mostRoundsGame = mostRoundsGameResult
      ? { gameId: mostRoundsGameResult.gameId, roundCount: mostRoundsGameResult.roundCount }
      : null;

    return {
      bestRoundScore,
      fastestGame,
      longestWinStreak,
      bestDuo,
      mostRoundsGame,
    };
  }

  /**
   * Calculate longest win streak for all players
   * Returns the player with the longest consecutive wins
   * Optimized version using SQL window functions
   */
  private calculateLongestWinStreak(): {
    playerId: number;
    playerName: string;
    streakLength: number;
  } | null {
    // Use SQL to calculate streaks efficiently without loading all data into memory
    const result = this.db
      .prepare(`
        WITH player_games AS (
          -- Get all games for each player with win/loss flag
          SELECT
            pj.joueur_id,
            j.nom as player_name,
            p.id as game_id,
            p.date,
            CASE WHEN p.gagnant = pj.equipe THEN 1 ELSE 0 END as is_win,
            ROW_NUMBER() OVER (PARTITION BY pj.joueur_id ORDER BY p.date) as game_num
          FROM parties_joueurs pj
          INNER JOIN parties p ON pj.partie_id = p.id
          INNER JOIN joueurs j ON pj.joueur_id = j.id
          WHERE p.terminee = 1
        ),
        streak_groups AS (
          -- Create groups for consecutive wins
          SELECT
            joueur_id,
            player_name,
            is_win,
            game_num,
            -- Subtract row number from game number to create groups of consecutive wins
            game_num - ROW_NUMBER() OVER (PARTITION BY joueur_id, is_win ORDER BY game_num) as streak_group
          FROM player_games
        ),
        streak_lengths AS (
          -- Calculate length of each streak
          SELECT
            joueur_id,
            player_name,
            COUNT(*) as streak_length
          FROM streak_groups
          WHERE is_win = 1
          GROUP BY joueur_id, player_name, streak_group
        )
        -- Get the longest streak across all players
        SELECT
          joueur_id as playerId,
          player_name as playerName,
          MAX(streak_length) as streakLength
        FROM streak_lengths
        GROUP BY joueur_id, player_name
        ORDER BY streakLength DESC
        LIMIT 1
      `)
      .get() as { playerId: number; playerName: string; streakLength: number } | undefined;

    return result && result.streakLength > 0 ? result : null;
  }
}
