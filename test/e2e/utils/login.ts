import { Browser, Page } from '@playwright/test';
import constants from '../testConstants.json';
import type { E2EUsernames } from './e2e-users';
import { getStorageStatePath } from './user-tools';
import { LoginPage } from '../pages/login.page';

export async function login(page: Page, username: string, password: string): Promise<void> {
  const loginPage = await new LoginPage(page).goto();
  await loginPage.loginAs(username, password);
}

export async function logout(page: Page): Promise<LoginPage> {
  await page.goto('/auth/logout');
  return new LoginPage(page).waitForPage();
}

export function getLoginInfo(name: E2EUsernames) {
  const usernameKey = `${name}Username`;
  const passwordKey = `${name}Password`;
  if (Object.hasOwnProperty.call(constants, usernameKey)) {
    const username = constants[usernameKey];
    const password = constants[passwordKey];
    return { username, password };
  } else {
    throw new Error(`No ${name}Username found in testconstants.json`);

  }
}

export function loginAs(page: Page, name: E2EUsernames): Promise<void> {
  const { username, password } = getLoginInfo(name);
  return login(page, username, password);
}

export async function getLoggedInPage(browser: Browser, user: string) {
  const browserName = browser.browserType().name();
  const storageState = getStorageStatePath(browserName, user);
  const context = await browser.newContext({ storageState });
  return await context.newPage();
}
