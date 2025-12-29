// Shared TypeScript types and interfaces

// Window API (for Electron IPC)
export interface CreateGameParams {
  mode: GameMode;
  playerNames: string[];
}

export interface GameData {
  game: Game;
  players: Array<{ id: number; nom: string; equipe: number }>;
  rounds: Round[];
}

export interface CreateRoundParams {
  gameId: number;
  trumpSuit: TrumpSuit;
  callingTeam: 1 | 2;
  pointsTeam1: number;
  pointsTeam2: number;
  announcementsTeam1: number;
  announcementsTeam2: number;
  beloteTeam: 0 | 1 | 2;
}

export interface ElectronAPI {
  quit: () => void;
  createGame?: (params: CreateGameParams) => Promise<number>;
  getGame?: (gameId: number) => Promise<GameData>;
  createRound?: (params: CreateRoundParams) => Promise<Round>;
  deleteLastRound?: (gameId: number) => Promise<boolean>;
  finalizeGame?: (params: FinalizeGameParams) => Promise<Game>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export type GameMode = '4_joueurs' | '3_joueurs';

export type TrumpSuit = 'pique' | 'coeur' | 'carreau' | 'trefle' | 'sans_atout' | 'tout_atout';

export interface Player {
  id: number;
  nom: string;
  date_creation: string;
}

export interface Game {
  id: number;
  date: string;
  mode: GameMode;
  equipe1_nom: string | null;
  equipe2_nom: string | null;
  score_equipe1: number;
  score_equipe2: number;
  gagnant: number | null;
  terminee: boolean;
  duree_minutes: number | null;
}

export interface Round {
  id: number;
  partie_id: number;
  numero: number;
  atout: TrumpSuit;
  preneur_equipe: number;
  points_equipe1: number;
  points_equipe2: number;
  annonces_equipe1: number;
  annonces_equipe2: number;
  belote_equipe: number;
  timestamp: string;
}

// Statistiques complètes d'une partie
export interface GameStatistics {
  // Métadonnées de la partie
  totalRounds: number;
  duration: number; // en minutes
  winner: 1 | 2;
  finalScores: {
    team1: number;
    team2: number;
  };

  // Distribution des prises
  roundDistribution: {
    team1: { count: number; percentage: number };
    team2: { count: number; percentage: number };
  };

  // Distribution des atouts
  trumpDistribution: {
    pique: number;
    coeur: number;
    carreau: number;
    trefle: number;
    sans_atout: number;
    tout_atout: number;
  };

  // Taux de réussite (prises gagnées par équipe)
  successRate: {
    team1: { successful: number; total: number; percentage: number };
    team2: { successful: number; total: number; percentage: number };
  };

  // Meilleures manches
  bestRounds: {
    team1: { roundNumber: number; points: number; trump: TrumpSuit } | null;
    team2: { roundNumber: number; points: number; trump: TrumpSuit } | null;
  };

  // Annonces et belotes
  totalAnnouncements: {
    team1: number;
    team2: number;
  };

  beloteCount: {
    team1: number;
    team2: number;
  };
}

// Paramètres de finalisation
export interface FinalizeGameParams {
  gameId: number;
  forced: boolean; // true si manuel, false si auto (seuil atteint)
}
