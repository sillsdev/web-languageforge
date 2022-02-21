import { chromium, PlaywrightTestConfig, Page } from '@playwright/test';
import { getLoginInfo } from './login';
import url from 'url';

const testUserList = ['admin', 'member' ];
// const testUserList = ['admin', 'manager', 'member', 'member2', 'observer'];

async function loginDuringSetup(page: Page, baseURL: string, name: string) {
  const { username, password } = getLoginInfo(name);
  const loginUrl = url.resolve(baseURL ?? 'http://localhost:3238/', '/auth/login');
  console.log(loginUrl);
  await page.goto(loginUrl);
  await page.locator('input[name="_username"]').fill(username);
  await page.locator('input[name="_password"]').fill(password);
  return Promise.all([
    page.waitForNavigation(),
    page.locator('button:has-text("Login")').click()
  ]);

}

async function setupAuth(config: PlaywrightTestConfig) {
    const browser = await chromium.launch();

    for (const user of testUserList) {
      const page = await browser.newPage();
      await loginDuringSetup(page, config?.use?.baseURL, user);
      const stateFile = `${user}-storageState.json`;
      await page.context().storageState({ path: stateFile });
    }
    await browser.close();
}

export default setupAuth;
