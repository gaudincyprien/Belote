import type { GameMode } from '../../shared/types';

export interface PlayerNames {
  player1: string;
  player2: string;
  player3: string;
  player4: string;
}

export interface ValidationErrors {
  player1?: string;
  player2?: string;
  player3?: string;
  player4?: string;
  general?: string;
}

/**
 * Validate player names for a new game
 * @param playerNames The player names to validate
 * @param gameMode The game mode (4 or 3 players)
 * @returns Validation errors if any
 */
export function validatePlayerNames(
  playerNames: PlayerNames,
  gameMode: GameMode
): ValidationErrors {
  const errors: ValidationErrors = {};
  const numPlayers = gameMode === '4_joueurs' ? 4 : 3;

  // Trim all names for validation
  const trimmedNames = Object.entries(playerNames)
    .slice(0, numPlayers)
    .map(([key, value]) => ({ key, value: value.trim() }));

  // Check minimum length (2 characters)
  trimmedNames.forEach(({ key, value }) => {
    if (value.length > 0 && value.length < 2) {
      errors[key as keyof PlayerNames] = 'Minimum 2 caractères';
    }
  });

  // Check for duplicates
  const names = trimmedNames.map(({ value }) => value.toLowerCase()).filter(n => n.length > 0);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

  if (duplicates.length > 0) {
    errors.general = 'Les noms des joueurs doivent être uniques';
  }

  return errors;
}

/**
 * Check if the game form is valid
 * @param playerNames The player names
 * @param gameMode The game mode
 * @param validationErrors The validation errors
 * @returns true if the form is valid
 */
export function isFormValid(
  playerNames: PlayerNames,
  gameMode: GameMode,
  validationErrors: ValidationErrors
): boolean {
  const numPlayers = gameMode === '4_joueurs' ? 4 : 3;
  const requiredNames = Object.values(playerNames)
    .slice(0, numPlayers)
    .map(name => name.trim())
    .filter(name => name.length >= 2);

  return (
    requiredNames.length === numPlayers &&
    Object.keys(validationErrors).length === 0
  );
}
