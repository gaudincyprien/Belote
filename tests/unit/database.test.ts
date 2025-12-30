import { DatabaseService, PlayerRepository, GameRepository, RoundRepository } from '../../src/main/database';
import * as fs from 'fs';
import * as path from 'path';

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getPath: () => path.join(__dirname, 'test-db'),
  },
}));

const testDbPath = path.join(__dirname, 'test-db');

// Global setup and teardown
beforeAll(() => {
  // Create test directory
  if (!fs.existsSync(testDbPath)) {
    fs.mkdirSync(testDbPath, { recursive: true });
  }

  // Initialize database
  DatabaseService.getInstance();
});

afterAll(() => {
  // Close database connection
  DatabaseService.getInstance().close();

  // Clean up test directory
  if (fs.existsSync(testDbPath)) {
    fs.rmSync(testDbPath, { recursive: true, force: true });
  }
});

describe('DatabaseService', () => {
  test('should create database file', () => {
    const dbService = DatabaseService.getInstance();
    const dbPath = dbService.getDatabasePath();
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  test('should create all required tables', () => {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      .all() as Array<{ name: string }>;

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('migrations');
    expect(tableNames).toContain('joueurs');
    expect(tableNames).toContain('parties');
    expect(tableNames).toContain('manches');
    expect(tableNames).toContain('parties_joueurs');
  });

  test('should apply initial migration', () => {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();

    const migrations = db
      .prepare('SELECT version FROM migrations ORDER BY version')
      .all() as Array<{ version: number }>;

    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations[0].version).toBe(1);
  });
});

describe('PlayerRepository', () => {
  const db = DatabaseService.getInstance();
  const playerRepo = new PlayerRepository(db);

  test('should create a player', () => {
    const player = playerRepo.create('Alice_' + Date.now());

    expect(player).toBeDefined();
    expect(player.id).toBeDefined();
    expect(player.date_creation).toBeDefined();
  });

  test('should find player by id', () => {
    const created = playerRepo.create('Bob_' + Date.now());
    const found = playerRepo.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
  });

  test('should find player by name', () => {
    const name = 'Charlie_' + Date.now();
    playerRepo.create(name);
    const found = playerRepo.findByName(name);

    expect(found).toBeDefined();
    expect(found?.nom).toBe(name);
  });

  test('should return all players', () => {
    const before = playerRepo.findAll().length;
    playerRepo.create('Player1_' + Date.now());
    playerRepo.create('Player2_' + Date.now());
    playerRepo.create('Player3_' + Date.now());

    const players = playerRepo.findAll();

    expect(players.length).toBeGreaterThanOrEqual(before + 3);
  });

  test('should update a player', () => {
    const player = playerRepo.create('David_' + Date.now());
    const newName = 'David_Updated_' + Date.now();
    const updated = playerRepo.update(player.id, newName);

    expect(updated).toBeDefined();
    expect(updated?.nom).toBe(newName);
  });

  test('should delete a player', () => {
    const player = playerRepo.create('Eve_' + Date.now());
    const deleted = playerRepo.delete(player.id);

    expect(deleted).toBe(true);

    const found = playerRepo.findById(player.id);
    expect(found).toBeFalsy();
  });

  test('should not allow duplicate names', () => {
    const name = 'Frank_' + Date.now();
    playerRepo.create(name);

    expect(() => {
      playerRepo.create(name);
    }).toThrow();
  });
});

describe('GameRepository', () => {
  const gameRepo = new GameRepository();

  test('should create a game', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    expect(game).toBeDefined();
    expect(game.id).toBeDefined();
    expect(game.mode).toBe('4_joueurs');
    expect(game.terminee).toBe(false);
  });

  test('should find game by id', () => {
    const created = gameRepo.create({
      date: new Date().toISOString(),
      mode: '3_joueurs',
      equipe1_nom: null,
      equipe2_nom: null,
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    const found = gameRepo.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.mode).toBe('3_joueurs');
  });

  test('should update a game', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    const updated = gameRepo.update(game.id, {
      score_equipe1: 1000,
      terminee: true,
      gagnant: 1,
    });

    expect(updated).toBeDefined();
    expect(updated?.score_equipe1).toBe(1000);
    expect(updated?.terminee).toBe(true);
    expect(updated?.gagnant).toBe(1);
  });

  test('should delete a game', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    const deleted = gameRepo.delete(game.id);

    expect(deleted).toBe(true);

    const found = gameRepo.findById(game.id);
    expect(found).toBeNull();
  });
});

describe('RoundRepository', () => {
  const roundRepo = new RoundRepository();
  const gameRepo = new GameRepository();

  test('should create a round', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    const round = roundRepo.create({
      partie_id: game.id,
      numero: 1,
      atout: 'pique',
      preneur_equipe: 1,
      points_equipe1: 120,
      points_equipe2: 42,
      annonces_equipe1: 0,
      annonces_equipe2: 0,
      belote_equipe: 1,
    });

    expect(round).toBeDefined();
    expect(round.id).toBeDefined();
    expect(round.numero).toBe(1);
    expect(round.atout).toBe('pique');
  });

  test('should find rounds by game', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    roundRepo.create({
      partie_id: game.id,
      numero: 1,
      atout: 'pique',
      preneur_equipe: 1,
      points_equipe1: 120,
      points_equipe2: 42,
      annonces_equipe1: 0,
      annonces_equipe2: 0,
      belote_equipe: 1,
    });

    roundRepo.create({
      partie_id: game.id,
      numero: 2,
      atout: 'coeur',
      preneur_equipe: 2,
      points_equipe1: 50,
      points_equipe2: 112,
      annonces_equipe1: 0,
      annonces_equipe2: 0,
      belote_equipe: 0,
    });

    const rounds = roundRepo.findByGame(game.id);

    expect(rounds).toHaveLength(2);
    expect(rounds[0].numero).toBe(1);
    expect(rounds[1].numero).toBe(2);
  });

  test('should delete a round', () => {
    const game = gameRepo.create({
      date: new Date().toISOString(),
      mode: '4_joueurs',
      equipe1_nom: 'Team A',
      equipe2_nom: 'Team B',
      score_equipe1: 0,
      score_equipe2: 0,
      gagnant: null,
      terminee: false,
      duree_minutes: null,
    });

    const round = roundRepo.create({
      partie_id: game.id,
      numero: 1,
      atout: 'pique',
      preneur_equipe: 1,
      points_equipe1: 120,
      points_equipe2: 42,
      annonces_equipe1: 0,
      annonces_equipe2: 0,
      belote_equipe: 1,
    });

    const deleted = roundRepo.delete(round.id);

    expect(deleted).toBe(true);

    const found = roundRepo.findById(round.id);
    expect(found).toBeFalsy();
  });
});
