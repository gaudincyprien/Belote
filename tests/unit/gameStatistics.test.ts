import { calculateGameStatistics, shouldEndGame } from '../../src/renderer/utils/gameStatistics';
import type { Game, Round } from '../../src/shared/types';

describe('calculateGameStatistics', () => {
  const mockGame: Game = {
    id: 1,
    date: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
    mode: '4_joueurs',
    equipe1_nom: 'J1 & J3',
    equipe2_nom: 'J2 & J4',
    score_equipe1: 1035,
    score_equipe2: 745,
    gagnant: null,
    terminee: false,
    duree_minutes: null,
  };

  it('should calculate winner correctly', () => {
    const stats = calculateGameStatistics(mockGame, []);
    expect(stats.winner).toBe(1); // Team 1 has higher score
  });

  it('should calculate winner as team 2 when they have higher score', () => {
    const game: Game = { ...mockGame, score_equipe1: 500, score_equipe2: 800 };
    const stats = calculateGameStatistics(game, []);
    expect(stats.winner).toBe(2);
  });

  it('should calculate duration in minutes', () => {
    const stats = calculateGameStatistics(mockGame, []);
    expect(stats.duration).toBeGreaterThanOrEqual(44);
    expect(stats.duration).toBeLessThanOrEqual(46);
  });

  it('should have minimum duration of 1 minute', () => {
    const game: Game = { ...mockGame, date: new Date().toISOString() };
    const stats = calculateGameStatistics(game, []);
    expect(stats.duration).toBeGreaterThanOrEqual(1);
  });

  it('should calculate round distribution', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 1, points_equipe1: 120, points_equipe2: 42, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.roundDistribution.team1.count).toBe(2);
    expect(stats.roundDistribution.team2.count).toBe(1);
    expect(stats.roundDistribution.team1.percentage).toBe(67);
    expect(stats.roundDistribution.team2.percentage).toBe(33);
  });

  it('should calculate trump distribution', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'pique', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 3, partie_id: 1, numero: 3, atout: 'coeur', preneur_equipe: 1, points_equipe1: 120, points_equipe2: 42, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 4, partie_id: 1, numero: 4, atout: 'sans_atout', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.trumpDistribution.pique).toBe(2);
    expect(stats.trumpDistribution.coeur).toBe(1);
    expect(stats.trumpDistribution.carreau).toBe(0);
    expect(stats.trumpDistribution.trefle).toBe(0);
    expect(stats.trumpDistribution.sans_atout).toBe(1);
    expect(stats.trumpDistribution.tout_atout).toBe(0);
  });

  it('should calculate success rate correctly', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' }, // Success (100 > 81)
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 1, points_equipe1: 70, points_equipe2: 92, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' }, // Failure (70 <= 81)
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 2, points_equipe1: 60, points_equipe2: 102, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' }, // Success (102 > 81)
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.successRate.team1.successful).toBe(1);
    expect(stats.successRate.team1.total).toBe(2);
    expect(stats.successRate.team1.percentage).toBe(50);
    expect(stats.successRate.team2.successful).toBe(1);
    expect(stats.successRate.team2.total).toBe(1);
    expect(stats.successRate.team2.percentage).toBe(100);
  });

  it('should handle success rate when team never took a round', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 1, points_equipe1: 120, points_equipe2: 42, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.successRate.team2.successful).toBe(0);
    expect(stats.successRate.team2.total).toBe(0);
    expect(stats.successRate.team2.percentage).toBe(0);
  });

  it('should calculate best rounds', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 20, annonces_equipe2: 0, belote_equipe: 1, timestamp: '' }, // Team 1: 140 pts
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, annonces_equipe1: 0, annonces_equipe2: 10, belote_equipe: 0, timestamp: '' }, // Team 2: 122 pts
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 1, points_equipe1: 90, points_equipe2: 72, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' }, // Team 1: 90 pts
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.bestRounds.team1?.points).toBe(140);
    expect(stats.bestRounds.team1?.roundNumber).toBe(1);
    expect(stats.bestRounds.team1?.trump).toBe('pique');
    expect(stats.bestRounds.team2?.points).toBe(122);
    expect(stats.bestRounds.team2?.roundNumber).toBe(2);
    expect(stats.bestRounds.team2?.trump).toBe('coeur');
  });

  it('should calculate total announcements', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 20, annonces_equipe2: 10, belote_equipe: 0, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, annonces_equipe1: 30, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.totalAnnouncements.team1).toBe(50); // 20 + 30
    expect(stats.totalAnnouncements.team2).toBe(10); // 10 + 0
  });

  it('should calculate belote counts', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 62, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 1, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 2, timestamp: '' },
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 1, points_equipe1: 120, points_equipe2: 42, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 1, timestamp: '' },
      { id: 4, partie_id: 1, numero: 4, atout: 'trefle', preneur_equipe: 2, points_equipe1: 60, points_equipe2: 102, annonces_equipe1: 0, annonces_equipe2: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame, rounds);
    expect(stats.beloteCount.team1).toBe(2);
    expect(stats.beloteCount.team2).toBe(1);
  });

  it('should handle game with no rounds', () => {
    const stats = calculateGameStatistics(mockGame, []);
    expect(stats.totalRounds).toBe(0);
    expect(stats.roundDistribution.team1.count).toBe(0);
    expect(stats.roundDistribution.team1.percentage).toBe(0);
    expect(stats.roundDistribution.team2.count).toBe(0);
    expect(stats.roundDistribution.team2.percentage).toBe(0);
    expect(stats.bestRounds.team1).toBeNull();
    expect(stats.bestRounds.team2).toBeNull();
    expect(stats.totalAnnouncements.team1).toBe(0);
    expect(stats.totalAnnouncements.team2).toBe(0);
    expect(stats.beloteCount.team1).toBe(0);
    expect(stats.beloteCount.team2).toBe(0);
  });

  it('should return final scores correctly', () => {
    const stats = calculateGameStatistics(mockGame, []);
    expect(stats.finalScores.team1).toBe(1035);
    expect(stats.finalScores.team2).toBe(745);
  });
});

