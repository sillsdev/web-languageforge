import { chromium, FullConfig } from '@playwright/test';
import { loginAs } from './login';

async function setupAuth(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    // TODO: Get list of users from testConstants and log in as all of them, saving each to a different storage state
    await loginAs(page, 'admin');
    const stateFile = 'storageState.json';
    await page.context().storageState({ path: stateFile });
    await browser.close();
}

export default setupAuth;
