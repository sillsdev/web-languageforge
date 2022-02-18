import { chromium, PlaywrightTestConfig, Page } from '@playwright/test';
import { getLoginInfo } from './login';
import url from 'url';

const testUserList = ['admin', 'manager', 'member', 'member2', 'observer'];

async function loginDuringSetup(page: Page, baseURL: string, name: string) {
  const { username, password } = getLoginInfo(name);
  const loginUrl = url.resolve(baseURL ?? 'http://app-for-e2e/', '/auth/login');
  console.log(loginUrl);
  await page.goto(loginUrl);
  await page.screenshot({ path: `${name}-login-page.png` });
  await page.locator('input[name="_username"]').fill(username);
  await page.locator('input[name="_password"]').fill(password);
  return Promise.all([
    page.waitForNavigation(),
    page.locator('button:has-text("Login")').click()
  ]);

}

async function logoutDuringSetup(page: Page, baseURL: string) {
  const logoutUrl = url.resolve(baseURL ?? 'http://app-for-e2e/', '/auth/logout');
  console.log(logoutUrl);
  return page.goto(logoutUrl, { waitUntil: 'networkidle' });
  // return Promise.all([
  //   page.goto(logoutUrl),
  //   page.waitForNavigation(),
  // ]);
}

async function setupAuth(config: PlaywrightTestConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const user of testUserList) {
      await loginDuringSetup(page, config?.use?.baseURL, user);
      const stateFile = `${user}-storageState.json`;
      await page.context().storageState({ path: stateFile });
      await logoutDuringSetup(page, config?.use?.baseURL);
      await page.screenshot({ path: `${user}-logout-page.png` });
    }
    await browser.close();
}

export default setupAuth;
