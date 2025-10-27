import { test, expect } from '@playwright/test';

test('home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Secure Messenger');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
