import { expect, test, APIRequestContext, request, Page } from '@playwright/test';
import { getLoggedInPage } from './login';
import constants from '../app/testConstants.json';
import { jsonRpc } from './utils/json-rpc';

test.describe.only('Multiple users editing the same project', () => {
  let adminPage: Page;
  let memberPage: Page;
  test.beforeEach(async ({browser}) => {
    const adminRequest = await request.newContext({ storageState: 'admin-storageState.json', baseURL: 'http://app-for-e2e' });
    const session = await getSession(adminRequest);
    session.projectSettings.config.pollUpdateIntervalMs = 10 * 1000;
    await updateProjectConfig(adminRequest, session.projectSettings.config);
    adminPage = await getLoggedInPage(browser, 'admin');
    memberPage = await getLoggedInPage(browser, 'member');
  });

  test('Multiple users in different tabs', async () => {
    await Promise.all([
      adminPage.goto('/'),
      memberPage.goto('/'),
    ]);
    await Promise.all([
      expect(adminPage.locator('#userDropdown')).toContainText(constants.adminUsername),
      expect(memberPage.locator('#userDropdown')).toContainText(constants.memberUsername),
    ]);
  });
});

function getSession(requestContext: APIRequestContext) {
  return jsonRpc(requestContext, 'session_getSessionData');
}

function updateProjectConfig(requestContext: APIRequestContext, config: any) {
  return jsonRpc(requestContext, 'lex_configuration_update', [config, []]);
}
