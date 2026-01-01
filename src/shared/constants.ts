// Application constants

export const DEFAULT_VICTORY_THRESHOLD = 1000;
export const BASE_ROUND_POINTS = 162;
export const BELOTE_POINTS = 20;

export const TRUMP_SUITS = {
  PIQUE: 'pique',
  COEUR: 'coeur',
  CARREAU: 'carreau',
  TREFLE: 'trefle',
  SANS_ATOUT: 'sans_atout',
  TOUT_ATOUT: 'tout_atout',
} as const;

export const GAME_MODES = {
  FOUR_PLAYERS: '4_joueurs',
  THREE_PLAYERS: '3_joueurs',
} as const;
