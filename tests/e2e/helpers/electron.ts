import { _electron as electron, ElectronApplication, Page } from '@playwright/test';
import path from 'path';

/**
 * Launch the Electron application for testing
 */
export async function launchElectronApp(): Promise<ElectronApplication> {
  // Path to the compiled main process
  const mainPath = path.join(process.cwd(), '.webpack', 'main', 'index.js');

  const electronApp = await electron.launch({
    args: [mainPath],
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });

  return electronApp;
}

/**
 * Get the first window of the Electron app
 */
export async function getFirstWindow(electronApp: ElectronApplication): Promise<Page> {
  const page = await electronApp.firstWindow();

  // Wait for the page to be ready
  await page.waitForLoadState('domcontentloaded');

  return page;
}

/**
 * Close the Electron application
 */
export async function closeElectronApp(electronApp: ElectronApplication): Promise<void> {
  await electronApp.close();
}
