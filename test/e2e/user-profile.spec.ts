import { test, UserTab, UserDetails } from './utils/fixtures';
import { UserProfilePage } from './pages/user-profile.page';
import { expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProjectsPage } from './pages/projects.page';
import { random } from './utils/random';

test.describe('E2E User Profile', () => {

  /*
  Ultimately the "writable" user should get reset each time to prevent it from getting stuck in an invalid state.
  I would expect `initUser` to do that, but it doesn't.
  If this test ever gives us trouble as a result then
  it would be worth looking into getting this to work properly.

  test.beforeEach(async ({context}) => {
    await initUser(context, 'writable');
  });
  */

  test('Generated user account and about me info', async ({member2Tab}) => {
    const userProfilePage = new UserProfilePage(member2Tab);
    await userProfilePage.goto();

    await expect(userProfilePage.accountTab.emailField).toHaveValue(member2Tab.email);
    await expect(userProfilePage.accountTab.usernameField).toHaveValue(member2Tab.username);

    await userProfilePage.tabs.aboutMe.click();

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(member2Tab.name);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue('');
  });


  test('Update user account info', async ({writableTab}) => {
    const userProfilePage = new UserProfilePage(writableTab);
    await userProfilePage.goto();

    const newEmail = `newemail-${Date.now()}@example.com`;
    await userProfilePage.accountTab.emailField.fill(newEmail);
    await userProfilePage.accountTab.colorField.selectOption({label: 'Steel Blue'});
    await userProfilePage.accountTab.animalField.selectOption({label: 'Otter'});

    await userProfilePage.saveBtn.click();
    await Promise.all([
      userProfilePage.page.reload(),
      userProfilePage.waitForPage(),
    ]);

    await expect(userProfilePage.accountTab.emailField).toHaveValue(newEmail);
    await expect(userProfilePage.accountTab.colorField).toHaveSelectedOption({label: 'Steel Blue'});
    await expect(userProfilePage.accountTab.animalField).toHaveSelectedOption({label: 'Otter'});
  });

  test('Update username and re-login', async ({writableTab}) => {
    const currUsername = writableTab.username;
    const newUsername = `${writableTab.username}-new`;

    await changeUsernameAndLogin(newUsername, writableTab, writableTab);
    const newDetails = {...writableTab, username: newUsername};
    await changeUsernameAndLogin(currUsername, newDetails, writableTab);
  });

  const changeUsernameAndLogin = async (newUsername: string, currDetails: UserDetails, tab: UserTab): Promise<void> => {
    const userProfilePage = new UserProfilePage(tab);
    await userProfilePage.goto();

    await expect(userProfilePage.accountTab.usernameField).toHaveValue(currDetails.username);
    await userProfilePage.accountTab.usernameField.fill(newUsername);
    await userProfilePage.saveBtn.click();

    const loginPage = new LoginPage(tab);

    await Promise.all([
      userProfilePage.modal.saveChangesBtn.click(),
      loginPage.waitForPage(),
    ]);

    await Promise.all([
      loginPage.loginAs(newUsername, currDetails.password),
      new ProjectsPage(tab).waitForPage(),
    ]);
  };

  test('Update user about me info', async ({writableTab}) => {
    const userProfilePage = new UserProfilePage(writableTab);
    await userProfilePage.goto();
    await userProfilePage.tabs.aboutMe.click();

    const newName = `Name - ${random()}`;
    await userProfilePage.aboutMeTab.nameField.fill(newName);
    const newAge = random(2).toString();
    await userProfilePage.aboutMeTab.ageField.fill(newAge);
    await userProfilePage.aboutMeTab.genderField.selectOption({label: 'Female'});

    await userProfilePage.saveBtn.click();
    await Promise.all([
      userProfilePage.page.reload(),
      userProfilePage.waitForPage(),
    ]);

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(newName);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue(newAge);
    await expect(userProfilePage.aboutMeTab.genderField).toHaveSelectedOption({label:'Female'});
  });

});
