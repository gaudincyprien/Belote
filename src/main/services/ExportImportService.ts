import { DatabaseService } from '../database';
import * as fs from 'fs';

export interface ExportData {
  version: string;
  export_date: string;
  joueurs: unknown[];
  parties: unknown[];
  manches: unknown[];
  parties_joueurs: unknown[];
}

export interface ImportOptions {
  mode: 'merge' | 'replace';
  conflictResolution?: 'skip' | 'rename' | 'replace';
}

export interface ImportSummary {
  joueurs: { added: number; skipped: number; updated: number };
  parties: { added: number };
  manches: { added: number };
  parties_joueurs: { added: number };
}

/**
 * Service for exporting and importing database data
 */
export class ExportImportService {
  private static instance: ExportImportService;
  private db: DatabaseService;
  private readonly CURRENT_VERSION = '1.0.0';

  private constructor() {
    // Private constructor for singleton pattern
    this.db = DatabaseService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExportImportService {
    if (!ExportImportService.instance) {
      ExportImportService.instance = new ExportImportService();
    }
    return ExportImportService.instance;
  }

  /**
   * Export all database data to JSON format
   */
  public exportData(): ExportData {
    const database = this.db.getDatabase();

    // Export all tables
    const joueurs = database.prepare('SELECT * FROM joueurs').all();
    const parties = database.prepare('SELECT * FROM parties').all();
    const manches = database.prepare('SELECT * FROM manches').all();
    const parties_joueurs = database.prepare('SELECT * FROM parties_joueurs').all();

    return {
      version: this.CURRENT_VERSION,
      export_date: new Date().toISOString(),
      joueurs,
      parties,
      manches,
      parties_joueurs,
    };
  }

  /**
   * Export data to a file
   */
  public exportToFile(filePath: string): void {
    const data = this.exportData();
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData, 'utf-8');
  }

  /**
   * Validate imported data structure
   */
  private validateImportData(data: unknown): data is ExportData {
    if (!data || typeof data !== 'object') {
      throw new Error('Format de données invalide');
    }

    const exportData = data as Partial<ExportData>;

    if (!exportData.version) {
      throw new Error('Version manquante dans les données');
    }

    if (!Array.isArray(exportData.joueurs)) {
      throw new Error('Données joueurs invalides');
    }

    if (!Array.isArray(exportData.parties)) {
      throw new Error('Données parties invalides');
    }

    if (!Array.isArray(exportData.manches)) {
      throw new Error('Données manches invalides');
    }

    if (!Array.isArray(exportData.parties_joueurs)) {
      throw new Error('Données parties_joueurs invalides');
    }

    return true;
  }

  /**
   * Import data from JSON
   */
  public importData(data: ExportData, options: ImportOptions): ImportSummary {
    // Validate data
    this.validateImportData(data);

    const database = this.db.getDatabase();
    const summary: ImportSummary = {
      joueurs: { added: 0, skipped: 0, updated: 0 },
      parties: { added: 0 },
      manches: { added: 0 },
      parties_joueurs: { added: 0 },
    };

    // Start transaction
    const transaction = database.transaction(() => {
      if (options.mode === 'replace') {
        // Clear all data
        database.prepare('DELETE FROM manches').run();
        database.prepare('DELETE FROM parties_joueurs').run();
        database.prepare('DELETE FROM parties').run();
        database.prepare('DELETE FROM joueurs').run();
      }

      // Import joueurs
      const joueurIdMap = new Map<number, number>(); // old ID -> new ID
      for (const joueur of data.joueurs as any[]) {
        const oldId = joueur.id;

        if (options.mode === 'merge') {
          // Check if player with same name exists
          const existing = database
            .prepare('SELECT id FROM joueurs WHERE nom = ?')
            .get(joueur.nom) as { id: number } | undefined;

          if (existing) {
            joueurIdMap.set(oldId, existing.id);
            summary.joueurs.skipped++;
            continue;
          }
        }

        // Insert new player
        const result = database
          .prepare('INSERT INTO joueurs (nom, date_creation) VALUES (?, ?)')
          .run(joueur.nom, joueur.date_creation);

        joueurIdMap.set(oldId, result.lastInsertRowid as number);
        summary.joueurs.added++;
      }

      // Import parties
      const partieIdMap = new Map<number, number>(); // old ID -> new ID
      for (const partie of data.parties as any[]) {
        const oldId = partie.id;

        const result = database
          .prepare(
            `INSERT INTO parties (
              date, mode, equipe1_nom, equipe2_nom, equipe3_nom,
              score_equipe1, score_equipe2, score_equipe3,
              gagnant, terminee, duree_minutes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            partie.date,
            partie.mode,
            partie.equipe1_nom,
            partie.equipe2_nom,
            partie.equipe3_nom,
            partie.score_equipe1,
            partie.score_equipe2,
            partie.score_equipe3,
            partie.gagnant,
            partie.terminee,
            partie.duree_minutes
          );

        partieIdMap.set(oldId, result.lastInsertRowid as number);
        summary.parties.added++;
      }

      // Import manches
      for (const manche of data.manches as any[]) {
        const newPartieId = partieIdMap.get(manche.partie_id);
        if (!newPartieId) continue;

        database
          .prepare(
            `INSERT INTO manches (
              partie_id, numero, atout, preneur_equipe,
              points_equipe1, points_equipe2, points_equipe3,
              annonces_equipe1, annonces_equipe2, annonces_equipe3,
              belote_equipe, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            newPartieId,
            manche.numero,
            manche.atout,
            manche.preneur_equipe,
            manche.points_equipe1,
            manche.points_equipe2,
            manche.points_equipe3,
            manche.annonces_equipe1,
            manche.annonces_equipe2,
            manche.annonces_equipe3,
            manche.belote_equipe,
            manche.timestamp
          );

        summary.manches.added++;
      }

      // Import parties_joueurs
      for (const pj of data.parties_joueurs as any[]) {
        const newPartieId = partieIdMap.get(pj.partie_id);
        const newJoueurId = joueurIdMap.get(pj.joueur_id);

        if (!newPartieId || !newJoueurId) continue;

        database
          .prepare(
            'INSERT INTO parties_joueurs (partie_id, joueur_id, equipe) VALUES (?, ?, ?)'
          )
          .run(newPartieId, newJoueurId, pj.equipe);

        summary.parties_joueurs.added++;
      }
    });

    // Execute transaction
    transaction();

    return summary;
  }

  /**
   * Import data from a file
   */
  public importFromFile(filePath: string, options: ImportOptions): ImportSummary {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as ExportData;
    return this.importData(data, options);
  }

  /**
   * Get import summary without actually importing
   */
  public getImportPreview(data: ExportData): {
    joueurs: number;
    parties: number;
    manches: number;
  } {
    this.validateImportData(data);

    return {
      joueurs: data.joueurs.length,
      parties: data.parties.length,
      manches: data.manches.length,
    };
  }
}
