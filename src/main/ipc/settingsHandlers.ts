import { ipcMain } from 'electron';
import { SettingsService } from '../services/SettingsService';
import type { AppSettings } from '../../shared/types';

/**
 * Register IPC handlers for settings-related operations
 */
export function registerSettingsHandlers() {
  const settingsService = SettingsService.getInstance();

  /**
   * Get all settings
   */
  ipcMain.handle('settings:getAll', async (): Promise<AppSettings> => {
    try {
      return settingsService.getAllSettings();
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw new Error('Failed to get settings');
    }
  });

  /**
   * Get a specific setting
   */
  ipcMain.handle('settings:get', async (_event, key: keyof AppSettings): Promise<unknown> => {
    try {
      return settingsService.getSetting(key);
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      throw new Error(`Failed to get setting: ${key}`);
    }
  });

  /**
   * Set a specific setting
   */
  ipcMain.handle('settings:set', async (_event, key: keyof AppSettings, value: unknown): Promise<void> => {
    try {
      settingsService.setSetting(key, value as any);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error instanceof Error ? error : new Error(`Failed to set setting: ${key}`);
    }
  });

  /**
   * Update multiple settings
   */
  ipcMain.handle('settings:update', async (_event, settings: Partial<AppSettings>): Promise<void> => {
    try {
      settingsService.updateSettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error instanceof Error ? error : new Error('Failed to update settings');
    }
  });

  /**
   * Reset a specific setting
   */
  ipcMain.handle('settings:reset', async (_event, key: keyof AppSettings): Promise<void> => {
    try {
      settingsService.resetSetting(key);
    } catch (error) {
      console.error(`Error resetting setting ${key}:`, error);
      throw new Error(`Failed to reset setting: ${key}`);
    }
  });

  /**
   * Reset all settings
   */
  ipcMain.handle('settings:resetAll', async (): Promise<void> => {
    try {
      settingsService.resetAllSettings();
    } catch (error) {
      console.error('Error resetting all settings:', error);
      throw new Error('Failed to reset all settings');
    }
  });

  /**
   * Get settings file path
   */
  ipcMain.handle('settings:getPath', async (): Promise<string> => {
    try {
      return settingsService.getStorePath();
    } catch (error) {
      console.error('Error getting settings path:', error);
      throw new Error('Failed to get settings path');
    }
  });

  /**
   * Get settings file size
   */
  ipcMain.handle('settings:getSize', async (): Promise<number> => {
    try {
      return settingsService.getStoreSize();
    } catch (error) {
      console.error('Error getting settings size:', error);
      throw new Error('Failed to get settings size');
    }
  });
}
