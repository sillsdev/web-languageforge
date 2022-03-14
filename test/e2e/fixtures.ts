// example.spec.ts
import { test as base } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import type { usernamesForFixture } from './userFixtures';

export type UserTab = Page & {
  username: string;
}

const userTab = (username: usernamesForFixture) => async ({ browser, browserName }: { browser: Browser, browserName: string}, use: (r: UserTab) => Promise<void>) => {
  const storageState = `${browserName}-${username}-storageState.json`;
  const context = await browser.newContext({ storageState })
  const page = await context.newPage();
  const tab = page as UserTab;
  tab.username = username;
  await use(tab);
  await tab.close();
  await context.close();
}

// Extend basic test by providing a "todoPage" fixture.
export const test = (base
  .extend<{ adminTab: UserTab }>({ adminTab: userTab('admin') })
  .extend<{ managerTab: UserTab }>({ managerTab: userTab('manager') })
  .extend<{ memberTab: UserTab }>({ memberTab: userTab('member') })
  .extend<{ member2Tab: UserTab }>({ member2Tab: userTab('member2') })
  .extend<{ observerTab: UserTab }>({ observerTab: userTab('observer') })
);
