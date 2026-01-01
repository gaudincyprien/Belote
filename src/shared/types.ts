// Shared TypeScript types and interfaces

// History filters
export interface GameFilters {
  dateFrom?: string;
  dateTo?: string;
  playerId?: number;
  mode?: string;
  sortBy?: 'date' | 'duration' | 'rounds';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface GameListResult {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
  callingTeam: 1 | 2 | 3; // Allow player 3
  pointsTeam1: number;
  pointsTeam2: number;
  pointsTeam3?: number; // NEW - optional for 3-player mode
  announcementsTeam1: number;
  announcementsTeam2: number;
  announcementsTeam3?: number; // NEW - optional for 3-player mode
  beloteTeam: 0 | 1 | 2 | 3; // Allow player 3
}

export interface ElectronAPI {
  quit: () => void;
  createGame?: (params: CreateGameParams) => Promise<number>;
  getGame?: (gameId: number) => Promise<GameData>;
  createRound?: (params: CreateRoundParams) => Promise<Round>;
  deleteLastRound?: (gameId: number) => Promise<boolean>;
  finalizeGame?: (params: FinalizeGameParams) => Promise<Game>;

  // Player management
  listPlayers?: () => Promise<Player[]>;
  createPlayer?: (nom: string) => Promise<Player>;
  updatePlayer?: (id: number, nom: string) => Promise<Player | null>;
  deletePlayer?: (id: number) => Promise<boolean>;
  countPlayerGames?: (playerId: number) => Promise<number>;

  // History management
  listGames?: (filters?: GameFilters) => Promise<GameListResult>;
  countGameRounds?: (gameId: number) => Promise<number>;
  deleteGame?: (gameId: number) => Promise<boolean>;

  // Statistics
  getGlobalStatistics?: () => Promise<GlobalStatistics>;
  getPlayerRankings?: () => Promise<PlayerRanking[]>;
  getTrumpStatistics?: () => Promise<TrumpStatistics[]>;
  getGlobalRecords?: () => Promise<GlobalRecords>;
  getPlayerStatistics?: (playerId: number) => Promise<PlayerStatistics>;

  // Settings
  getAllSettings?: () => Promise<AppSettings>;
  getSetting?: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>;
  setSetting?: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings?: (settings: Partial<AppSettings>) => Promise<void>;
  resetSetting?: <K extends keyof AppSettings>(key: K) => Promise<void>;
  resetAllSettings?: () => Promise<void>;
  getSettingsPath?: () => Promise<string>;
  getSettingsSize?: () => Promise<number>;

  // Shortcuts
  toggleShortcuts?: (enabled: boolean) => Promise<void>;

  // Export/Import
  exportData?: () => Promise<ExportResult>;
  selectImportFile?: () => Promise<ImportFileResult>;
  importData?: (filePath: string, options: { mode: 'merge' | 'replace' }) => Promise<ImportResult>;
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
  equipe3_nom?: string | null; // NEW - optional for 3-player mode
  score_equipe1: number;
  score_equipe2: number;
  score_equipe3?: number; // NEW - optional for 3-player mode
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
  points_equipe3?: number; // NEW - optional for 3-player mode
  annonces_equipe1: number;
  annonces_equipe2: number;
  annonces_equipe3?: number; // NEW - optional for 3-player mode
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

  // NEW - Optional fields for 3-player mode
  roundDistribution3?: {
    player1: { count: number; percentage: number };
    player2: { count: number; percentage: number };
    player3: { count: number; percentage: number };
  };

  successRate3?: {
    player1: { successful: number; total: number; percentage: number };
    player2: { successful: number; total: number; percentage: number };
    player3: { successful: number; total: number; percentage: number };
  };

  bestRounds3?: {
    player1: { roundNumber: number; points: number; trump: TrumpSuit } | null;
    player2: { roundNumber: number; points: number; trump: TrumpSuit } | null;
    player3: { roundNumber: number; points: number; trump: TrumpSuit } | null;
  };

  totalAnnouncements3?: {
    player1: number;
    player2: number;
    player3: number;
  };

  beloteCount3?: {
    player1: number;
    player2: number;
    player3: number;
  };

