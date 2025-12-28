import { validatePlayerNames, isFormValid, PlayerNames } from '../../src/renderer/utils/gameValidation';
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
