import {
  validatePlayerNames,
  isFormValid,
  validateRound3Players,
  isRound3PlayersValid,
  type PlayerNames,
  type Round3PlayersData,
} from '../../src/renderer/utils/gameValidation';
import type { GameMode } from '../../src/shared/types';

describe('validatePlayerNames', () => {
  describe('4 players mode', () => {
    const gameMode: GameMode = '4_joueurs';

    it('should return no errors for valid 4 player names', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors).toEqual({});
    });

    it('should return error for names with less than 2 characters', () => {
      const playerNames: PlayerNames = {
        player1: 'A',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors.player1).toBe('Minimum 2 caractères');
      expect(errors.player2).toBeUndefined();
    });

    it('should return error for duplicate names (case insensitive)', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'alice',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors.general).toBe('Les noms des joueurs doivent être uniques');
    });

    it('should trim whitespace before validation', () => {
      const playerNames: PlayerNames = {
        player1: '  Alice  ',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors).toEqual({});
    });

    it('should allow empty names to not trigger minimum length error', () => {
      const playerNames: PlayerNames = {
        player1: '',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors.player1).toBeUndefined();
    });

    it('should detect multiple validation errors', () => {
      const playerNames: PlayerNames = {
        player1: 'A',
        player2: 'B',
        player3: 'Charlie',
        player4: 'David',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors.player1).toBe('Minimum 2 caractères');
      expect(errors.player2).toBe('Minimum 2 caractères');
    });
  });

  describe('3 players mode', () => {
    const gameMode: GameMode = '3_joueurs';

    it('should return no errors for valid 3 player names', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: '', // Should be ignored in 3-player mode
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors).toEqual({});
    });

    it('should ignore player4 in 3-player mode', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'X', // Should be ignored
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors).toEqual({});
    });

    it('should return error for duplicate names in 3-player mode', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Alice',
        player4: '',
      };

      const errors = validatePlayerNames(playerNames, gameMode);
      expect(errors.general).toBe('Les noms des joueurs doivent être uniques');
    });
  });
});

describe('isFormValid', () => {
  describe('4 players mode', () => {
    const gameMode: GameMode = '4_joueurs';

    it('should return true for valid form with 4 players', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(true);
    });

    it('should return false if any player name is missing', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: '',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(false);
    });

    it('should return false if there are validation errors', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Alice', // Duplicate
        player4: 'David',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(false);
    });

    it('should return false if any name is too short', () => {
      const playerNames: PlayerNames = {
        player1: 'A',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(false);
    });
  });

  describe('3 players mode', () => {
    const gameMode: GameMode = '3_joueurs';

    it('should return true for valid form with 3 players', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: '',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(true);
    });

    it('should return false if any of the 3 players is missing', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: '',
        player4: '',
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(false);
    });

    it('should return true even if player4 has a value', () => {
      const playerNames: PlayerNames = {
        player1: 'Alice',
        player2: 'Bob',
        player3: 'Charlie',
        player4: 'David', // Should be ignored
      };
      const errors = validatePlayerNames(playerNames, gameMode);

      expect(isFormValid(playerNames, gameMode, errors)).toBe(true);
    });
  });
});

