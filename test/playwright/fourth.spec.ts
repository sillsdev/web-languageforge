import { expect, test } from './userFixtures';
import constants from '../app/testConstants.json';

test.only('Multiple users in different tabs', async ({ adminPage, memberPage }) => {
  await adminPage.goto('/');
  await memberPage.goto('/');

  await expect(adminPage.locator('#userDropdown')).toContainText(constants.adminUsername);
  await expect(memberPage.locator('#userDropdown')).toContainText(constants.memberUsername);
});
