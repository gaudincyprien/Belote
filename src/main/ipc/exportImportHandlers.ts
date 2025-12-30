import { ipcMain, dialog } from 'electron';
import { ExportImportService, ImportOptions } from '../services/ExportImportService';
import * as fs from 'fs';

/**
 * Register IPC handlers for export/import operations
 */
export function registerExportImportHandlers(): void {
  const exportImportService = ExportImportService.getInstance();

  /**
   * Export data to file with native save dialog
   */
  ipcMain.handle('exportImport:export', async () => {
    try {
      // Show save dialog
      const result = await dialog.showSaveDialog({
        title: 'Exporter les données',
        defaultPath: `belote_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().getHours()}h${new Date().getMinutes()}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['createDirectory', 'showOverwriteConfirmation'],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }

      // Export to file
      exportImportService.exportToFile(result.filePath);

      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de l\'export'
      );
    }
  });

  /**
   * Show open dialog to select import file and get preview
   */
  ipcMain.handle('exportImport:selectFile', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Importer des données',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePaths[0];

      // Read and validate file
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      // Get preview
      const preview = exportImportService.getImportPreview(data);

      return {
        success: true,
        filePath,
        preview,
      };
    } catch (error) {
      console.error('File selection error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Erreur lors de la sélection du fichier'
      );
    }
  });

  /**
   * Import data from file
   */
  ipcMain.handle(
    'exportImport:import',
    async (_event, filePath: string, options: ImportOptions) => {
      try {
        const summary = exportImportService.importFromFile(filePath, options);
        return { success: true, summary };
      } catch (error) {
        console.error('Import error:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Erreur lors de l\'import'
        );
      }
    }
  );
}
