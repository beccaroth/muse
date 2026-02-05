import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './test-user';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/', { timeout: 10_000 });
  await expect(page.getByText('Museboard')).toBeVisible();

  await page.context().storageState({ path: authFile });
});
