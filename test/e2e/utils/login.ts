import { Browser, Page } from '@playwright/test';
import constants from '../testConstants.json';
import type { E2EUsernames } from './e2e-users';
import { getStorageStatePath } from './user-tools';

export async function login(page: Page, username: string, password: string) {
  await page.goto('/auth/login');
  await page.locator('input[name="_username"]').fill(username);
  await page.locator('input[name="_password"]').fill(password);
  return Promise.all([
    page.waitForNavigation(),
    page.locator('button:has-text("Login")').click()
  ]);
}

export async function logout(page: Page) {
  return await page.goto('/auth/logout');
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

export function loginAs(page: Page, name: E2EUsernames) {
  const { username, password } = getLoginInfo(name);
  return login(page, username, password);
}

export async function getLoggedInPage(browser: Browser, user: string) {
  const browserName = browser.browserType().name();
  const storageState = getStorageStatePath(browserName, user);
  const context = await browser.newContext({ storageState });
  return await context.newPage();
}
