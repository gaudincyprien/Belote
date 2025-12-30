import { BrowserWindow, globalShortcut } from 'electron';
import { SettingsService } from './SettingsService';

/**
 * Service for managing keyboard shortcuts
 */
export class ShortcutsService {
  private static instance: ShortcutsService;
  private mainWindow: BrowserWindow | null = null;
  private isEnabled = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ShortcutsService {
    if (!ShortcutsService.instance) {
      ShortcutsService.instance = new ShortcutsService();
    }
    return ShortcutsService.instance;
  }

  /**
   * Set the main window reference
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Register all global shortcuts
   */
  public registerShortcuts(): void {
    // Check if shortcuts are enabled in settings
    const settingsService = SettingsService.getInstance();
    const raccourcisActives = settingsService.getSetting('raccourcisActives');

    if (!raccourcisActives) {
      this.unregisterShortcuts();
      return;
    }

    this.isEnabled = true;

    // Ctrl+N - New game
    globalShortcut.register('CommandOrControl+N', () => {
      this.sendToRenderer('shortcut:new-game');
    });

    // Ctrl+H - History
    globalShortcut.register('CommandOrControl+H', () => {
      this.sendToRenderer('shortcut:history');
    });

    // Ctrl+S - Statistics
    globalShortcut.register('CommandOrControl+S', () => {
      this.sendToRenderer('shortcut:stats');
    });

    // Ctrl+, - Settings
    globalShortcut.register('CommandOrControl+,', () => {
      this.sendToRenderer('shortcut:settings');
    });

    // Ctrl+Q - Quit (only on Linux/Windows, Mac has its own)
    if (process.platform !== 'darwin') {
      globalShortcut.register('CommandOrControl+Q', () => {
        this.sendToRenderer('shortcut:quit');
      });
    }

    // F1 - Help (shortcuts list)
    globalShortcut.register('F1', () => {
      this.sendToRenderer('shortcut:help');
    });

    console.log('Keyboard shortcuts registered');
  }

  /**
   * Unregister all shortcuts
   */
  public unregisterShortcuts(): void {
    globalShortcut.unregisterAll();
    this.isEnabled = false;
    console.log('Keyboard shortcuts unregistered');
  }

  /**
   * Toggle shortcuts on/off
   */
  public toggleShortcuts(enabled: boolean): void {
    if (enabled) {
      this.registerShortcuts();
    } else {
      this.unregisterShortcuts();
    }
  }

  /**
   * Check if shortcuts are enabled
   */
  public isShortcutsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Send event to renderer process
   */
  private sendToRenderer(channel: string, ...args: unknown[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }
}
