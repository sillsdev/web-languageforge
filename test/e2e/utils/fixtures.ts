// example.spec.ts
import { test as base } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import type { usernamesForFixture } from './userFixtures';
import constants from '../testConstants.json';

export type UserDetails = {
  username: string,
  password: string,
  name: string,
  email: string,
}

export type UserTab = Page & UserDetails;

function setupUserDetails(obj: any, username: usernamesForFixture) {
  obj.username = constants[`${username}Username`] ?? username;
  obj.name = constants[`${username}Name`] ?? username;
  obj.password = constants[`${username}Password`] ?? 'x';
  obj.email = constants[`${username}Email`] ?? `${username}@example.com`;
}

const userTab = (username: usernamesForFixture) => async ({ browser, browserName }: { browser: Browser, browserName: string}, use: (r: UserTab) => Promise<void>) => {
  const storageState = `${browserName}-${username}-storageState.json`;
  const context = await browser.newContext({ storageState })
  const page = await context.newPage();
  const tab = page as UserTab;
  setupUserDetails(tab, username);
  await use(tab);
}

// Add user fixtures to test function
// Two kinds of fixtures: userTab and user, where "user" is one of "admin", "manager", "member", "member2", or "observer"
// The userTab fixture represents a browser tab (a "page" in Playwright terms) that's already logged in as that user
// The user fixture just carries that user's details (username, password, name and email)
// Note: "Tab" was chosen instead of "Page" to avoid confusion with Page Object Model classes like SiteAdminPage
export const test = (base
  .extend<{
    adminTab: UserTab,
    managerTab: UserTab,
    memberTab: UserTab,
    member2Tab: UserTab,
    observerTab: UserTab,
    admin: UserDetails,
    manager: UserDetails,
    member: UserDetails,
    member2: UserDetails,
    observer: UserDetails,
  }>({
    adminTab: userTab('admin'),
    managerTab: userTab('manager'),
    memberTab: userTab('member'),
    member2Tab: userTab('member2'),
    observerTab: userTab('observer'),
    admin: async ({}, use) => {
      let admin = {} as UserDetails;
      setupUserDetails(admin, 'admin');
      await use(admin);
    },
    manager: async ({}, use) => {
      let manager = {} as UserDetails;
      setupUserDetails(manager, 'manager');
      await use(manager);
    },
    member: async ({}, use) => {
      let member = {} as UserDetails;
      setupUserDetails(member, 'member');
      await use(member);
    },
    member2: async ({}, use) => {
      let member2 = {} as UserDetails;
      setupUserDetails(member2, 'member2');
      await use(member2);
    },
    observer: async ({}, use) => {
      let observer = {} as UserDetails;
      setupUserDetails(observer, 'observer');
      await use(observer);
    }
  })
);
