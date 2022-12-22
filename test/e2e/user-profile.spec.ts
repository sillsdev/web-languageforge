import { expect, Page } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProjectsPage } from './pages/projects.page';
import { UserProfilePage } from './pages/user-profile.page';
import { login, UserDetails } from './utils';
import { test } from './utils/fixtures';

test.describe.fixme('User Profile', () => {

  test('Generated user account and about me info', async ({ page, userService }) => {
    const user = await userService.createRandomUser();
    await login(page, user);

    const userProfilePage = await new UserProfilePage(page).goto();

    await expect(userProfilePage.accountTab.emailField).toHaveValue(user.email);
    await expect(userProfilePage.accountTab.usernameField).toHaveValue(user.username);

    await userProfilePage.tabs.aboutMe.click();

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(user.name);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue('');
  });


  test('Update user account info', async ({ page, userService }) => {
    const user = await userService.createRandomUser();
    await login(page, user);

    const userProfilePage = new UserProfilePage(page);
    await userProfilePage.goto();

    const newEmail = `newemail-fun-fun-fun@example.com`;
    await userProfilePage.accountTab.emailField.fill(newEmail);
    await userProfilePage.accountTab.colorField.selectOption({ label: 'Steel Blue' });
    await userProfilePage.accountTab.animalField.selectOption({ label: 'Otter' });

    await userProfilePage.saveBtn.click();
    await Promise.all([
      userProfilePage.page.reload(),
      userProfilePage.waitForPage(),
    ]);

    await expect(userProfilePage.accountTab.emailField).toHaveValue(newEmail);
    await expect(userProfilePage.accountTab.colorField).toHaveSelectedOption({ label: 'Steel Blue' });
    await expect(userProfilePage.accountTab.animalField).toHaveSelectedOption({ label: 'Otter' });
  });

  test('Update username and re-login', async ({ page, userService }) => {
    const user = await userService.createRandomUser();
    await login(page, user);

    const currUsername = user.username;
    const newUsername = `${user.username}-new`;

    await changeUsernameAndLogin(newUsername, user, page);
    const newDetails = { ...user, username: newUsername };
    await changeUsernameAndLogin(currUsername, newDetails, page);
  });

  const changeUsernameAndLogin = async (newUsername: string, currDetails: UserDetails, tab: Page): Promise<void> => {
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
      loginPage.login({
        ...currDetails,
        username: newUsername,
      }),
      new ProjectsPage(tab).waitForPage(),
    ]);
  };

  test('Update user about me info', async ({ page, userService }) => {
    const user = await userService.createRandomUser();
    await login(page, user);

    const userProfilePage = new UserProfilePage(page);
    await userProfilePage.goto();
    await userProfilePage.tabs.aboutMe.click();

    const newName = `New name`;
    await userProfilePage.aboutMeTab.nameField.fill(newName);
    const newAge = '25';
    await userProfilePage.aboutMeTab.ageField.fill(newAge);
    await userProfilePage.aboutMeTab.genderField.selectOption({ label: 'Female' });

    await userProfilePage.saveBtn.click();
    await userProfilePage.reload();

    await expect(userProfilePage.aboutMeTab.nameField).toHaveValue(newName);
    await expect(userProfilePage.aboutMeTab.ageField).toHaveValue(newAge);
    await expect(userProfilePage.aboutMeTab.genderField).toHaveSelectedOption({ label: 'Female' });
  });

});
