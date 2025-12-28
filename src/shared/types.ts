// Shared TypeScript types and interfaces

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