describe('shouldEndGame', () => {
  const mockGame: Game = {
    id: 1,
    date: new Date().toISOString(),
    mode: '4_joueurs',
    equipe1_nom: 'J1 & J3',
    equipe2_nom: 'J2 & J4',
    score_equipe1: 800,
    score_equipe2: 700,
    gagnant: null,
    terminee: false,
    duree_minutes: null,
  };

  it('should return true when team 1 reaches threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 1000, score_equipe2: 500 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when team 1 exceeds threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 1200, score_equipe2: 500 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when team 2 reaches threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 500, score_equipe2: 1000 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when team 2 exceeds threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 500, score_equipe2: 1200 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return false when neither team reaches threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 800, score_equipe2: 700 };
    expect(shouldEndGame(game)).toBe(false);
  });

  it('should return true when both teams reach threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 1050, score_equipe2: 1020 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should use custom threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 800, score_equipe2: 700 };
    expect(shouldEndGame(game, 750)).toBe(true);
  });

  it('should use custom threshold - false case', () => {
    const game: Game = { ...mockGame, score_equipe1: 800, score_equipe2: 700 };
    expect(shouldEndGame(game, 850)).toBe(false);
  });

  it('should return false with score exactly one below threshold', () => {
    const game: Game = { ...mockGame, score_equipe1: 999, score_equipe2: 700 };
    expect(shouldEndGame(game, 1000)).toBe(false);
  });
});

