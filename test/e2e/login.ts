import { Browser, Page } from '@playwright/test';
import constants from '../app/testConstants.json';

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

export function getLoginInfo(name: string) {
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

export function loginAs(page: Page, name: string) {
  const { username, password } = getLoginInfo(name);
  return login(page, username, password);
}

export async function getLoggedInPage(browser: Browser, name: string) {
  const context = await browser.newContext({ storageState: `${name}-storageState.json` });
  return await context.newPage();
}