  finalScores3?: {
    player1: number;
    player2: number;
    player3: number;
  };
}

// Paramètres de finalisation
export interface FinalizeGameParams {
  gameId: number;
  forced: boolean; // true si manuel, false si auto (seuil atteint)
}

// Global Statistics (all games combined)
export interface GlobalStatistics {
  // General overview
  totalGames: number;
  totalRounds: number;
  totalPlayTime: number; // in minutes
  firstGameDate: string | null;
  lastGameDate: string | null;
  longestGame: {
    gameId: number;
    duration: number;
    roundCount: number;
  } | null;
}

// Player ranking
export interface PlayerRanking {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  wins: number;
  winRate: number; // percentage
  rank: number;
}

// Trump statistics
export interface TrumpStatistics {
  trump: TrumpSuit;
  frequency: number; // how many times this trump was played
  percentage: number; // percentage of total rounds
  successRate: number; // percentage of successful takes with this trump
}

// Global records
export interface GlobalRecords {
  bestRoundScore: {
    gameId: number;
    roundNumber: number;
    playerName: string;
    points: number;
    trump: TrumpSuit;
  } | null;
  fastestGame: {
    gameId: number;
    duration: number;
  } | null;
  longestWinStreak: {
    playerId: number;
    playerName: string;
    streakLength: number;
  } | null;
  bestDuo: {
    player1Id: number;
    player1Name: string;
    player2Id: number;
    player2Name: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
  } | null;
  mostRoundsGame: {
    gameId: number;
    roundCount: number;
  } | null;
}

// Individual Player Statistics
export interface PlayerStatistics {
  // Basic info
  playerId: number;
  playerName: string;
  memberSince: string; // Date of first game

  // Overview stats
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // percentage

  // Trump preferences
  trumpStats: PlayerTrumpStat[];
  mostEffectiveTrump: TrumpSuit | null;
  leastEffectiveTrump: TrumpSuit | null;

  // Partners (4-player mode)
  partnerStats: PartnerStat[];

  // Personal records
  personalRecords: PlayerRecords;

  // Recent activity
  recentActivity: PlayerRecentActivity;

  // Win evolution (for chart)
  winEvolution: WinEvolutionPoint[];
}

export interface PlayerTrumpStat {
  trump: TrumpSuit;
  takes: number; // number of times player took this trump
  successRate: number; // percentage of successful takes
}

export interface PartnerStat {
  partnerId: number;
  partnerName: string;
  gamesPlayed: number;
  wins: number;
  winRate: number; // percentage
}

export interface PlayerRecords {
  bestRoundScore: {
    gameId: number;
    roundNumber: number;
    points: number;
    trump: TrumpSuit;
  } | null;
  longestWinStreak: number;
  averagePointsPerGame: number;
  totalTakes: number; // total number of times player was preneur
  totalBelotes: number; // total belote/rebelote count
}

export interface PlayerRecentActivity {
  lastGameDate: string | null;
  lastGameResult: 'win' | 'loss' | null;
  gamesThisMonth: number;
  winsThisMonth: number;
}

export interface WinEvolutionPoint {
  gameNumber: number; // game sequence number for this player
  winRate: number; // cumulative win rate at this point
  date: string;
}

// Application Settings
export interface AppSettings {
  // Game settings
  seuilVictoire: number;
  confirmationSuppression: boolean;
  sonNotifications: boolean;

  // Appearance settings
  theme: 'light' | 'dark' | 'auto';
  taillePolice: 'small' | 'medium' | 'large';

  // Keyboard shortcuts
  raccourcisActives: boolean;

  // Language
  langue: string;
}

// Export/Import Types
export interface ImportSummary {
  joueurs: { added: number; skipped: number; updated: number };
  parties: { added: number };
  manches: { added: number };
  parties_joueurs: { added: number };
}

export interface ImportPreview {
  joueurs: number;
  parties: number;
  manches: number;
}

export interface ExportResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
}

export interface ImportFileResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  preview?: ImportPreview;
}

export interface ImportResult {
  success: boolean;
  summary?: ImportSummary;
}