describe('calculateGameStatistics - 3 players mode', () => {
  const mockGame3Players: Game = {
    id: 1,
    date: new Date(Date.now() - 60 * 60000).toISOString(), // 60 min ago
    mode: '3_joueurs',
    equipe1_nom: 'Alice',
    equipe2_nom: 'Bob',
    equipe3_nom: 'Charlie',
    score_equipe1: 420,
    score_equipe2: 380,
    score_equipe3: 350,
    gagnant: null,
    terminee: false,
    duree_minutes: null,
  };

  it('should calculate winner correctly for 3 players (player 1 wins)', () => {
    const stats = calculateGameStatistics(mockGame3Players, []);
    expect(stats.winner).toBe(1); // Player 1 has highest score (420)
  });

  it('should calculate winner correctly for 3 players (player 2 wins)', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 300, score_equipe2: 500, score_equipe3: 350 };
    const stats = calculateGameStatistics(game, []);
    expect(stats.winner).toBe(2);
  });

  it('should calculate winner correctly for 3 players (player 3 wins)', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 300, score_equipe2: 350, score_equipe3: 450 };
    const stats = calculateGameStatistics(game, []);
    expect(stats.winner).toBe(3);
  });

  it('should include roundDistribution3 stats for 3-player mode', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 2, points_equipe1: 0, points_equipe2: 100, points_equipe3: 62, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 1, points_equipe1: 90, points_equipe2: 0, points_equipe3: 72, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' },
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 3, points_equipe1: 50, points_equipe2: 112, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' },
      { id: 4, partie_id: 1, numero: 4, atout: 'trefle', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 0, points_equipe3: 62, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame3Players, rounds);
    expect(stats.roundDistribution3).toBeDefined();
    expect(stats.roundDistribution3!.player1.count).toBe(2);
    expect(stats.roundDistribution3!.player2.count).toBe(1);
    expect(stats.roundDistribution3!.player3.count).toBe(1);
    expect(stats.roundDistribution3!.player1.percentage).toBe(50);
    expect(stats.roundDistribution3!.player2.percentage).toBe(25);
    expect(stats.roundDistribution3!.player3.percentage).toBe(25);
  });

  it('should include successRate3 stats for 3-player mode', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 0, points_equipe3: 62, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 1 success
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 1, points_equipe1: 70, points_equipe2: 0, points_equipe3: 92, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 1 failure
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 2 success
      { id: 4, partie_id: 1, numero: 4, atout: 'trefle', preneur_equipe: 3, points_equipe1: 100, points_equipe2: 0, points_equipe3: 62, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 3 failure
    ];

    const stats = calculateGameStatistics(mockGame3Players, rounds);
    expect(stats.successRate3).toBeDefined();
    expect(stats.successRate3!.player1.successful).toBe(1);
    expect(stats.successRate3!.player1.total).toBe(2);
    expect(stats.successRate3!.player1.percentage).toBe(50);
    expect(stats.successRate3!.player2.successful).toBe(1);
    expect(stats.successRate3!.player2.total).toBe(1);
    expect(stats.successRate3!.player2.percentage).toBe(100);
    expect(stats.successRate3!.player3.successful).toBe(0);
    expect(stats.successRate3!.player3.total).toBe(1);
    expect(stats.successRate3!.player3.percentage).toBe(0);
  });

  it('should include bestRounds3 stats for 3-player mode', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 120, points_equipe2: 0, points_equipe3: 42, annonces_equipe1: 10, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 1, timestamp: '' }, // Player 1: 150 pts
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 20, annonces_equipe3: 0, belote_equipe: 2, timestamp: '' }, // Player 2: 152 pts
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 2, points_equipe1: 60, points_equipe2: 102, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 2: 102 pts
      { id: 4, partie_id: 1, numero: 4, atout: 'trefle', preneur_equipe: 3, points_equipe1: 90, points_equipe2: 0, points_equipe3: 72, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 0, belote_equipe: 0, timestamp: '' }, // Player 3: 72 pts
    ];

    const stats = calculateGameStatistics(mockGame3Players, rounds);
    expect(stats.bestRounds3).toBeDefined();
    expect(stats.bestRounds3!.player1?.points).toBe(150);
    expect(stats.bestRounds3!.player1?.roundNumber).toBe(1);
    expect(stats.bestRounds3!.player1?.trump).toBe('pique');
    expect(stats.bestRounds3!.player2?.points).toBe(152);
    expect(stats.bestRounds3!.player2?.roundNumber).toBe(2);
    expect(stats.bestRounds3!.player2?.trump).toBe('coeur');
    expect(stats.bestRounds3!.player3?.points).toBe(72);
    expect(stats.bestRounds3!.player3?.roundNumber).toBe(4);
    expect(stats.bestRounds3!.player3?.trump).toBe('trefle');
  });

  it('should include totalAnnouncements3 and beloteCount3 for 3-player mode', () => {
    const rounds: Round[] = [
      { id: 1, partie_id: 1, numero: 1, atout: 'pique', preneur_equipe: 1, points_equipe1: 100, points_equipe2: 0, points_equipe3: 62, annonces_equipe1: 20, annonces_equipe2: 0, annonces_equipe3: 10, belote_equipe: 1, timestamp: '' },
      { id: 2, partie_id: 1, numero: 2, atout: 'coeur', preneur_equipe: 2, points_equipe1: 50, points_equipe2: 112, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 30, annonces_equipe3: 0, belote_equipe: 2, timestamp: '' },
      { id: 3, partie_id: 1, numero: 3, atout: 'carreau', preneur_equipe: 3, points_equipe1: 60, points_equipe2: 102, points_equipe3: 0, annonces_equipe1: 0, annonces_equipe2: 0, annonces_equipe3: 10, belote_equipe: 3, timestamp: '' },
    ];

    const stats = calculateGameStatistics(mockGame3Players, rounds);
    expect(stats.totalAnnouncements3).toBeDefined();
    expect(stats.totalAnnouncements3!.player1).toBe(20);
    expect(stats.totalAnnouncements3!.player2).toBe(30);
    expect(stats.totalAnnouncements3!.player3).toBe(20);
    expect(stats.beloteCount3).toBeDefined();
    expect(stats.beloteCount3!.player1).toBe(1);
    expect(stats.beloteCount3!.player2).toBe(1);
    expect(stats.beloteCount3!.player3).toBe(1);
  });

  it('should include finalScores3 for 3-player mode', () => {
    const stats = calculateGameStatistics(mockGame3Players, []);
    expect(stats.finalScores3).toBeDefined();
    expect(stats.finalScores3!.player1).toBe(420);
    expect(stats.finalScores3!.player2).toBe(380);
    expect(stats.finalScores3!.player3).toBe(350);
  });

  it('should handle 3-player game with no rounds', () => {
    const stats = calculateGameStatistics(mockGame3Players, []);
    expect(stats.totalRounds).toBe(0);
    expect(stats.roundDistribution3!.player1.count).toBe(0);
    expect(stats.roundDistribution3!.player2.count).toBe(0);
    expect(stats.roundDistribution3!.player3.count).toBe(0);
    expect(stats.bestRounds3!.player1).toBeNull();
    expect(stats.bestRounds3!.player2).toBeNull();
    expect(stats.bestRounds3!.player3).toBeNull();
  });

  it('should not include 3-player stats for 4-player mode', () => {
    const game4P: Game = {
      id: 1,
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 500,
      score_equipe2: 400,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    };

    const stats = calculateGameStatistics(game4P, []);
    expect(stats.roundDistribution3).toBeUndefined();
    expect(stats.successRate3).toBeUndefined();
    expect(stats.bestRounds3).toBeUndefined();
    expect(stats.totalAnnouncements3).toBeUndefined();
    expect(stats.beloteCount3).toBeUndefined();
    expect(stats.finalScores3).toBeUndefined();
  });
});

