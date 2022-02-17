import { expect, test } from '@playwright/test';
import { getLoggedInPage } from './login';
import constants from '../app/testConstants.json';

test.only('Multiple users in different tabs', async ({ browser }) => {
  const adminPage = await getLoggedInPage(browser, 'admin');
  const memberPage = await getLoggedInPage(browser, 'member');

  await adminPage.goto('/');
  await memberPage.goto('/');

  await expect(adminPage.locator('#userDropdown')).toContainText(constants.adminUsername);
  await expect(memberPage.locator('#userDropdown')).toContainText(constants.memberUsername);
});
