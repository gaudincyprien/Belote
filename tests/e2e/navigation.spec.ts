import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la navigation de l'application Belote Scorer
 *
 * Note: Ces tests utilisent le dev server (http://localhost:9000) pour tester la navigation.
 * Pour un test complet de l'application Electron, il faudrait utiliser @playwright/test
 * avec electron.launch() pour lancer l'application packagée.
 */

// Configuration de base - sera améliorée dans les prochains tickets
const BASE_URL = 'http://localhost:9000';

test.describe('Navigation de l\'écran d\'accueil', () => {
  test.beforeEach(async ({ page }) => {
    // Cette approche sera améliorée pour lancer l'application Electron directement
    await page.goto(BASE_URL);
  });

  test('affiche le titre de l\'application', async ({ page }) => {
    await expect(page.getByText('Belote Scorer')).toBeVisible();
  });

  test('affiche tous les boutons principaux', async ({ page }) => {
    // Vérifier que tous les boutons requis sont présents
    await expect(page.getByRole('button', { name: /nouvelle partie/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /historique/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /statistiques/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /paramètres/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /quitter/i })).toBeVisible();
  });

  test('les boutons Historique et Statistiques sont désactivés', async ({ page }) => {
    const historiqueBtn = page.getByRole('button', { name: /historique/i });
    const statsBtn = page.getByRole('button', { name: /statistiques/i });

    await expect(historiqueBtn).toBeDisabled();
    await expect(statsBtn).toBeDisabled();
  });

  test('navigation vers Nouvelle partie', async ({ page }) => {
    await page.getByRole('button', { name: /nouvelle partie/i }).click();
    await expect(page.getByText('Configuration de la nouvelle partie')).toBeVisible();
  });

  test('navigation vers Paramètres', async ({ page }) => {
    await page.getByRole('button', { name: /paramètres/i }).click();
    await expect(page.getByText('Configuration des paramètres')).toBeVisible();
  });

  test('retour à l\'accueil depuis Nouvelle partie', async ({ page }) => {
    await page.getByRole('button', { name: /nouvelle partie/i }).click();
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText('Gérez vos parties de belote')).toBeVisible();
  });

  test('retour à l\'accueil depuis Paramètres', async ({ page }) => {
    await page.getByRole('button', { name: /paramètres/i }).click();
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText('Gérez vos parties de belote')).toBeVisible();
  });

  test('design responsive - vérification des styles', async ({ page }) => {
    // Vérifier que le layout est centré et responsive
    const container = page.locator('.max-w-md').first();
    await expect(container).toBeVisible();
  });
});
