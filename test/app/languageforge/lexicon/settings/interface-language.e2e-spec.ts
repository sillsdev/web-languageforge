import {BellowsForgotPasswordPage} from '../../../bellows/shared/forgot-password.page';
import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {PageHeader} from '../../../bellows/shared/page-header.element';

describe('Interface Language picker (LF only so far)', () => {
  const header = new PageHeader();

  it('should be using English interface for user at Login', () => {
    BellowsLoginPage.logout();
    BellowsLoginPage.get();
    expect<any>(header.language.button.getText()).toEqual('English');
  });

  it('can change user interface language to French', () => {
    header.language.button.click();
    header.language.findItem('Français').click();
    expect<any>(header.language.button.getText()).toEqual('Français');
  });

  describe('local storage', () => {

    it('should still be using French in another page', () => {
      BellowsForgotPasswordPage.get();
      expect<any>(header.language.button.getText()).toEqual('Français');
    });

    it('should still be using French back in the login page', () => {
      BellowsLoginPage.get();
      expect<any>(header.language.button.getText()).toEqual('Français');
    });

  });

  it('can change user interface language to back English', () => {
    header.language.button.click();
    header.language.findItem('English').click();
    expect<any>(header.language.button.getText()).toEqual('English');
  });

});
