import { expect, test, APIRequestContext, request, Page } from '@playwright/test';
import { getLoggedInPage } from './login';
import constants from '../app/testConstants.json';
import { jsonRpc } from './utils/json-rpc';

test.describe.only('Multiple users editing the same project', () => {
  let adminPage: Page;
  let memberPage: Page;
  let projectId: string;
  const entryName: string = constants.testEntry2.lexeme.th.value;

  test.beforeEach(async ({browser, baseURL}) => {
    const adminRequest = await request.newContext({ storageState: 'admin-storageState.json', baseURL });
    const session = await getSession(adminRequest);
    session.projectSettings.config.pollUpdateIntervalMs = 10 * 1000;
    await updateProjectConfig(adminRequest, session.projectSettings.config);
    projectId = await getProjectId(adminRequest, constants.testProjectCode);
    adminPage = await getLoggedInPage(browser, 'admin');
    memberPage = await getLoggedInPage(browser, 'member');
    await Promise.all([
      projectId ? adminPage.goto(`/app/lexicon/${projectId}`) : adminPage.goto('/app/projects'),
      projectId ? memberPage.goto(`/app/lexicon/${projectId}`) : memberPage.goto('/app/projects'),
    ]);
  });

  test('Edit data in one entry', async () => {
    await Promise.all([
      adminPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click(),
      memberPage.waitForTimeout(1000).then(() => memberPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click()),
    ]);
    await Promise.all([
      expect(await getField(adminPage, "Word", "th").inputValue()).toContain(constants.testEntry2.lexeme['th'].value),
      expect(await getField(memberPage, "Word", "tipa").inputValue()).toContain(constants.testEntry2.lexeme['th-fonipa'].value),
    ]);
    await Promise.all([
      getField(adminPage, "Word", "tipa").fill('tipa for Word from admin'),
      memberPage.waitForTimeout(1000).then(() => getField(memberPage, "Word", "th").fill('th for Word from member')),
    ]);
    await Promise.all([
      getField(adminPage, "Word", "th").click(),
      getField(memberPage, "Word", "tipa").click(),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-filled-in.png'}),
      memberPage.screenshot({path: 'member-filled-in.png'}),
    ]);
    test.setTimeout(120 * 1000); // Otherwise waiting 75s will run over the default 30s timeout
    await Promise.all([
      adminPage.waitForTimeout(75 * 1000),
      memberPage.waitForTimeout(75 * 1000),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-waited.png'}),
      memberPage.screenshot({path: 'member-waited.png'}),
    ]);
    await Promise.all([
      expect(await getField(adminPage, "Word", "th").inputValue()).toContain('th for Word from member'),
      expect(await getField(memberPage, "Word", "tipa").inputValue()).toContain('tipa for Word from admin'),
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

function getProjectId(requestContext: APIRequestContext, projectCode: string) {
  return jsonRpc(requestContext, 'project_id_by_code', [projectCode]);
}
