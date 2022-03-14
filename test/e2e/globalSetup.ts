// playwright.config.ts
import type { APIRequestContext, FullConfig } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';
import { testControl } from './jsonrpc';
import constants from '../app/testConstants.json';
import { loginAs } from './login';
import { usersToCreate } from './userFixtures';

function createUser(request: APIRequestContext, baseName: string) {
  const username = constants[`${baseName}Username`] ?? baseName;
  const fullName = constants[`${baseName}Name`] ?? username;
  const password = constants[`${baseName}Password`] ?? 'x';
  const email = constants[`${baseName}Email`] ?? `${username}@example.com`;
  return testControl(request, 'create_user', [username, fullName, password, email]);
}

export default async function globalSetup(config: FullConfig) {
  for (const project of config.projects) {
    const baseURL = project.use?.baseURL ?? (
      config.webServer.port
        ? `http://localhost:${config.webServer.port}`
        : config.webServer.url
    );
    const browserName = project.use?.browserName ?? project.use?.defaultBrowserType;
    const projectBrowser = (
      browserName === 'chromium' ? chromium :
      browserName === 'firefox' ? firefox :
      browserName === 'webkit' ? webkit :
      chromium
    );
    const browser = await projectBrowser.launch();
    const context = await browser.newContext({ baseURL });
    for (const user of usersToCreate) {
      createUser(context.request, user);
    }
    // Now log in as each user and ensure there's a storage state saved
    // TODO: Optimize by skipping if storage state exists and is less than N days old,
    // where N is based on the lifetime of our login cookies in the Language Forge source
    for (const user of usersToCreate) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      await loginAs(page, user);
      await context.storageState({ path: `${browserName}-${user}-storageState.json` });
    }
  }
}
