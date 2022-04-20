import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectSettingsPage } from './pages/project-settings.page';
import { initTestProject, addUserToProject } from './utils/testSetup';
import { ProjectsPage } from './pages/projects.page';


export type Project = {
  name: string,
  code: string,
  id: string
}

test.describe('E2E Project Settings app', () => {
  let projectSettingsPageManager: ProjectSettingsPage;
  const projects: Project[] = [
    {
      name: 'projects_settings_spec_ts Project 01',
      code: 'p01_projects_settings_spec_ts__project_01',
      id: ''
    },
    {
      name: 'projects_settings_spec_ts Project 02',
      code: 'p02_projects_settings_spec_ts__project_02',
      id: ''
    },
    {
      name: 'projects_settings_spec_ts Project 03',
      code: 'p03_projects_settings_spec_ts__project_03',
      id: ''
    },
  ];
  const project4: Project = {
    name: 'projects_settings_spec_ts Project 04',
    code: 'p04_projects_settings_spec_ts__project_04',
    id: ''
  };

  test.beforeAll(async ({ request, admin, member, manager, managerTab }) => {
    projectSettingsPageManager = new ProjectSettingsPage(managerTab);
    // Do this
    for (const project of projects) {
      const projectId = await initTestProject(request, project.code, project.name, admin.username, [member.username]);
      project.id = projectId;
    }
    await addUserToProject(request, projects[0].code, manager.username, 'manager');
    project4.id = await initTestProject(request, project4.code, project4.name, manager.username, []);
    // instead of this:
    // const projectSettingsPage: ProjectSettingsPage = new ProjectSettingsPage(managerTab);
    // console.log(await projectSettingsPage.projectsPage.findProject(projects[0].name));

    // if (await projectSettingsPage.projectsPage.findProject(projects[0].name) != '-1') {
    //   await projectSettingsPage.goto(projects[0].name);
    //   await projectSettingsPage.deleteProject();
    // }
    // await projectSettingsPage.projectsPage.createEmptyProject(projects[0].name);
    // await projectSettingsPage.projectsPage.addUserToProject(projects[0].name, 'test_runner_normal_user@example.com', 'can comment');
  });


  // test if can change project name

  test('Normal user cannot access projectSettings to a project of which the user is a member', async ({ memberTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(memberTab);
    await projectSettingsPage.gotoProjectDirectly(projects[0].id, projects[0].name);
    await expect (projectSettingsPage.settingsMenuLink).not.toBeVisible();
  });

  // original name: System Admin can manage project
  // alternative suggestion: System Admin can manage project
  test('Project Owner can manage project they own', async ({ adminTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(adminTab);
    await projectSettingsPage.gotoProjectSettingsDirectly(projects[0].id, projects[0].name);
    expect(await projectSettingsPage.noticeList.count()).toBe(0);
    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
  });

  //TOASK: is this test really needed?
  test('Confirm Manager is not owner of test project 0', async ({ manager }) => {
    await projectSettingsPageManager.gotoProjectSettingsDirectly(projects[0].id, projects[0].name);
    expect(await projectSettingsPageManager.projectTab.projectOwner.innerText()).not.toContain(manager.username);
  });

  test('Manager cannot view delete tab if not owner', async ({ manager }) => {
    await projectSettingsPageManager.gotoProjectSettingsDirectly(projects[0].id, projects[0].name);
    expect(await projectSettingsPageManager.projectTab.projectOwner.innerText()).not.toContain(manager.username);
    await expect(projectSettingsPageManager.deleteTab.tabTitle).not.toBeVisible();
  });

  // Alternative name: confirm name of owner is displayed in project settings
  test('Confirm Manager is owner of project 4', async ({ manager }) => {
    await projectSettingsPageManager.gotoProjectSettingsDirectly(project4.id, project4.name);
    await projectSettingsPageManager.projectTab.tabTitle.click();
    await expect(projectSettingsPageManager.projectTab.projectOwner).toBeVisible();
    expect(await projectSettingsPageManager.projectTab.projectOwner.innerText()).toContain(manager.username);
  });

  test('Manager can delete if owner', async () => {
    await projectSettingsPageManager.projectsPage.goto();
    const nProjects = await projectSettingsPageManager.projectsPage.countProjects();
    await projectSettingsPageManager.gotoProjectSettingsDirectly(project4.id, project4.name);
    expect(await projectSettingsPageManager.countNotices()).toBe(0);

    await projectSettingsPageManager.deleteTab.tabTitle.click();
    await expect(projectSettingsPageManager.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPageManager.deleteTab.deleteProjectButton).toBeDisabled();
    await projectSettingsPageManager.deleteTab.confirmDeleteInput.fill('delete');
    await expect(projectSettingsPageManager.deleteTab.deleteProjectButton).toBeEnabled();
    await projectSettingsPageManager.deleteTab.deleteProjectButton.click();
    await projectSettingsPageManager.deleteModal.confirm.click();

    await projectSettingsPageManager.page.waitForNavigation({ url: ProjectsPage.url });
    //Or...
    // await projectSettingsPageManager.page.waitForNavigation({ waitUntil: 'networkidle' });

    expect(await projectSettingsPageManager.projectsPage.countProjects()).toBe(nProjects - 1);
  });


});
