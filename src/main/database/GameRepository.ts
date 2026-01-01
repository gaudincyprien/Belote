import Database from 'better-sqlite3';
import { DatabaseService } from './DatabaseService';
import { Game } from '../../shared/types';

/**
 * Repository pour gérer les opérations CRUD sur les parties
 */
export class GameRepository {
  private db: Database.Database;

  constructor() {
    this.db = DatabaseService.getInstance().getDatabase();
  }

  /**
   * Créer une nouvelle partie
   */
  create(game: Omit<Game, 'id' | 'date'>): Game {
    const stmt = this.db.prepare(`
      INSERT INTO parties (
        mode, equipe1_nom, equipe2_nom,
        score_equipe1, score_equipe2,
        gagnant, terminee, duree_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      game.mode,
      game.equipe1_nom,
      game.equipe2_nom,
      game.score_equipe1,
      game.score_equipe2,
      game.gagnant,
      game.terminee ? 1 : 0,
      game.duree_minutes
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Trouver une partie par ID
   */
  findById(id: number): Game | null {
    const stmt = this.db.prepare('SELECT * FROM parties WHERE id = ?');
    const game = stmt.get(id) as any;

    if (!game) return null;

    return {
      ...game,
      terminee: Boolean(game.terminee),
    };
  }

  /**
   * Obtenir toutes les parties
   */
  findAll(): Game[] {
    const stmt = this.db.prepare('SELECT * FROM parties ORDER BY date DESC');
    const games = stmt.all() as any[];

    return games.map((game) => ({
      ...game,
      terminee: Boolean(game.terminee),
    }));
  }

  /**
   * Mettre à jour une partie
   */
  update(id: number, updates: Partial<Omit<Game, 'id' | 'date'>>): Game | null {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'terminee') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE parties SET ${fields.join(', ')} WHERE id = ?`
    );
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Supprimer une partie
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM parties WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Obtenir les parties d'un joueur
   */
  findByPlayer(playerId: number): Game[] {
    const stmt = this.db.prepare(`
      SELECT p.*
      FROM parties p
      INNER JOIN parties_joueurs pj ON p.id = pj.partie_id
      WHERE pj.joueur_id = ?
      ORDER BY p.date DESC
    `);
    const games = stmt.all(playerId) as any[];

    return games.map((game) => ({
      ...game,
      terminee: Boolean(game.terminee),
    }));
  }

  /**
   * Lier un joueur à une partie
   */
  addPlayer(gameId: number, playerId: number, equipe: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO parties_joueurs (partie_id, joueur_id, equipe)
      VALUES (?, ?, ?)
    `);
    stmt.run(gameId, playerId, equipe);
  }

  /**
   * Obtenir les joueurs d'une partie
   */
  getPlayers(gameId: number): Array<{ id: number; nom: string; equipe: number }> {
    const stmt = this.db.prepare(`
      SELECT j.id, j.nom, pj.equipe
      FROM joueurs j
      INNER JOIN parties_joueurs pj ON j.id = pj.joueur_id
      WHERE pj.partie_id = ?
      ORDER BY pj.equipe, j.nom
    `);
    return stmt.all(gameId) as Array<{ id: number; nom: string; equipe: number }>;
  }

  /**
   * Compter le nombre de manches d'une partie
   */
  countRounds(gameId: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM manches
      WHERE partie_id = ?
    `);
    const result = stmt.get(gameId) as { count: number };
    return result.count;
  }

  /**
   * Find games with filters and sorting
   */
  findWithFilters(filters: {
    dateFrom?: string;
    dateTo?: string;
    playerId?: number;
    mode?: string;
    sortBy?: 'date' | 'duration' | 'rounds';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Game[] {
    const conditions: string[] = [];
    const params: any[] = [];

    // Date filters
    if (filters.dateFrom) {
      conditions.push('p.date >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('p.date <= ?');
      params.push(filters.dateTo);
    }

    // Player filter
    if (filters.playerId) {
      conditions.push('EXISTS (SELECT 1 FROM parties_joueurs pj WHERE pj.partie_id = p.id AND pj.joueur_id = ?)');
      params.push(filters.playerId);
    }

    // Mode filter
    if (filters.mode) {
      conditions.push('p.mode = ?');
      params.push(filters.mode);
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'ORDER BY p.date DESC';
    if (filters.sortBy === 'duration') {
      orderBy = `ORDER BY p.duree_minutes ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    } else if (filters.sortBy === 'rounds') {
      orderBy = `ORDER BY (SELECT COUNT(*) FROM manches WHERE partie_id = p.id) ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    } else if (filters.sortBy === 'date') {
      orderBy = `ORDER BY p.date ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    }

    // Pagination
    const limitClause = filters.limit ? `LIMIT ${filters.limit}` : '';
    const offsetClause = filters.offset ? `OFFSET ${filters.offset}` : '';

    const query = `
      SELECT p.*
      FROM parties p
      ${whereClause}
      ${orderBy}
      ${limitClause}
      ${offsetClause}
    `;

    const stmt = this.db.prepare(query);
    const games = stmt.all(...params) as any[];

    return games.map((game) => ({
      ...game,
      terminee: Boolean(game.terminee),
    }));
  }

  /**
   * Count games with filters (for pagination)
   */
  countWithFilters(filters: {
    dateFrom?: string;
    dateTo?: string;
    playerId?: number;
    mode?: string;
  }): number {
    const conditions: string[] = [];
    const params: any[] = [];

    // Date filters
    if (filters.dateFrom) {
      conditions.push('p.date >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('p.date <= ?');
      params.push(filters.dateTo);
    }

    // Player filter
    if (filters.playerId) {
      conditions.push('EXISTS (SELECT 1 FROM parties_joueurs pj WHERE pj.partie_id = p.id AND pj.joueur_id = ?)');
      params.push(filters.playerId);
    }

    // Mode filter
    if (filters.mode) {
      conditions.push('p.mode = ?');
      params.push(filters.mode);
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT COUNT(*) as count
      FROM parties p
      ${whereClause}
    `;

    const stmt = this.db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}
