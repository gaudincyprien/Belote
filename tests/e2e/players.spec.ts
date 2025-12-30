import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9000';

test.describe('Player Management (CRUD)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Navigate to players page
    await page.getByRole('button', { name: /gestion des joueurs/i }).click();
    await page.waitForURL('**/players');
  });

  test('should display players page', async ({ page }) => {
    await expect(page.getByText('Gestion des joueurs')).toBeVisible();
    await expect(page.getByPlaceholder('Rechercher un joueur...')).toBeVisible();
    await expect(page.getByRole('button', { name: /ajouter/i })).toBeVisible();
  });

  test('should open add player modal', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(page.getByText('Ajouter un joueur')).toBeVisible();
    await expect(page.getByPlaceholder('Entrez le nom...')).toBeVisible();
  });

  test('should create a new player', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Fill form
    const playerName = 'Test Player ' + Date.now();
    await page.getByPlaceholder('Entrez le nom...').fill(playerName);

    // Submit
    await page.getByRole('button', { name: /ajouter/i }).last().click();

    // Verify player appears in list
    await expect(page.getByText(playerName)).toBeVisible();
  });

  test('should validate player name minimum 2 characters', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Try single character
    await page.getByPlaceholder('Entrez le nom...').fill('A');

    // Submit button should be disabled
    const submitBtn = page.getByRole('button', { name: /ajouter/i }).last();
    await expect(submitBtn).toBeDisabled();

    // Error message should appear
    await expect(page.getByText('Minimum 2 caractères')).toBeVisible();
  });

  test('should validate player name maximum 30 characters', async ({ page }) => {
    await page.getByRole('button', { name: /ajouter/i }).click();

    // Try 31 characters
    const longName = 'A'.repeat(31);
    await page.getByPlaceholder('Entrez le nom...').fill(longName);

    // Submit button should be disabled
    const submitBtn = page.getByRole('button', { name: /ajouter/i }).last();
    await expect(submitBtn).toBeDisabled();

    // Error message should appear
    await expect(page.getByText('Maximum 30 caractères')).toBeVisible();
  });

  test('should search for players', async ({ page }) => {
    // Create a test player first
    await page.getByRole('button', { name: /ajouter/i }).click();
    const playerName = 'SearchTest' + Date.now();
    await page.getByPlaceholder('Entrez le nom...').fill(playerName);
    await page.getByRole('button', { name: /ajouter/i }).last().click();

    await expect(page.getByText(playerName)).toBeVisible();

    // Search for the player
    const searchInput = page.getByPlaceholder('Rechercher un joueur...');
    await searchInput.fill('SearchTest');

    // Player should still be visible
    await expect(page.getByText(playerName)).toBeVisible();

    // Search for something else
    await searchInput.fill('NonExistentPlayer');

    // Should show no players found
    await expect(page.getByText('Aucun joueur trouvé')).toBeVisible();
  });

  test('should edit a player', async ({ page }) => {
    // Create a player first
    await page.getByRole('button', { name: /ajouter/i }).click();
    const originalName = 'EditTest' + Date.now();
    await page.getByPlaceholder('Entrez le nom...').fill(originalName);
    await page.getByRole('button', { name: /ajouter/i }).last().click();

    // Wait for player to appear
    await expect(page.getByText(originalName)).toBeVisible();

    // Click edit button
    const row = page.locator('tr', { hasText: originalName });
    await row.getByTitle('Modifier').click();

    // Modal should open
    await expect(page.getByText('Modifier le joueur')).toBeVisible();

    // Change name
    const newName = 'Edited' + Date.now();
    const input = page.getByPlaceholder('Entrez le nom...');
    await input.clear();
    await input.fill(newName);
    await page.getByRole('button', { name: /modifier/i }).click();

    // Verify new name appears
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();
  });

  test('should delete a player with no games', async ({ page }) => {
    // Create a player
    await page.getByRole('button', { name: /ajouter/i }).click();
    const playerName = 'DeleteTest' + Date.now();
    await page.getByPlaceholder('Entrez le nom...').fill(playerName);
    await page.getByRole('button', { name: /ajouter/i }).last().click();

    await expect(page.getByText(playerName)).toBeVisible();

    // Set up dialog handler to accept confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete
    const row = page.locator('tr', { hasText: playerName });
    await row.getByTitle('Supprimer').click();

    // Player should disappear
    await expect(page.getByText(playerName)).not.toBeVisible();
  });

  test('should show stats button as disabled', async ({ page }) => {
    // Stats buttons should exist but be disabled
    const statsButtons = page.locator('[title="Disponible prochainement"]');
    const count = await statsButtons.count();

    if (count > 0) {
      await expect(statsButtons.first()).toBeDisabled();
    }
  });

  test('should navigate back to home', async ({ page }) => {
    await page.getByRole('button', { name: /retour/i }).click();
    await expect(page.getByText('Gérez vos parties de belote')).toBeVisible();
  });

  test('should close modal on cancel', async ({ page }) => {
    // Open add modal
    await page.getByRole('button', { name: /ajouter/i }).click();
    await expect(page.getByText('Ajouter un joueur')).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: /annuler/i }).click();

    // Modal should close
    await expect(page.getByText('Ajouter un joueur')).not.toBeVisible();
  });

  test('should show no players message when empty', async ({ page }) => {
    // If there are no players yet (might not be the case)
    const noPlayersText = page.getByText('Aucun joueur enregistré');
    const tableExists = await page.locator('table').count();

    if (tableExists === 0) {
      await expect(noPlayersText).toBeVisible();
    }
  });
});
