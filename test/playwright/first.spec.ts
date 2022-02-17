import { expect, test } from '@playwright/test';

test.describe('Front page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should see the front page', async ({ page }) => {
    const title = page.locator('section#banner h2');
    await expect(title).toHaveText('Language Forge');
  });

});
