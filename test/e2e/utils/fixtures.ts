import { test as base, APIRequestContext } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { getStorageStatePath, UserTestService } from './user-tools';
import { UserDetails } from './types';
import { initTestProjectForTest } from './testSetup';
import { Project } from './project-utils';
import { users } from '../constants';

export type UserTab = Page & UserDetails;
export type E2EUsername = keyof typeof users;

const userTab = (user: UserDetails) => async ({ browser, browserName }: { browser: Browser, browserName: string }, use: (r: UserTab) => Promise<void>) => {
  const storageState = getStorageStatePath(browserName, user);
  const context = await browser.newContext({ storageState })
  const page = await context.newPage();
  const tab = page as UserTab;
  await use(tab);
};

// The userTab fixture represents a browser tab (a "page" in Playwright terms) that's already logged in as that user
// The anonTab fixture represents a browser tab (a "page" in Playwright terms) where nobody is logged in; this tab can be used across different tests (like userTab)
// Note: "Tab" was chosen instead of "Page" to avoid confusion with Page Object Model classes like SiteAdminPage
export const test = base
  .extend<{
    adminTab: UserTab,
    managerTab: UserTab,
    memberTab: UserTab,
    observerTab: UserTab,
    anonTab: Page,
    userService: UserTestService,
  }>({
    adminTab: userTab(users.admin),
    managerTab: userTab(users.manager),
    memberTab: userTab(users.member),
    observerTab: userTab(users.observer),
    anonTab: async ({ browser }: { browser: Browser }, use: (r: Page) => Promise<void>) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const tab = page;
      await use(tab);
    },
    userService: async ({ request }: {request: APIRequestContext}, use: (userService: UserTestService) => Promise<void>) => {
      const userService = new UserTestService(request);
      await use(userService);
    },
  });

/**
 * When called a LF project will be created before hand for each playwright test (i.e. test.beforeEach)
 * If lazy = true, a project will only be created when explicitly "accessed" by calling
 * the returned function. This is useful if not every test in the describe block really needs its own project.
 * @returns a function for accessing the project that was created for the current test
 */
export function projectPerTest(lazy: true): () => Promise<Project>
export function projectPerTest(lazy?: false): () => Project
export function projectPerTest(lazy?: boolean): () => Project | Promise<Project> {

  let currentTestProjectGetter: () => Promise<Project>;
  let currentTestProject: Project;

  test.beforeEach(async ({ request }, testInfo) => {
    currentTestProject = undefined;
    currentTestProjectGetter = () => initTestProjectForTest(request, testInfo, users.manager);
    if (!lazy) {
      currentTestProject = await initTestProjectForTest(request, testInfo, users.manager);
    }
  });

  if (lazy) {
    return async () => {
      currentTestProject ??= await currentTestProjectGetter();
      return currentTestProject;
    }
  } else {
    return () => currentTestProject;
  }
}
