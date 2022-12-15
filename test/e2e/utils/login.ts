import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { UserDetails } from './types';

export async function login(page: Page, user: UserDetails): Promise<void> {
  const loginPage = await new LoginPage(page).goto();
  await loginPage.login(user);
}

export async function logout(page: Page): Promise<LoginPage> {
  await page.goto('/auth/logout');
  return new LoginPage(page).waitForPage();
}
