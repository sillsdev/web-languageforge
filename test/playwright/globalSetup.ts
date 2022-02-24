// tslint:disable: ordered-imports
import { chromium, PlaywrightTestConfig, APIRequestContext, Page } from '@playwright/test';
import { getLoginInfo } from './login';
import constants from '../app/testConstants.json';
import url from 'url';
import { jsonRpcParams } from './utils/json-rpc';

// NOTE: 'admin' should always be first
const testUserList = ['admin', 'member' ];
// const testUserList = ['admin', 'manager', 'member', 'member2', 'observer'];

let projectId = '';

async function jsonRpc(request: APIRequestContext, baseURL: string, method: string, orderedParams: any[] = [], params: any = {}) {
  const result = await request.post(url.resolve(baseURL, '/api/sf'), { data: jsonRpcParams(method, orderedParams, params) });
  const json = await result.json();
  if (json.result) {
    return json.result;
  } else {
    throw json.error;
  }
}

function getProjectId(requestContext: APIRequestContext, baseUrl: string, projectCode: string) {
  return jsonRpc(requestContext, baseUrl, 'project_id_by_code', [projectCode]);
}

async function loginDuringSetup(page: Page, config: PlaywrightTestConfig, name: string) {
  const { username, password } = getLoginInfo(name);
  const baseUrl = config.projects?.[0]?.use?.baseURL ?? `http://localhost:${config.webServer?.port}/`;
  const loginUrl = url.resolve(baseUrl, '/auth/login');
  console.log(loginUrl);
  await page.goto(loginUrl);
  await page.locator('input[name="_username"]').fill(username);
  await page.locator('input[name="_password"]').fill(password);
  await Promise.all([
    page.waitForNavigation(),
    page.locator('button:has-text("Login")').click()
  ]);
  if (!projectId) {
    projectId = await getProjectId(page.request, baseUrl, constants.testProjectCode);
  }
  // Ensure projectId stored in session will be the test project we're using
  await page.goto(url.resolve(baseUrl, `/app/lexicon/${projectId}`));
}

async function setupAuth(config: PlaywrightTestConfig) {
    const browser = await chromium.launch();

    for (const user of testUserList) {
      const page = await browser.newPage();
      await loginDuringSetup(page, config, user);
      const stateFile = `${user}-storageState.json`;
      await page.context().storageState({ path: stateFile });
    }
    await browser.close();
}

export default setupAuth;
