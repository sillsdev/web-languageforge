// example.spec.ts
import { test as base, APIRequestContext } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import type { E2EUsernames } from './e2e-users';
import constants from '../testConstants.json';
import { getStorageStatePath, UserTestService } from './user-tools';
import { Project } from './types';
import { initTestProjectForTest } from './testSetup';

export type UserDetails = {
  username: string,
  password: string,
  name: string,
  email: string,
}

export type UserTab = Page & UserDetails;

function setupUserDetails(obj: UserDetails, username: E2EUsernames) {
  obj.username = constants[`${username}Username`] ?? username;
  obj.name = constants[`${username}Name`] ?? username;
  obj.password = constants[`${username}Password`] ?? 'x';
  obj.email = constants[`${username}Email`] ?? `${username}@example.com`;
}

const userTab = (username: E2EUsernames) => async ({ browser, browserName }: { browser: Browser, browserName: string }, use: (r: UserTab) => Promise<void>) => {
  const storageState = getStorageStatePath(browserName, username);
  const context = await browser.newContext({ storageState })
  const page = await context.newPage();
  const tab = page as UserTab;
  setupUserDetails(tab, username);
  await use(tab);
}

const userDetails = (username: E2EUsernames) => async ({ }, use: (r: UserDetails) => Promise<void>) => {
  let user = {} as UserDetails;
  setupUserDetails(user, username);
  await use(user);
};

// Add user fixtures to test function
// Two kinds of fixtures: userTab and user, where "user" is one of "admin", "manager", "member", "member2", or "observer"
// The userTab fixture represents a browser tab (a "page" in Playwright terms) that's already logged in as that user
// The anonTab fixture represents a browser tab (a "page" in Playwright terms) where nobody is logged in; this tab can be used across different tests (like userTab)
// The user fixture just carries that user's details (username, password, name and email)
// Note: "Tab" was chosen instead of "Page" to avoid confusion with Page Object Model classes like SiteAdminPage
export const test = base
  .extend<{
    adminTab: UserTab,
    managerTab: UserTab,
    memberTab: UserTab,
    member2Tab: UserTab,
    observerTab: UserTab,
    anonTab: Page,
    admin: UserDetails,
    manager: UserDetails,
    member: UserDetails,
    member2: UserDetails,
    observer: UserDetails,
    userService: UserTestService,
  }>({
    adminTab: userTab('admin'),
    managerTab: userTab('manager'),
    memberTab: userTab('member'),
    member2Tab: userTab('member2'),
    observerTab: userTab('observer'),
    anonTab: async ({ browser }: { browser: Browser }, use: (r: Page) => Promise<void>) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const tab = page;
      await use(tab);
    },
    admin: userDetails('admin'),
    manager: userDetails('manager'),
    member: userDetails('member'),
    member2: userDetails('member2'),
    observer: userDetails('observer'),
    userService: async ({ request }: {request: APIRequestContext}, use: (userService: UserTestService) => Promise<void>) => {
      const userService = new UserTestService(request);
      await use(userService);
    },
  });

/**
 * When called a LF project will be created for each playwright test (i.e. test.beforeEach)
 * @returns a function for accessing the project that was created for the current test
 */
export const projectPerTest = (): () => Project => {

  let currentTestProject: Project;

  test.beforeEach(async ({ request, manager }, testInfo) => {
    currentTestProject = await initTestProjectForTest(request, testInfo, manager);
  });

  return () => currentTestProject;
}
