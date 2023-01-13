import { expect, Page } from '@playwright/test';
import { test } from '../fixtures';
import { LoginPage, ProjectsPage, UserProfilePage } from '../pages';
import { login, UserDetails } from '../utils';

test.describe('User Profile', () => {

  test('Generated user account and about me info', async ({ tab, userService }) => {
    const user = await userService.createRandomUser();
    await login(tab, user);

    const userProfilePage = await new UserProfilePage(tab).goto();

    await expect(userProfilePage.accountTab.emailField).toHaveValue(user.email);
    await expect(userProfilePage.accountTab.usernameField).toHaveValue(user.username);

    await userProfilePage.tabs.aboutMe.click();

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(user.name);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue('');
  });


  test('Update user account info', async ({ tab, userService }) => {
    const user = await userService.createRandomUser();
    await login(tab, user);

    const userProfilePage = new UserProfilePage(tab);
    await userProfilePage.goto();

    const newEmail = `newemail-${Date.now()}@example.com`;
    await userProfilePage.accountTab.emailField.fill(newEmail);
    await userProfilePage.accountTab.colorField.selectOption({ label: 'Steel Blue' });
    await userProfilePage.accountTab.animalField.selectOption({ label: 'Otter' });

    await userProfilePage.saveMyAccount();
    await Promise.all([
      userProfilePage.page.reload(),
      userProfilePage.waitFor(),
    ]);

    await expect(userProfilePage.accountTab.emailField).toHaveValue(newEmail);
    await expect(userProfilePage.accountTab.colorField).toHaveSelectedOption({ label: 'Steel Blue' });
    await expect(userProfilePage.accountTab.animalField).toHaveSelectedOption({ label: 'Otter' });
  });

  test('Update username and re-login', async ({ tab, userService }) => {
    const user = await userService.createRandomUser();
    await login(tab, user);

    const currUsername = user.username;
    const newUsername = `${user.username}-new`;

    await changeUsernameAndLogin(newUsername, user, tab);
    const newDetails = { ...user, username: newUsername };
    await changeUsernameAndLogin(currUsername, newDetails, tab);
  });

  const changeUsernameAndLogin = async (newUsername: string, currDetails: UserDetails, tab: Page): Promise<void> => {
    const userProfilePage = new UserProfilePage(tab);
    await userProfilePage.goto();

    await expect(userProfilePage.accountTab.usernameField).toHaveValue(currDetails.username);
    await userProfilePage.accountTab.usernameField.fill(newUsername);

    const [loginPage] = await Promise.all([
      LoginPage.waitFor(tab),
      userProfilePage.saveMyAccount(),
    ]);

    await Promise.all([
      loginPage.login({
        ...currDetails,
        username: newUsername,
      }),
      new ProjectsPage(tab).waitFor(),
    ]);
  };

  test('Update user about me info', async ({ tab, userService }) => {
    const user = await userService.createRandomUser();
    await login(tab, user);

    const userProfilePage = new UserProfilePage(tab);
    await userProfilePage.goto();
    await userProfilePage.tabs.aboutMe.click();

    const newName = `New name`;
    await userProfilePage.aboutMeTab.nameField.fill(newName);
    const newAge = '25';
    await userProfilePage.aboutMeTab.ageField.fill(newAge);
    await userProfilePage.aboutMeTab.genderField.selectOption({ label: 'Female' });

    await userProfilePage.saveAboutMe();
    await userProfilePage.reload();

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(newName);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue(newAge);
    await expect(userProfilePage.aboutMeTab.genderField).toHaveSelectedOption({ label: 'Female' });
  });

});
