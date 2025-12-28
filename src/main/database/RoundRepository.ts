import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import { Round } from '../../shared/types';

/**
 * Repository pour gérer les opérations CRUD sur les manches
 */
export class RoundRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  /**
   * Créer une nouvelle manche
   */
  create(round: Omit<Round, 'id' | 'timestamp'>): Round {
    const stmt = this.db.prepare(`
      INSERT INTO manches (
        partie_id, numero, atout, preneur_equipe,
        points_equipe1, points_equipe2,
        annonces_equipe1, annonces_equipe2,
        belote_equipe
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      round.partie_id,
      round.numero,
      round.atout,
      round.preneur_equipe,
      round.points_equipe1,
      round.points_equipe2,
      round.annonces_equipe1,
      round.annonces_equipe2,
      round.belote_equipe
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Trouver une manche par ID
   */
  findById(id: number): Round | null {
    const stmt = this.db.prepare('SELECT * FROM manches WHERE id = ?');
    return stmt.get(id) as Round | null;
  }

  /**
   * Obtenir toutes les manches d'une partie
   */
  findByGame(gameId: number): Round[] {
    const stmt = this.db.prepare(`
      SELECT * FROM manches
      WHERE partie_id = ?
      ORDER BY numero ASC
    `);
    return stmt.all(gameId) as Round[];
  }

  /**
   * Obtenir la dernière manche d'une partie
   */
  findLastByGame(gameId: number): Round | null {
    const stmt = this.db.prepare(`
      SELECT * FROM manches
      WHERE partie_id = ?
      ORDER BY numero DESC
      LIMIT 1
    `);
    return stmt.get(gameId) as Round | null;
  }

  /**
   * Mettre à jour une manche
   */
  update(id: number, updates: Partial<Omit<Round, 'id' | 'partie_id' | 'timestamp'>>): Round | null {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE manches SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Supprimer une manche
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM manches WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Supprimer toutes les manches d'une partie
   */
  deleteByGame(gameId: number): number {
    const stmt = this.db.prepare('DELETE FROM manches WHERE partie_id = ?');
    const result = stmt.run(gameId);

    return result.changes;
  }

  /**
   * Compter le nombre de manches d'une partie
   */
  countByGame(gameId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM manches
      WHERE partie_id = ?
    `);
    const result = stmt.get(gameId) as { count: number };

    return result.count;
  }
}
