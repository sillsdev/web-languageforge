// example.spec.ts
import { test as base } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import type { usernamesForFixture } from './userFixtures';
import constants from '../testConstants.json';

export type UserTab = Page & {
  username: string,
  password: string,
  name: string,
  email: string,
}

const userTab = (username: usernamesForFixture) => async ({ browser, browserName }: { browser: Browser, browserName: string}, use: (r: UserTab) => Promise<void>) => {
  const storageState = `${browserName}-${username}-storageState.json`;
  const context = await browser.newContext({ storageState })
  const page = await context.newPage();
  const tab = page as UserTab;
  tab.username = constants[`${username}Username`] ?? username;
  tab.name = constants[`${username}Name`] ?? username;
  tab.password = constants[`${username}Password`] ?? 'x';
  tab.email = constants[`${username}Email`] ?? `${username}@example.com`;
  await use(tab);
  await tab.close();
  await context.close();
}

// Extend basic test by providing a "todoPage" fixture.
export const test = (base
  .extend<{ adminTab: UserTab,
   managerTab: UserTab,
   memberTab: UserTab,
   member2Tab: UserTab,
   observerTab: UserTab,
   tab: Page
  }>(
  {
    adminTab: userTab('admin'),
    managerTab: userTab('manager'),
    memberTab: userTab('member'),
    member2Tab: userTab('member2'),
    observerTab: userTab('observer'),
    tab: async ({ page }, use) => use(page)
  }
));
