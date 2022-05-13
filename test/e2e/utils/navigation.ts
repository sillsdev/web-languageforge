import { expect, Page } from '@playwright/test';

export async function gotoProjectDirectly(page: Page, projectId: string, projectName: string) {
  await page.goto('app/lexicon/' + projectId);
  await expect(page.locator('.page-name >> text=' + projectName)).toBeVisible();
}
