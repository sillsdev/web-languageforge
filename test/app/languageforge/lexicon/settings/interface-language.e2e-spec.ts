import {BellowsForgotPasswordPage} from '../../../bellows/shared/forgot-password.page';
import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {PageHeader} from '../../../bellows/shared/page-header.element';

describe('Interface Language picker (LF only so far)', () => {
  const header = new PageHeader();

  it('should be using English interface for user at Login', async () => {
    await BellowsLoginPage.logout();
    await BellowsLoginPage.get();
    expect<any>(await header.language.button.getText()).toEqual('English');
  });

  it('can change user interface language to French', async () => {
    await header.language.button.click();
    await header.language.findItem('Français').click();
    expect<any>(await header.language.button.getText()).toEqual('Français');
  });

  describe('local storage', async () => {

    it('should still be using French in another page', async () => {
      await BellowsForgotPasswordPage.get();
      expect<any>(await header.language.button.getText()).toEqual('Français');
    });

    it('should still be using French back in the login page', async () => {
      await BellowsLoginPage.get();
      expect<any>(await header.language.button.getText()).toEqual('Français');
    });

  });

  it('can change user interface language to back English', async () => {
    await header.language.button.click();
    await header.language.findItem('English').click();
    expect<any>(await header.language.button.getText()).toEqual('English');
  });

});