describe('validateRound3Players', () => {
  describe('Player rotation (au pot)', () => {
    it('should identify player 1 as au pot for round 1', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 1,
        pointsTeam1: 100,
        pointsTeam2: 62,
        pointsTeam3: 0,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.callingTeam).toBe('Le joueur 1 est au pot et ne peut pas prendre');
      expect(errors.points).toBe('Le joueur 1 est au pot et doit avoir 0 points');
    });

    it('should identify player 2 as au pot for round 2', () => {
      const data: Round3PlayersData = {
        roundNumber: 2,
        callingTeam: 2,
        pointsTeam1: 100,
        pointsTeam2: 62,
        pointsTeam3: 0,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.callingTeam).toBe('Le joueur 2 est au pot et ne peut pas prendre');
      expect(errors.points).toBe('Le joueur 2 est au pot et doit avoir 0 points');
    });

    it('should identify player 3 as au pot for round 3', () => {
      const data: Round3PlayersData = {
        roundNumber: 3,
        callingTeam: 3,
        pointsTeam1: 100,
        pointsTeam2: 0,
        pointsTeam3: 62,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.callingTeam).toBe('Le joueur 3 est au pot et ne peut pas prendre');
      expect(errors.points).toBe('Le joueur 3 est au pot et doit avoir 0 points');
    });

    it('should cycle back to player 1 for round 4', () => {
      const data: Round3PlayersData = {
        roundNumber: 4,
        callingTeam: 1,
        pointsTeam1: 100,
        pointsTeam2: 62,
        pointsTeam3: 0,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.callingTeam).toBe('Le joueur 1 est au pot et ne peut pas prendre');
    });
  });

  describe('Valid scenarios', () => {
    it('should pass when player 1 is au pot and players 2+3 total 162', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 2,
        pointsTeam1: 0,
        pointsTeam2: 100,
        pointsTeam3: 62,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors).toEqual({});
    });

    it('should pass when player 2 is au pot and players 1+3 total 162', () => {
      const data: Round3PlayersData = {
        roundNumber: 2,
        callingTeam: 1,
        pointsTeam1: 82,
        pointsTeam2: 0,
        pointsTeam3: 80,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors).toEqual({});
    });

    it('should pass when player 3 is au pot and players 1+2 total 162', () => {
      const data: Round3PlayersData = {
        roundNumber: 3,
        callingTeam: 2,
        pointsTeam1: 52,
        pointsTeam2: 110,
        pointsTeam3: 0,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors).toEqual({});
    });

    it('should allow 0 total when form is not yet filled', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 2,
        pointsTeam1: 0,
        pointsTeam2: 0,
        pointsTeam3: 0,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.general).toBeUndefined();
    });
  });

  describe('Invalid scenarios - wrong total', () => {
    it('should fail when active players total is not 162', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 2,
        pointsTeam1: 0,
        pointsTeam2: 100,
        pointsTeam3: 50, // Total is 150, not 162
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.general).toBe('Le total des points des 2 joueurs actifs doit être 162 (actuel: 150)');
    });

    it('should fail when active players total exceeds 162', () => {
      const data: Round3PlayersData = {
        roundNumber: 2,
        callingTeam: 3,
        pointsTeam1: 100,
        pointsTeam2: 0,
        pointsTeam3: 70, // Total is 170
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.general).toBe('Le total des points des 2 joueurs actifs doit être 162 (actuel: 170)');
    });
  });

  describe('Invalid scenarios - player au pot has points', () => {
    it('should fail when player 1 is au pot but has points', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 2,
        pointsTeam1: 10, // Should be 0
        pointsTeam2: 100,
        pointsTeam3: 62,
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.points).toBe('Le joueur 1 est au pot et doit avoir 0 points');
    });

    it('should fail when player au pot has announcements', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 2,
        pointsTeam1: 0,
        pointsTeam2: 100,
        pointsTeam3: 62,
        announcementsTeam1: 20, // Should be 0
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.points).toBe('Le joueur 1 est au pot et doit avoir 0 points');
    });
  });

  describe('Multiple validation errors', () => {
    it('should report all errors when multiple rules are violated', () => {
      const data: Round3PlayersData = {
        roundNumber: 1,
        callingTeam: 1, // Player 1 is au pot, cannot take
        pointsTeam1: 50, // Player 1 should have 0 points
        pointsTeam2: 100,
        pointsTeam3: 50, // Total is 150, not 162
        announcementsTeam1: 0,
        announcementsTeam2: 0,
        announcementsTeam3: 0,
      };

      const errors = validateRound3Players(data);
      expect(errors.callingTeam).toBeDefined();
      expect(errors.points).toBeDefined();
      expect(errors.general).toBeDefined();
    });
  });
});

describe('isRound3PlayersValid', () => {
  it('should return true for valid data with no errors', () => {
    const data: Round3PlayersData = {
      roundNumber: 1,
      callingTeam: 2,
      pointsTeam1: 0,
      pointsTeam2: 100,
      pointsTeam3: 62,
      announcementsTeam1: 0,
      announcementsTeam2: 0,
      announcementsTeam3: 0,
    };
    const errors = validateRound3Players(data);

    expect(isRound3PlayersValid(data, errors)).toBe(true);
  });

  it('should return false when there are validation errors', () => {
    const data: Round3PlayersData = {
      roundNumber: 1,
      callingTeam: 1, // Error: player 1 is au pot
      pointsTeam1: 0,
      pointsTeam2: 100,
      pointsTeam3: 62,
      announcementsTeam1: 0,
      announcementsTeam2: 0,
      announcementsTeam3: 0,
    };
    const errors = validateRound3Players(data);

    expect(isRound3PlayersValid(data, errors)).toBe(false);
  });

  it('should return false when all points are 0', () => {
    const data: Round3PlayersData = {
      roundNumber: 1,
      callingTeam: 2,
      pointsTeam1: 0,
      pointsTeam2: 0,
      pointsTeam3: 0,
      announcementsTeam1: 0,
      announcementsTeam2: 0,
      announcementsTeam3: 0,
    };
    const errors = validateRound3Players(data);

    expect(isRound3PlayersValid(data, errors)).toBe(false);
  });
});
