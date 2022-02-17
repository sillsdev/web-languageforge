// my-test.ts
import { Browser, test as base } from '@playwright/test';

// Declare the types of your fixtures.
type MyFixtures = {
  adminPage: Page;
  managerPage: Page;
  memberPage: Page;
  member2Page: Page;
  observerPage: Page;
};

async function setupFixture(username: string, browser: Browser, use) {
    // Set up the fixture.
    const context = browser.newContext({ storageState: `${username}-storageState.json` });
    const page = context.newPage();

    // Use the fixture value in the test.
    await use(page);

    // Clean up the fixture.
    await browser.close();
}

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    await setupFixture('admin', browser, use);
  },
  managerPage: async ({ browser }, use) => {
    await setupFixture('manager', browser, use);
  },
  memberPage: async ({ browser }, use) => {
    await setupFixture('member', browser, use);
  },
  member2Page: async ({ browser }, use) => {
    await setupFixture('member2', browser, use);
  },
  observerPage: async ({ browser }, use) => {
    await setupFixture('observer', browser, use);
  }
});
export { expect } from '@playwright/test';
