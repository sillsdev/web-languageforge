import { chromium, firefox, FullConfig, Page, webkit } from '@playwright/test';
import * as fs from 'fs';
import { appUrl, users } from './constants';
import { getStorageStatePath, login, UserDetails, UserTestService } from './utils';

const SESSION_LIFETIME = 365 * 24 * 60 * 60 * 1000; // 1 year, in milliseconds

async function initE2EUser(page: Page, user: UserDetails) {
  const context = page.context();
  await new UserTestService(context.request).createUser(user);

  // Now log in and ensure there's a storage state saved
  const sessionCutoff = Date.now() - SESSION_LIFETIME;
  const path = getStorageStatePath(user);
  if (fs.existsSync(path) && fs.statSync(path)?.ctimeMs >= sessionCutoff) {
    // Storage state file is recent, no need to re-create it
    return;
  }
  await login(page, user);
  await context.storageState({ path });
}

export default async function globalSetup(config: FullConfig) {
  console.log('Starting global setup\n');
  console.time('Global setup took');

  try {
    const use = config.projects[0].use;
    const browserType = { chromium, firefox, webkit }[use.defaultBrowserType];
    const browser = await browserType.launch();
    for (const user of Object.values(users)) {
      const context = await browser.newContext({ baseURL: appUrl });
      const page = await context.newPage();
      await initE2EUser(page, user);
      await context.close();
    }
  } catch (error) {
    console.warn(`Error in Playwright global setup: ${error}.`);
    throw error;
  }

  console.timeEnd('Global setup took');
  console.log('\n');
  console.time('Tests took');

  return () => {
    console.log('\n');
    console.timeEnd('Tests took');
    console.log('\n');
  }
}
