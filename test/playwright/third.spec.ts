import { expect, test, APIRequestContext, request } from '@playwright/test';
import { getLoggedInPage } from './login';
import constants from '../app/testConstants.json';
import { jsonRpc } from './utils/json-rpc';

test.only('Multiple users in different tabs', async ({ browser }) => {
  const adminPage = await getLoggedInPage(browser, 'admin');
  const memberPage = await getLoggedInPage(browser, 'member');

  await adminPage.goto('/');
  await memberPage.goto('/');

  await expect(adminPage.locator('#userDropdown')).toContainText(constants.adminUsername);
  await expect(memberPage.locator('#userDropdown')).toContainText(constants.memberUsername);

  const adminRequest = await request.newContext({ storageState: 'admin-storageState.json', baseURL: 'http://app-for-e2e' });
  const session = await getSession(adminRequest);
  console.log('Got session. Looking up poll request interval...');
  console.log(session?.projectSettings?.config?.pollUpdateIntervalMs);
  expect(session).toBeDefined();
  expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeDefined();
  expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeGreaterThanOrEqual(0);
});

function getSession(requestContext: APIRequestContext) {
  return jsonRpc(requestContext, 'session_getSessionData');
}
