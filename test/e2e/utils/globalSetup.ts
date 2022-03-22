// playwright.config.ts
import type { APIRequestContext, FullConfig } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';
import { testControl } from './jsonrpc';
import constants from '../testConstants.json';
import { loginAs } from './login';
import { usersToCreate } from './userFixtures';
import * as fs from 'fs';

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
    const sessionLifetime = 365 * 24 * 60 * 60 * 1000;  // 1 year, in milliseconds
    const now = new Date();
    const sessionCutoff = now.getTime() - sessionLifetime;
    for (const user of usersToCreate) {
      const path = `${browserName}-${user}-storageState.json`;
      if (fs.existsSync(path) && fs.statSync(path)?.ctimeMs >= sessionCutoff) {
        // Storage state file is recent, no need to re-create it
        continue;
      }
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      await loginAs(page, user);
      await context.storageState({ path });
    }
  }
}
