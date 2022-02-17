import { expect, test } from '@playwright/test';
import constants from '../app/testConstants.json';

test.only('Multiple users in different tabs', async ({ browser }) => {
  const adminContext = await browser.newContext({ storageState: 'admin-storageState.json' });
  const memberContext = await browser.newContext({ storageState: 'member-storageState.json' });

  const adminPage = await adminContext.newPage();
  const memberPage = await memberContext.newPage();

  await adminPage.goto('/');
  await memberPage.goto('/');

  await expect(adminPage.locator('#userDropdown')).toContainText(constants.adminUsername);
  await expect(memberPage.locator('#userDropdown')).toContainText(constants.memberUsername);
});
