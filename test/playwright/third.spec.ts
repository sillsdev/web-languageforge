import { expect, test, APIRequestContext, request, Page, Route, Response } from '@playwright/test';
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
    projectId = await getProjectId(adminRequest, constants.testProjectCode);
    adminPage = await getLoggedInPage(browser, 'admin');
    memberPage = await getLoggedInPage(browser, 'member');
    adminPage.goto(`/app/lexicon/${projectId}`);
    const session = await getSession(adminPage.request);
    expect(session.project.id).toEqual(projectId);
    session.projectSettings.config.pollUpdateIntervalMs = 5000;
    expect(session).toBeDefined();
    expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeDefined();
    expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeGreaterThanOrEqual(0);
    await updateProjectConfig(adminPage.request, session.projectSettings.config);
    const sessionAfterUpdate = await getSession(adminPage.request);
    expect(sessionAfterUpdate?.projectSettings?.config?.pollUpdateIntervalMs).toEqual(5000);
  });

  test('Edit data in one entry', async ({ baseURL }) => {
    const session = await getSession(adminPage.request);
    expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toEqual(5000);
    await Promise.all([
      projectId ? adminPage.goto(`/app/lexicon/${projectId}`) : adminPage.goto('/app/projects'),
      projectId ? memberPage.goto(`/app/lexicon/${projectId}`) : memberPage.goto('/app/projects'),
    ]);
    const routeHandler = (method: string) => {
      let allowMethod = false;
      const handler = (route: Route) => {
        const req = route.request();
        const json = req.postDataJSON();
        if (json.method === method) {
          if (allowMethod) {
            // allowMethod = false;  // Keep allowing after allowing it once
            route.continue();
          } else {
            route.abort('connectionfailed');
          }
        } else {
          route.continue();
        }
      };
      handler.allowOnce = () => { allowMethod = true; };
      return handler;
    };
    const responseAwaiter = (method: string) => {
      return (response: Response) => {
        if (!response.url().endsWith('/api/sf')) return false;
        const json = response.request().postDataJSON();
        return (json?.method === method);
      };
    };
    const adminUpdateRouteHandler = routeHandler('lex_entry_update');
    const memberUpdateRouteHandler = routeHandler('lex_entry_update');
    const adminDtoUpdateRouteHandler = routeHandler('lex_dbeDtoUpdatesOnly');
    const memberDtoUpdateRouteHandler = routeHandler('lex_dbeDtoUpdatesOnly');
    await adminPage.route('**/api/sf', adminUpdateRouteHandler);
    await memberPage.route('**/api/sf', memberUpdateRouteHandler);
    await adminPage.route('**/api/sf', adminDtoUpdateRouteHandler);
    await memberPage.route('**/api/sf', memberDtoUpdateRouteHandler);
    await Promise.all([
      adminPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click(),
      memberPage.waitForTimeout(100).then(() => memberPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click()),
    ]);
    await Promise.all([
      expect(await getField(adminPage, "Word", "th").inputValue()).toContain(constants.testEntry2.lexeme['th'].value),
      expect(await getField(memberPage, "Word", "tipa").inputValue()).toContain(constants.testEntry2.lexeme['th-fonipa'].value),
    ]);
    await Promise.all([
      getField(adminPage, "Word", "tipa").fill('tipa for Word from admin'),
      memberPage.waitForTimeout(100).then(() => getField(memberPage, "Word", "th").fill('th for Word from member')),
    ]);
    await Promise.all([
      getField(adminPage, "Word", "th").click(),
      getField(memberPage, "Word", "tipa").click(),
    ]);
    await Promise.all([
      adminPage.screenshot({path: 'admin-filled-in.png'}),
      memberPage.screenshot({path: 'member-filled-in.png'}),
    ]);
    test.setTimeout(45 * 1000); // Otherwise waiting 30s will run over the default 30s timeout
    await Promise.all([
      adminPage.waitForResponse(responseAwaiter('lex_entry_update')),
      memberPage.waitForResponse(responseAwaiter('lex_entry_update')),
      adminUpdateRouteHandler.allowOnce(),
      memberUpdateRouteHandler.allowOnce(),
      ]);
    await Promise.all([
      adminPage.waitForResponse(responseAwaiter('lex_dbeDtoUpdatesOnly')),
      memberPage.waitForResponse(responseAwaiter('lex_dbeDtoUpdatesOnly')),
      memberDtoUpdateRouteHandler.allowOnce(),
      adminDtoUpdateRouteHandler.allowOnce(),
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
