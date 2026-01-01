import { test, expect, ElectronApplication, Page } from '@playwright/test';
import { launchElectronApp, getFirstWindow, closeElectronApp } from './helpers/electron';

/**
 * Tests E2E pour la navigation de l'application Belote Scorer
 *
 * Ces tests lancent l'application Electron directement et testent la navigation.
 */

test.describe('Navigation de l\'écran d\'accueil', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeAll(async () => {
    electronApp = await launchElectronApp();
    page = await getFirstWindow(electronApp);
  });

  test.afterAll(async () => {
    await closeElectronApp(electronApp);
  });

  test('affiche le titre de l\'application', async () => {
    await expect(page.getByText('Belote Scorer')).toBeVisible();
  });

  test('affiche tous les boutons principaux', async () => {
    // Vérifier que tous les boutons requis sont présents
    await expect(page.getByRole('button', { name: /nouvelle partie/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /historique/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /statistiques/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /paramètres/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /quitter/i })).toBeVisible();
  });

  test('les boutons Historique et Statistiques sont désactivés', async () => {
    const historiqueBtn = page.getByRole('button', { name: /historique/i });
    const statsBtn = page.getByRole('button', { name: /statistiques/i });

    await expect(historiqueBtn).toBeDisabled();
    await expect(statsBtn).toBeDisabled();
  });

  test('navigation vers Nouvelle partie', async () => {
    await page.getByRole('button', { name: /nouvelle partie/i }).click();
    await expect(page.getByText('Configuration de la nouvelle partie')).toBeVisible();
  });

  test('navigation vers Paramètres', async () => {
    await page.getByRole('button', { name: /paramètres/i }).click();
    await expect(page.getByText('Configuration des paramètres')).toBeVisible();
  });

  test('retour à l\'accueil depuis Nouvelle partie', async () => {
    await page.getByRole('button', { name: /nouvelle partie/i }).click();
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText('Gérez vos parties de belote')).toBeVisible();
  });

  test('retour à l\'accueil depuis Paramètres', async () => {
    await page.getByRole('button', { name: /paramètres/i }).click();
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText('Gérez vos parties de belote')).toBeVisible();
  });

  test('design responsive - vérification des styles', async () => {
    // Vérifier que le layout est centré et responsive
    const container = page.locator('.max-w-md').first();
    await expect(container).toBeVisible();
  });
});
