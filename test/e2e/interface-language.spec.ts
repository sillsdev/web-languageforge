import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { LoginPage } from './pages/login.page';
import { PageHeader } from './components/page-header.component';
import { ForgotPasswordPage } from './pages/forgot-password.page';

test.describe('Interface Language picker (LF only so far)', () => {
  let loginPage: LoginPage;
  let pageHeader: PageHeader;
  let forgotPasswordPage: ForgotPasswordPage;

  test.beforeAll(async ({ anonTab }) => {
    loginPage = new LoginPage(anonTab);
    pageHeader = new PageHeader(anonTab);
    forgotPasswordPage = new ForgotPasswordPage(anonTab);
  });

  test.beforeEach(async () => {
    await loginPage.goto();
  })

  test('Should be using English interface for user at Login', async () => {
    await expect (pageHeader.languageDropdownButton).toHaveText('English');
  });

  test('Can change user interface language to French, stays in French also on other pages, can change back to English', async () => {
    // Can change user interface language to French
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'Français' }).click();
    await expect (pageHeader.languageDropdownButton).toHaveText('Français');

    // LOCAL STORAGE
    // Should still be using French in another page
    await forgotPasswordPage.goto();
    await expect (pageHeader.languageDropdownButton).toHaveText('Français');

    // Should still be using French back in the login page
    await loginPage.goto();
    await expect (pageHeader.languageDropdownButton).toHaveText('Français');

    // Can change user interface language back to English
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect (pageHeader.languageDropdownButton).toHaveText('English');
  });

});
