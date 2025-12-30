import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import type {
  PlayerStatistics,
  PlayerTrumpStat,
  PartnerStat,
  PlayerRecords,
  PlayerRecentActivity,
  WinEvolutionPoint,
  TrumpSuit,
} from '../../shared/types';

/**
 * Repository for calculating individual player statistics
 */
export class PlayerStatisticsRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  /**
   * Get complete statistics for a specific player
   */
  getPlayerStatistics(playerId: number): PlayerStatistics {
    // Get basic info
    const playerInfo = this.db
      .prepare('SELECT nom FROM joueurs WHERE id = ?')
      .get(playerId) as { nom: string } | undefined;

    if (!playerInfo) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    // Get member since (first game date)
    const firstGameResult = this.db
      .prepare(`
        SELECT p.date
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
        ORDER BY p.date ASC
        LIMIT 1
      `)
      .get(playerId) as { date: string } | undefined;

    const memberSince = firstGameResult?.date || new Date().toISOString();

    // Get overview stats
    const overviewStats = this.getOverviewStats(playerId);

    // Get trump stats
    const trumpStats = this.getTrumpStats(playerId);

    // Get partner stats
    const partnerStats = this.getPartnerStats(playerId);

    // Get personal records
    const personalRecords = this.getPersonalRecords(playerId);

    // Get recent activity
    const recentActivity = this.getRecentActivity(playerId);

    // Get win evolution
    const winEvolution = this.getWinEvolution(playerId);

    return {
      playerId,
      playerName: playerInfo.nom,
      memberSince,
      ...overviewStats,
      trumpStats: trumpStats.stats,
      mostEffectiveTrump: trumpStats.mostEffective,
      leastEffectiveTrump: trumpStats.leastEffective,
      partnerStats,
      personalRecords,
      recentActivity,
      winEvolution,
    };
  }

  /**
   * Get overview statistics (games, wins, losses, win rate)
   */
  private getOverviewStats(playerId: number): {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
  } {
    const result = this.db
      .prepare(`
        SELECT
          COUNT(*) as gamesPlayed,
          SUM(CASE WHEN p.gagnant = pj.equipe THEN 1 ELSE 0 END) as wins
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
      `)
      .get(playerId) as { gamesPlayed: number; wins: number } | undefined;

    const gamesPlayed = result?.gamesPlayed || 0;
    const wins = result?.wins || 0;
    const losses = gamesPlayed - wins;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100 * 10) / 10 : 0;

    return {
      gamesPlayed,
      wins,
      losses,
      winRate,
    };
  }

  /**
   * Get trump statistics for the player
   */
  private getTrumpStats(playerId: number): {
    stats: PlayerTrumpStat[];
    mostEffective: TrumpSuit | null;
    leastEffective: TrumpSuit | null;
  } {
    const stats = this.db
      .prepare(`
        SELECT
          m.atout as trump,
          COUNT(*) as takes,
          SUM(
            CASE
              WHEN (
                (m.preneur_equipe = 1 AND m.points_equipe1 + m.annonces_equipe1 > m.points_equipe2 + m.annonces_equipe2) OR
                (m.preneur_equipe = 2 AND m.points_equipe2 + m.annonces_equipe2 > m.points_equipe1 + m.annonces_equipe1) OR
                (m.preneur_equipe = 3 AND m.points_equipe3 + m.annonces_equipe3 > GREATEST(m.points_equipe1 + m.annonces_equipe1, m.points_equipe2 + m.annonces_equipe2))
              ) THEN 1
              ELSE 0
            END
          ) as successful
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND pj.equipe = m.preneur_equipe AND p.terminee = 1
        GROUP BY m.atout
      `)
      .all(playerId) as Array<{
        trump: TrumpSuit;
        takes: number;
        successful: number;
      }>;

    const playerTrumpStats: PlayerTrumpStat[] = stats.map((stat) => ({
      trump: stat.trump,
      takes: stat.takes,
      successRate: stat.takes > 0 ? Math.round((stat.successful / stat.takes) * 100 * 10) / 10 : 0,
    }));

    // Find most and least effective trumps
    let mostEffective: TrumpSuit | null = null;
    let leastEffective: TrumpSuit | null = null;
    let maxSuccessRate = -1;
    let minSuccessRate = 101;

    playerTrumpStats.forEach((stat) => {
      if (stat.takes > 0) {
        if (stat.successRate > maxSuccessRate) {
          maxSuccessRate = stat.successRate;
          mostEffective = stat.trump;
        }
        if (stat.successRate < minSuccessRate) {
          minSuccessRate = stat.successRate;
          leastEffective = stat.trump;
        }
      }
    });

    return {
      stats: playerTrumpStats,
      mostEffective,
      leastEffective,
    };
  }

  /**
   * Get partner statistics (4-player mode only)
   */
  private getPartnerStats(playerId: number): PartnerStat[] {
    const stats = this.db
      .prepare(`
        SELECT
          j.id as partnerId,
          j.nom as partnerName,
          COUNT(*) as gamesPlayed,
          SUM(CASE WHEN p.gagnant = pj1.equipe THEN 1 ELSE 0 END) as wins
        FROM parties p
        INNER JOIN parties_joueurs pj1 ON p.id = pj1.partie_id
        INNER JOIN parties_joueurs pj2 ON p.id = pj2.partie_id
        INNER JOIN joueurs j ON pj2.joueur_id = j.id
        WHERE
          p.mode = '4_joueurs' AND
          p.terminee = 1 AND
          pj1.joueur_id = ? AND
          pj2.joueur_id != ? AND
          pj1.equipe = pj2.equipe
        GROUP BY j.id, j.nom
        ORDER BY wins DESC, gamesPlayed DESC
      `)
      .all(playerId, playerId) as Array<{
        partnerId: number;
        partnerName: string;
        gamesPlayed: number;
        wins: number;
      }>;

    return stats.map((stat) => ({
      partnerId: stat.partnerId,
      partnerName: stat.partnerName,
      gamesPlayed: stat.gamesPlayed,
      wins: stat.wins,
      winRate: stat.gamesPlayed > 0 ? Math.round((stat.wins / stat.gamesPlayed) * 100 * 10) / 10 : 0,
    }));
  }

  /**
   * Get personal records for the player
   */
  private getPersonalRecords(playerId: number): PlayerRecords {
    // Best round score
    const bestRoundResult = this.db
      .prepare(`
        SELECT
          m.partie_id as gameId,
          m.numero as roundNumber,
          m.atout as trump,
          CASE
            WHEN pj.equipe = 1 THEN m.points_equipe1 + m.annonces_equipe1
            WHEN pj.equipe = 2 THEN m.points_equipe2 + m.annonces_equipe2
            ELSE m.points_equipe3 + m.annonces_equipe3
          END as points
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
        ORDER BY points DESC
        LIMIT 1
      `)
      .get(playerId) as
        | { gameId: number; roundNumber: number; trump: TrumpSuit; points: number }
        | undefined;

    const bestRoundScore = bestRoundResult
      ? {
          gameId: bestRoundResult.gameId,
          roundNumber: bestRoundResult.roundNumber,
          points: bestRoundResult.points,
          trump: bestRoundResult.trump,
        }
      : null;

    // Longest win streak
    const longestWinStreak = this.calculatePlayerWinStreak(playerId);

    // Average points per game
    const avgPointsResult = this.db
      .prepare(`
        SELECT AVG(
          CASE
            WHEN pj.equipe = 1 THEN p.score_equipe1
            WHEN pj.equipe = 2 THEN p.score_equipe2
            ELSE p.score_equipe3
          END
        ) as avgPoints
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
      `)
      .get(playerId) as { avgPoints: number | null } | undefined;

    const averagePointsPerGame = Math.round(avgPointsResult?.avgPoints || 0);

    // Total takes (number of times player was preneur)
    const totalTakesResult = this.db
      .prepare(`
        SELECT COUNT(*) as total
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND pj.equipe = m.preneur_equipe AND p.terminee = 1
      `)
      .get(playerId) as { total: number } | undefined;

    const totalTakes = totalTakesResult?.total || 0;

    // Total belotes
    const totalBelotesResult = this.db
      .prepare(`
        SELECT COUNT(*) as total
        FROM manches m
        INNER JOIN parties p ON m.partie_id = p.id
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1 AND (
          (pj.equipe = 1 AND m.belote_equipe1 = 1) OR
          (pj.equipe = 2 AND m.belote_equipe2 = 1) OR
          (pj.equipe = 3 AND m.belote_equipe3 = 1)
        )
      `)
      .get(playerId) as { total: number } | undefined;

    const totalBelotes = totalBelotesResult?.total || 0;

    return {
      bestRoundScore,
      longestWinStreak,
      averagePointsPerGame,
      totalTakes,
      totalBelotes,
    };
  }

  /**
   * Calculate longest win streak for a player
   */
  private calculatePlayerWinStreak(playerId: number): number {
    const result = this.db
      .prepare(`
        WITH player_games AS (
          SELECT
            p.id as game_id,
            p.date,
            CASE WHEN p.gagnant = pj.equipe THEN 1 ELSE 0 END as is_win,
            ROW_NUMBER() OVER (ORDER BY p.date) as game_num
          FROM parties p
          INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
          WHERE pj.joueur_id = ? AND p.terminee = 1
        ),
        streak_groups AS (
          SELECT
            is_win,
            game_num,
            game_num - ROW_NUMBER() OVER (PARTITION BY is_win ORDER BY game_num) as streak_group
          FROM player_games
        ),
        streak_lengths AS (
          SELECT
            COUNT(*) as streak_length
          FROM streak_groups
          WHERE is_win = 1
          GROUP BY streak_group
        )
        SELECT COALESCE(MAX(streak_length), 0) as maxStreak
        FROM streak_lengths
      `)
      .get(playerId) as { maxStreak: number } | undefined;

    return result?.maxStreak || 0;
  }

  /**
   * Get recent activity
   */
  private getRecentActivity(playerId: number): PlayerRecentActivity {
    // Last game
    const lastGameResult = this.db
      .prepare(`
        SELECT
          p.date,
          CASE WHEN p.gagnant = pj.equipe THEN 'win' ELSE 'loss' END as result
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
        ORDER BY p.date DESC
        LIMIT 1
      `)
      .get(playerId) as { date: string; result: 'win' | 'loss' } | undefined;

    const lastGameDate = lastGameResult?.date || null;
    const lastGameResult2 = lastGameResult?.result || null;

    // Games this month
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    const monthStatsResult = this.db
      .prepare(`
        SELECT
          COUNT(*) as gamesThisMonth,
          SUM(CASE WHEN p.gagnant = pj.equipe THEN 1 ELSE 0 END) as winsThisMonth
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1 AND p.date LIKE ?
      `)
      .get(playerId, `${currentMonth}%`) as
        | { gamesThisMonth: number; winsThisMonth: number }
        | undefined;

    const gamesThisMonth = monthStatsResult?.gamesThisMonth || 0;
    const winsThisMonth = monthStatsResult?.winsThisMonth || 0;

    return {
      lastGameDate,
      lastGameResult: lastGameResult2,
      gamesThisMonth,
      winsThisMonth,
    };
  }

  /**
   * Get win evolution over time (for chart)
   */
  private getWinEvolution(playerId: number): WinEvolutionPoint[] {
    const games = this.db
      .prepare(`
        SELECT
          p.date,
          CASE WHEN p.gagnant = pj.equipe THEN 1 ELSE 0 END as is_win
        FROM parties p
        INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
        WHERE pj.joueur_id = ? AND p.terminee = 1
        ORDER BY p.date ASC
      `)
      .all(playerId) as Array<{ date: string; is_win: number }>;

    const evolution: WinEvolutionPoint[] = [];
    let totalGames = 0;
    let totalWins = 0;

    games.forEach((game, index) => {
      totalGames++;
      totalWins += game.is_win;

      // Add a point every 5 games or for the last game
      if ((index + 1) % 5 === 0 || index === games.length - 1) {
        evolution.push({
          gameNumber: totalGames,
          winRate: Math.round((totalWins / totalGames) * 100 * 10) / 10,
          date: game.date,
        });
      }
    });

    return evolution;
  }
}
