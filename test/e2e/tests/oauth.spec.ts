import { test } from '../fixtures';
import { OAuthFacebookPage, OAuthGooglePage } from '../pages';

test.describe('OAuth', () => {

  test('Google OAuth page loads', async ({ tab }) => {
    await new OAuthGooglePage(tab).goto();
  });

  test('Facebook OAuth page loads', async ({ tab }) => {
    await new OAuthFacebookPage(tab).goto();
  });

});
