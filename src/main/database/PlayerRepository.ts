import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import { Player } from '../../shared/types';

/**
 * Repository pour gérer les opérations CRUD sur les joueurs
 */
export class PlayerRepository {
  private db: Database.Database;

  constructor(dbService: DatabaseService) {
    this.db = dbService.getDatabase();
  }

  /**
   * Créer un nouveau joueur
   */
  create(nom: string): Player {
    const stmt = this.db.prepare(
      'INSERT INTO joueurs (nom) VALUES (?)'
    );
    const result = stmt.run(nom);

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Trouver un joueur par ID
   */
  findById(id: number): Player | null {
    const stmt = this.db.prepare('SELECT * FROM joueurs WHERE id = ?');
    return stmt.get(id) as Player | null;
  }

  /**
   * Trouver un joueur par nom
   */
  findByName(nom: string): Player | null {
    const stmt = this.db.prepare('SELECT * FROM joueurs WHERE nom = ?');
    return stmt.get(nom) as Player | null;
  }

  /**
   * Obtenir tous les joueurs
   */
  findAll(): Player[] {
    const stmt = this.db.prepare('SELECT * FROM joueurs ORDER BY nom ASC');
    return stmt.all() as Player[];
  }

  /**
   * Mettre à jour un joueur
   */
  update(id: number, nom: string): Player | null {
    const stmt = this.db.prepare('UPDATE joueurs SET nom = ? WHERE id = ?');
    stmt.run(nom, id);

    return this.findById(id);
  }

  /**
   * Supprimer un joueur
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM joueurs WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Compter le nombre de parties jouées par un joueur
   */
  countGames(playerId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM parties_joueurs
      WHERE joueur_id = ?
    `);
    const result = stmt.get(playerId) as { count: number };

    return result.count;
  }
}
