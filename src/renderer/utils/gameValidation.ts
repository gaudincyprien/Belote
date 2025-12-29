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

/**
 * Validation data for 3-player round
 */
export interface Round3PlayersData {
  roundNumber: number;
  callingTeam: 1 | 2 | 3;
  pointsTeam1: number;
  pointsTeam2: number;
  pointsTeam3: number;
  announcementsTeam1: number;
  announcementsTeam2: number;
  announcementsTeam3: number;
}

/**
 * Validation errors for 3-player round
 */
export interface Round3PlayersErrors {
  callingTeam?: string;
  points?: string;
  general?: string;
}

/**
 * Validate a round for 3-player mode with rotation
 * Rules:
 * - The player "au pot" (dealer) cannot take
 * - The player "au pot" must have 0 points and 0 announcements
 * - The sum of the 2 active players' points must equal 162
 *
 * @param data The round data to validate
 * @returns Validation errors if any
 */
export function validateRound3Players(data: Round3PlayersData): Round3PlayersErrors {
  const errors: Round3PlayersErrors = {};

  // Calculate which player is "au pot" (dealer, doesn't play)
  const playerAuPot = ((data.roundNumber - 1) % 3 + 1) as 1 | 2 | 3;

  // Rule 1: Player au pot cannot take
  if (data.callingTeam === playerAuPot) {
    errors.callingTeam = `Le joueur ${playerAuPot} est au pot et ne peut pas prendre`;
  }

  // Rule 2: Player au pot must have 0 points and 0 announcements
  if (playerAuPot === 1 && (data.pointsTeam1 !== 0 || data.announcementsTeam1 !== 0)) {
    errors.points = `Le joueur 1 est au pot et doit avoir 0 points`;
  } else if (playerAuPot === 2 && (data.pointsTeam2 !== 0 || data.announcementsTeam2 !== 0)) {
    errors.points = `Le joueur 2 est au pot et doit avoir 0 points`;
  } else if (playerAuPot === 3 && (data.pointsTeam3 !== 0 || data.announcementsTeam3 !== 0)) {
    errors.points = `Le joueur 3 est au pot et doit avoir 0 points`;
  }

  // Rule 3: Sum of 2 active players must equal 162
  const points = [data.pointsTeam1, data.pointsTeam2, data.pointsTeam3];
  const activePoints = points.filter((_, index) => index + 1 !== playerAuPot);
  const total = activePoints[0] + activePoints[1];

  if (total !== 162 && total !== 0) {
    errors.general = `Le total des points des 2 joueurs actifs doit être 162 (actuel: ${total})`;
  }

  return errors;
}

/**
 * Check if a 3-player round is valid
 * @param data The round data
 * @param errors The validation errors
 * @returns true if valid
 */
export function isRound3PlayersValid(
  data: Round3PlayersData,
  errors: Round3PlayersErrors
): boolean {
  return Object.keys(errors).length === 0 && data.pointsTeam1 + data.pointsTeam2 + data.pointsTeam3 > 0;
}
