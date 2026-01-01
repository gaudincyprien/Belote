import Store from 'electron-store';
import * as fs from 'fs';

/**
 * Application settings interface
 */
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

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  seuilVictoire: 1000,
  confirmationSuppression: true,
  sonNotifications: false,
  theme: 'light',
  taillePolice: 'medium',
  raccourcisActives: true,
  langue: 'fr',
};

/**
 * Service for managing application settings
 * Uses electron-store for persistent storage
 */
export class SettingsService {
  private static instance: SettingsService;
  private store: Store<AppSettings>;

  private constructor() {
    this.store = new Store<AppSettings>({
      defaults: DEFAULT_SETTINGS,
      name: 'settings',
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get all settings
   */
  public getAllSettings(): AppSettings {
    return this.store.store;
  }

  /**
   * Get a specific setting
   */
  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store.get(key);
  }

  /**
   * Update a specific setting
   */
  public setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    // Validate setting before saving
    this.validateSetting(key, value);
    this.store.set(key, value);
  }

  /**
   * Update multiple settings at once
   */
  public updateSettings(settings: Partial<AppSettings>): void {
    // Validate all settings
    Object.entries(settings).forEach(([key, value]) => {
      this.validateSetting(key as keyof AppSettings, value);
    });

    // Update all settings
    Object.entries(settings).forEach(([key, value]) => {
      this.store.set(key as keyof AppSettings, value);
    });
  }

  /**
   * Reset a setting to its default value
   */
  public resetSetting<K extends keyof AppSettings>(key: K): void {
    this.store.set(key, DEFAULT_SETTINGS[key]);
  }

  /**
   * Reset all settings to defaults
   */
  public resetAllSettings(): void {
    this.store.clear();
    this.store.store = DEFAULT_SETTINGS;
  }

  /**
   * Validate a setting value before saving
   */
  private validateSetting<K extends keyof AppSettings>(key: K, value: unknown): void {
    switch (key) {
      case 'seuilVictoire':
        if (typeof value !== 'number' || value <= 0) {
          throw new Error('Le seuil de victoire doit être un nombre positif');
        }
        if (value < 100 || value > 10000) {
          throw new Error('Le seuil de victoire doit être entre 100 et 10000');
        }
        break;

      case 'confirmationSuppression':
      case 'sonNotifications':
      case 'raccourcisActives':
        if (typeof value !== 'boolean') {
          throw new Error(`${key} doit être un booléen`);
        }
        break;

      case 'theme':
        if (!['light', 'dark', 'auto'].includes(value as string)) {
          throw new Error('Le thème doit être "light", "dark" ou "auto"');
        }
        break;

      case 'taillePolice':
        if (!['small', 'medium', 'large'].includes(value as string)) {
          throw new Error('La taille de police doit être "small", "medium" ou "large"');
        }
        break;

      case 'langue':
        if (typeof value !== 'string' || !value.trim()) {
          throw new Error('La langue doit être une chaîne non vide');
        }
        break;

      default:
        break;
    }
  }

  /**
   * Get the store file path (for display purposes)
   */
  public getStorePath(): string {
    return this.store.path;
  }

  /**
   * Get the store file size in bytes
   */
  public getStoreSize(): number {
    try {
      const stats = fs.statSync(this.store.path);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}
