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
    session.projectSettings.config.pollUpdateIntervalMs = 500;
    expect(session).toBeDefined();
    expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeDefined();
    expect(session?.projectSettings?.config?.pollUpdateIntervalMs).toBeGreaterThanOrEqual(0);
    await updateProjectConfig(adminPage.request, session.projectSettings.config);
    const sessionAfterUpdate = await getSession(adminPage.request);
    expect(sessionAfterUpdate?.projectSettings?.config?.pollUpdateIntervalMs).toEqual(500);
  });

  test('Edit data in one entry', async ({ baseURL }) => {
    // Ensure new page load by going to / before project page
    await Promise.all([
      adminPage.goto('/'),
      memberPage.goto('/'),
    ]);

    // Now go to project page, causing the project settings (including poll update interval) to be loaded now
    await Promise.all([
      projectId ? adminPage.goto(`/app/lexicon/${projectId}`) : adminPage.goto('/app/projects'),
      projectId ? memberPage.goto(`/app/lexicon/${projectId}`) : memberPage.goto('/app/projects'),
    ]);

    // Paranoia check to make sure the session did load the proper update interval
    const [adminSession, memberSession] = await Promise.all([
      getSession(adminPage.request),
      getSession(memberPage.request),
    ]);
    expect(adminSession?.projectSettings?.config?.pollUpdateIntervalMs).toEqual(500);
    expect(memberSession?.projectSettings?.config?.pollUpdateIntervalMs).toEqual(500);

    // Give names to the four route handlers so we can call .allow() on them later on
    const adminUpdateRouteHandler = routeHandler('lex_entry_update');
    const memberUpdateRouteHandler = routeHandler('lex_entry_update');
    const adminDtoUpdateRouteHandler = routeHandler('lex_dbeDtoUpdatesOnly');
    const memberDtoUpdateRouteHandler = routeHandler('lex_dbeDtoUpdatesOnly');

    // Block the routes that send updates to the API and read updates from the API, so we can control when those happen
    await adminPage.route('**/api/sf', adminUpdateRouteHandler);
    await memberPage.route('**/api/sf', memberUpdateRouteHandler);
    await adminPage.route('**/api/sf', adminDtoUpdateRouteHandler);
    await memberPage.route('**/api/sf', memberDtoUpdateRouteHandler);

    // Member loads page 100 milliseconds after admin, to ensure ordering of the writes: admin first, then member
    await Promise.all([
      adminPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click(),
      memberPage.waitForTimeout(100).then(() => memberPage.locator(`#scrolling-entry-words-container >> text=${entryName}`).click()),
    ]);

    // Verify the old value of the fields before proceeding with the test
    await Promise.all([
      expect(await getField(adminPage, "Word", "th").inputValue()).toContain(constants.testEntry2.lexeme['th'].value),
      expect(await getField(memberPage, "Word", "tipa").inputValue()).toContain(constants.testEntry2.lexeme['th-fonipa'].value),
    ]);

    // Admin changes the Thai IPA field, while member changes the Thai field
    await Promise.all([
      getField(adminPage, "Word", "tipa").fill('tipa for Word from admin'),
      memberPage.waitForTimeout(100).then(() => getField(memberPage, "Word", "th").fill('th for Word from member')),
    ]);

    // Click on another field to ensure that the model has been updated (probably not needed)
    await Promise.all([
      getField(adminPage, "Word", "th").click(),
      getField(memberPage, "Word", "tipa").click(),
    ]);

    // Screenshots to examine later (redundant with Playwright traces, so I'll get rid of them)
    // These are before allowing the API calls, for comparison to the post-call screenshots
    await Promise.all([
      adminPage.screenshot({path: 'admin-filled-in.png'}),
      memberPage.screenshot({path: 'member-filled-in.png'}),
    ]);

    // Note that we wait for responses *before* we allow the routes to proceed, to ensure that we don't create a
    // race condition that could cause us to miss the API call when it goes through

    // First, allow the "write" update to go through, writing our change(s) to Mongo
    await Promise.all([
      adminPage.waitForResponse(responseAwaiter('lex_entry_update')),
      memberPage.waitForResponse(responseAwaiter('lex_entry_update')),
      adminUpdateRouteHandler.allowOnce(),
      memberUpdateRouteHandler.allowOnce(),
    ]);

    // Now allow the "read" update to go through, seeing the other person's change(s)
    await Promise.all([
      adminPage.waitForResponse(responseAwaiter('lex_dbeDtoUpdatesOnly')),
      memberPage.waitForResponse(responseAwaiter('lex_dbeDtoUpdatesOnly')),
      memberDtoUpdateRouteHandler.allowOnce(),
      adminDtoUpdateRouteHandler.allowOnce(),
    ]);

    // Screenshots to examine later (redundant with Playwright traces, so I'll get rid of them)
    // These should show the other person's changes having arrived
    await Promise.all([
      adminPage.screenshot({path: 'admin-waited.png'}),
      memberPage.screenshot({path: 'member-waited.png'}),
    ]);

    // Verify that both see the other one's changes: admin sees changed Thai field, member sees changed Thai IPA field
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

function routeHandler(method: string) {
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
}

function responseAwaiter(method: string) {
  return (response: Response) => {
    if (!response.url().endsWith('/api/sf')) return false;
    const json = response.request().postDataJSON();
    return (json?.method === method);
  };
}
