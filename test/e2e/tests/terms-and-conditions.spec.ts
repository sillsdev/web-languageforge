import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { TermsAndConditionsPage } from '../pages';

test.describe('Terms and conditions', () => {

  test('Content', async ({ tab }) => {
    const termsPage = await TermsAndConditionsPage.goto(tab);
    await expect(termsPage.locator(':text("PLEASE REVIEW BEFORE USING THIS WEBSITE")')).toBeVisible();
  });
});
