import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * DatabaseService - Singleton pour gérer la base de données SQLite
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;
  private dbPath: string;

  private constructor() {
    // Obtenir le chemin du dossier userData
    const userDataPath = app.getPath('userData');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    // Définir le chemin de la base de données
    this.dbPath = path.join(userDataPath, 'belote.db');

    // Initialiser la connexion
    this.db = new Database(this.dbPath);

    // Activer les foreign keys
    this.db.pragma('foreign_keys = ON');

    // Initialiser la base de données
    this.initialize();
  }

  /**
   * Obtenir l'instance unique du DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Obtenir la connexion à la base de données
   */
  public getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Obtenir le chemin de la base de données
   */
  public getDatabasePath(): string {
    return this.dbPath;
  }

  /**
   * Initialiser la base de données et exécuter les migrations
   */
  private initialize(): void {
    // Créer la table migrations si elle n'existe pas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Exécuter les migrations
    this.runMigrations();
  }

  /**
   * Exécuter les migrations de base de données
   */
  private runMigrations(): void {
    // Obtenir la version actuelle
    const currentVersion = this.getCurrentVersion();

    // Définir les migrations
    const migrations = [
      {
        version: 1,
        up: () => {
          this.db.exec(`
            -- Table des joueurs
            CREATE TABLE IF NOT EXISTS joueurs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nom TEXT NOT NULL UNIQUE,
              date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Table des parties
            CREATE TABLE IF NOT EXISTS parties (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date DATETIME DEFAULT CURRENT_TIMESTAMP,
              mode TEXT CHECK(mode IN ('4_joueurs', '3_joueurs')),
              equipe1_nom TEXT,
              equipe2_nom TEXT,
              score_equipe1 INTEGER DEFAULT 0,
              score_equipe2 INTEGER DEFAULT 0,
              gagnant INTEGER,
              terminee BOOLEAN DEFAULT 0,
              duree_minutes INTEGER
            );

            -- Table des manches
            CREATE TABLE IF NOT EXISTS manches (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              partie_id INTEGER NOT NULL,
              numero INTEGER NOT NULL,
              atout TEXT CHECK(atout IN ('pique', 'coeur', 'carreau', 'trefle', 'sans_atout', 'tout_atout')),
              preneur_equipe INTEGER CHECK(preneur_equipe IN (1, 2)),
              points_equipe1 INTEGER NOT NULL,
              points_equipe2 INTEGER NOT NULL,
              annonces_equipe1 INTEGER DEFAULT 0,
              annonces_equipe2 INTEGER DEFAULT 0,
              belote_equipe INTEGER CHECK(belote_equipe IN (0, 1, 2)),
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (partie_id) REFERENCES parties(id) ON DELETE CASCADE
            );

            -- Table de liaison parties-joueurs
            CREATE TABLE IF NOT EXISTS parties_joueurs (
              partie_id INTEGER NOT NULL,
              joueur_id INTEGER NOT NULL,
              equipe INTEGER CHECK(equipe IN (1, 2)),
              FOREIGN KEY (partie_id) REFERENCES parties(id) ON DELETE CASCADE,
              FOREIGN KEY (joueur_id) REFERENCES joueurs(id),
              PRIMARY KEY (partie_id, joueur_id)
            );
          `);
        },
      },
    ];

    // Exécuter les migrations non appliquées
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Applying migration ${migration.version}...`);

        // Exécuter la migration dans une transaction
        const transaction = this.db.transaction(() => {
          migration.up();
          this.recordMigration(migration.version);
        });

        transaction();
        console.log(`Migration ${migration.version} applied successfully.`);
      }
    }
  }

  /**
   * Obtenir la version actuelle de la base de données
   */
  private getCurrentVersion(): number {
    const result = this.db
      .prepare('SELECT MAX(version) as version FROM migrations')
      .get() as { version: number | null };

    return result.version || 0;
  }

  /**
   * Enregistrer une migration appliquée
   */
  private recordMigration(version: number): void {
    this.db
      .prepare('INSERT INTO migrations (version) VALUES (?)')
      .run(version);
  }

  /**
   * Fermer la connexion à la base de données
   */
  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
