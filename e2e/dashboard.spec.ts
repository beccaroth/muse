import { test, expect } from '@playwright/test';

test.describe('dashboard', () => {
  test('loads with header and projects section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Museboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test('museboard logo links to home', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /museboard/i }).click();

    await expect(page).toHaveURL('/');
  });
});
