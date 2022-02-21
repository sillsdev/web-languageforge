import { expect, test, APIRequestContext, request, Page } from '@playwright/test';
import { getLoggedInPage } from './login';
import constants from '../app/testConstants.json';
import { jsonRpc } from './utils/json-rpc';

test.describe.only('Multiple users editing the same project', () => {
  let adminPage: Page;
  let memberPage: Page;
  const entryName: string = constants.testEntry2.lexeme.th.value;

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

  test('Load project and entry', async () => {
    await Promise.all([
      adminPage.goto('/app/projects'),
      memberPage.goto('/app/projects'),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-projects.png'}),
      memberPage.screenshot({path: 'member-projects.png'}),
    ]);
    await Promise.all([
      adminPage.locator(`div.listview a:has-text("${constants.testProjectName}")`).click(),
      memberPage.locator(`div.listview a:has-text("${constants.testProjectName}")`).click(),
    ]);
    await Promise.all([
      adminPage.locator(`text=${entryName}`).click(),
      memberPage.locator(`text=${entryName}`).click(),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-project.png'}),
      memberPage.screenshot({path: 'member-project.png'}),
    ]);
  });

  test('Edit data in one entry', async () => {
    await Promise.all([
      adminPage.goto('/app/projects'),
      // memberPage.goto('/app/projects'),
    ]);
    await Promise.all([
      adminPage.locator(`div.listview a:has-text("${constants.testProjectName}")`).click(),
      // memberPage.locator(`div.listview a:has-text("${constants.testProjectName}")`).click(),
    ]);
    await Promise.all([
      adminPage.locator(`text=${entryName}`).click(),
      // memberPage.locator(`text=${entryName}`).click(),
    ]);
    await Promise.all([
      getField(adminPage, "Word", "tipa").fill('tipa for Word'),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-filled-in.png'}),
    ]);
  });
});

function getSession(requestContext: APIRequestContext) {
  return jsonRpc(requestContext, 'session_getSessionData');
}

function updateProjectConfig(requestContext: APIRequestContext, config: any) {
  return jsonRpc(requestContext, 'lex_configuration_update', [config, []]);
}

function getField(page: Page, fieldName: string, ws: string) {
  return page.locator(`div.dc-entry form:has-text("${fieldName}") .input-group:has(span.wsid:text-is("${ws}")) textarea`)
}
