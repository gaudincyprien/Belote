import type { Game, Round, GameStatistics } from '../../shared/types';

/**
 * Calcule les statistiques complètes d'une partie
 */
export function calculateGameStatistics(game: Game, rounds: Round[]): GameStatistics {
  const totalRounds = rounds.length;

  // Durée (date actuelle - date de création)
  const startTime = new Date(game.date).getTime();
  const endTime = Date.now();
  const duration = Math.max(1, Math.round((endTime - startTime) / 60000)); // minutes

  // Gagnant
  const winner = game.score_equipe1 > game.score_equipe2 ? 1 : 2;

  // Distribution des prises par équipe
  const team1Takes = rounds.filter(r => r.preneur_equipe === 1).length;
  const team2Takes = rounds.filter(r => r.preneur_equipe === 2).length;

  // Distribution des atouts
  const trumpDistribution = {
    pique: rounds.filter(r => r.atout === 'pique').length,
    coeur: rounds.filter(r => r.atout === 'coeur').length,
    carreau: rounds.filter(r => r.atout === 'carreau').length,
    trefle: rounds.filter(r => r.atout === 'trefle').length,
    sans_atout: rounds.filter(r => r.atout === 'sans_atout').length,
    tout_atout: rounds.filter(r => r.atout === 'tout_atout').length,
  };

  // Taux de réussite (prise gagnée = équipe preneuse a marqué > 81 points)
  const team1Successful = rounds.filter(r =>
    r.preneur_equipe === 1 && r.points_equipe1 > 81
  ).length;
  const team2Successful = rounds.filter(r =>
    r.preneur_equipe === 2 && r.points_equipe2 > 81
  ).length;

  // Meilleures manches
  const team1Rounds = rounds.map(r => ({
    number: r.numero,
    points: r.points_equipe1 + r.annonces_equipe1 + (r.belote_equipe === 1 ? 20 : 0),
    trump: r.atout,
  }));
  const team2Rounds = rounds.map(r => ({
    number: r.numero,
    points: r.points_equipe2 + r.annonces_equipe2 + (r.belote_equipe === 2 ? 20 : 0),
    trump: r.atout,
  }));

  const bestTeam1 = team1Rounds.length > 0
    ? team1Rounds.reduce((best, curr) => curr.points > best.points ? curr : best)
    : null;
  const bestTeam2 = team2Rounds.length > 0
    ? team2Rounds.reduce((best, curr) => curr.points > best.points ? curr : best)
    : null;

  // Annonces et belotes
  const totalAnnouncementsTeam1 = rounds.reduce((sum, r) => sum + r.annonces_equipe1, 0);
  const totalAnnouncementsTeam2 = rounds.reduce((sum, r) => sum + r.annonces_equipe2, 0);
  const beloteTeam1 = rounds.filter(r => r.belote_equipe === 1).length;
  const beloteTeam2 = rounds.filter(r => r.belote_equipe === 2).length;

  return {
    totalRounds,
    duration,
    winner,
    finalScores: {
      team1: game.score_equipe1,
      team2: game.score_equipe2,
    },
    roundDistribution: {
      team1: {
        count: team1Takes,
        percentage: totalRounds > 0 ? Math.round((team1Takes / totalRounds) * 100) : 0,
      },
      team2: {
        count: team2Takes,
        percentage: totalRounds > 0 ? Math.round((team2Takes / totalRounds) * 100) : 0,
      },
    },
    trumpDistribution,
    successRate: {
      team1: {
        successful: team1Successful,
        total: team1Takes,
        percentage: team1Takes > 0 ? Math.round((team1Successful / team1Takes) * 100) : 0,
      },
      team2: {
        successful: team2Successful,
        total: team2Takes,
        percentage: team2Takes > 0 ? Math.round((team2Successful / team2Takes) * 100) : 0,
      },
    },
    bestRounds: {
      team1: bestTeam1 ? {
        roundNumber: bestTeam1.number,
        points: bestTeam1.points,
        trump: bestTeam1.trump,
      } : null,
      team2: bestTeam2 ? {
        roundNumber: bestTeam2.number,
        points: bestTeam2.points,
        trump: bestTeam2.trump,
      } : null,
    },
    totalAnnouncements: {
      team1: totalAnnouncementsTeam1,
      team2: totalAnnouncementsTeam2,
    },
    beloteCount: {
      team1: beloteTeam1,
      team2: beloteTeam2,
    },
  };
}

/**
 * Vérifie si une partie doit se terminer (seuil atteint)
 */
export function shouldEndGame(game: Game, victoryThreshold = 1000): boolean {
  return game.score_equipe1 >= victoryThreshold || game.score_equipe2 >= victoryThreshold;
}
