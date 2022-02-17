import { chromium, FullConfig } from '@playwright/test';
import { loginAs, logout } from './login';

const testUserList = ['admin', 'manager', 'member', 'member2', 'observer'];

async function setupAuth(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const user of testUserList) {
      await loginAs(page, user);
      const stateFile = `${user}-storageState.json`;
      await page.context().storageState({ path: stateFile });
      await logout(page);
    }
    await browser.close();
}

export default setupAuth;