describe('shouldEndGame - 3 players mode', () => {
  const mockGame3Players: Game = {
    id: 1,
    date: new Date().toISOString(),
    mode: '3_joueurs',
    equipe1_nom: 'Alice',
    equipe2_nom: 'Bob',
    equipe3_nom: 'Charlie',
    score_equipe1: 800,
    score_equipe2: 700,
    score_equipe3: 600,
    gagnant: null,
    terminee: false,
    duree_minutes: null,
  };

  it('should return true when player 1 reaches threshold', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 1000, score_equipe2: 500, score_equipe3: 400 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when player 2 reaches threshold', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 500, score_equipe2: 1000, score_equipe3: 400 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when player 3 reaches threshold', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 500, score_equipe2: 600, score_equipe3: 1000 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return true when any player exceeds threshold', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 400, score_equipe2: 500, score_equipe3: 1200 };
    expect(shouldEndGame(game)).toBe(true);
  });

  it('should return false when no player reaches threshold', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 800, score_equipe2: 700, score_equipe3: 600 };
    expect(shouldEndGame(game)).toBe(false);
  });

  it('should use custom threshold for 3-player mode', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 600, score_equipe2: 700, score_equipe3: 800 };
    expect(shouldEndGame(game, 750)).toBe(true);
  });

  it('should handle missing score_equipe3 (defaults to 0)', () => {
    const game: Game = { ...mockGame3Players, score_equipe1: 500, score_equipe2: 600 };
    delete game.score_equipe3;
    expect(shouldEndGame(game, 1000)).toBe(false);
  });
});
