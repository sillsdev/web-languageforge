import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { HomePage, LoginPage, SignupPage, TermsAndConditionsPage } from '../pages';

test.describe('Homepage', () => {

  test('Content', async ({ tab }) => {
    const homePage = await HomePage.goto(tab);
    await expect(homePage.additionalResourceLinkContainer.first()).not.toBeEmpty();
    await expect(homePage.videoIFrame).toBeVisible();

    await Promise.all([
      homePage.termsAndConditionsLink.click(),
      TermsAndConditionsPage.waitFor(tab),
    ]);
  });

  test('Signup and login buttons', async ({ tab }) => {
    const homePage = await HomePage.goto(tab);

    await Promise.all([
      homePage.signupButton.first().click(),
      SignupPage.waitFor(tab),
    ]);

    await Promise.all([
      tab.goBack(),
      homePage.waitFor(),
    ]);

    await Promise.all([
      homePage.loginButton.first().click(),
      LoginPage.waitFor(tab),
    ]);
  });
});
