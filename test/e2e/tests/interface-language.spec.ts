import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { ForgotPasswordPage, LoginPage } from '../pages';
import { PageHeader } from '../pages/components';

test.describe('Interface Language picker', () => {
  let loginPage: LoginPage;
  let pageHeader: PageHeader;
  let forgotPasswordPage: ForgotPasswordPage;

  test.beforeEach(async ({ tab }) => {
    loginPage = new LoginPage(tab);
    pageHeader = new PageHeader(tab);
    forgotPasswordPage = new ForgotPasswordPage(tab);
    await loginPage.goto();
  });

  test('Should be using English interface for user at Login', async () => {
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });

  test('Can change user interface language to French, stays in French also on other pages, can change back to English', async () => {
    // Can change user interface language to French
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'Français' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('Français');

    // LOCAL STORAGE
    // Should still be using French in another page
    await forgotPasswordPage.goto();
    await expect(pageHeader.languageDropdownButton).toHaveText('Français');

    // Should still be using French back in the login page
    await loginPage.goto();
    await expect(pageHeader.languageDropdownButton).toHaveText('Français');

    // Can change user interface language back to English
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });

});
