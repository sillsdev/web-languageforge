import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { ProjectsPage } from './pages/projects.page';
import { Project } from './projects-settings.spec';
import { UserManagementPage } from './pages/user-management.page';

import { initTestProject } from './utils/testSetup';


test.describe('E2E User Management App', () => {
  let userManagementPageAdmin: UserManagementPage;
  let userManagementPageManager: UserManagementPage;

  const projects: Project[] = [
    {
      name: 'user-management_spec_ts Project 01',
      code: 'p01_user-management_spec_ts__project_01',
      id: ''
    },
  ];

  test.beforeAll(async ({ request, manager, adminTab, managerTab, member }) => {
    userManagementPageAdmin = new UserManagementPage(adminTab);
    userManagementPageManager = new UserManagementPage(managerTab);
    projects[0].id = await initTestProject(request, projects[0].code, projects[0].name, manager.username, [member.username]);
  });

  // TOASK: why does is not display owner?
  test.skip('generating', async ({ managerTab }) => {
    await userManagementPageAdmin.goto(projects[0].id);
    await userManagementPageAdmin.page.pause();
    // const userManagementPage = new UserManagementPage(managerTab);
    // await userManagementPage.goto(projects[0].id);
    // await userManagementPage.page.pause();
  });


  test('Can add admin as Tech Support', async ({ admin }) => {
    const projectsPage = new ProjectsPage(userManagementPageAdmin.page);
    await (await projectsPage.projectAddTechSupportButtonLocator(projects[0].name)).click();
    expect(await userManagementPageAdmin.getUserRow(projects[0].id, admin.username)).not.toBeUndefined();
    expect(await userManagementPageAdmin.getUserRole(projects[0].id, admin.username)).toBe('Tech Support');
  });

  test('Project manager cannot assign Tech Support user\'s role', async ({ admin }) => {
    expect(await userManagementPageManager.getUserRole(projects[0].id, admin.username)).toBe('Tech Support');
    await expect(await userManagementPageManager.getRoleSelectLocator(projects[0].id, admin.username)).toBeDisabled();
  });

  test('Tech Support user can assign their own role', async ({ admin }) => {
    await userManagementPageAdmin.goto(projects[0].id);
    const roleSelect: Locator = await userManagementPageAdmin.getRoleSelectLocator(projects[0].id, admin.username);
    await roleSelect.selectOption('Manager');

    // Now verify
    expect(await userManagementPageAdmin.getUserRole(projects[0].id, admin.username)).toBe('Manager');
  });


  test('Project manager cannot assign member to Tech Support role', async ({ member }) => {
    const roleSelect: Locator = await userManagementPageManager.getRoleSelectLocator(projects[0].id, member.username);
    const options: Locator = roleSelect.locator('option');
    const expectedOptions: string[] = ['Manager', 'Contributor', 'Observer', 'Observer with comment'];

    for (let i = 0; i < await options.count(); i++) {
      let option = await options.nth(i).innerText();
      console.log(option);
      expect(option in expectedOptions).toBe(true);
    }
  });
});
