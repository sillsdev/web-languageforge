import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectSettingsPage } from './pages/project-settings.page';
import { initTestProject, addUserToProject } from './utils/testSetup';
import { ProjectsPage } from './pages/projects.page';

import { Project } from './utils/types';
import { EditorPage } from './pages/editor.page';

test.describe('E2E Project Settings app', () => {
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

  test.beforeAll(async ({ request, admin, member, manager }) => {
    for (const project of projects) {
      const projectId = (await initTestProject(request, project.code, project.name, admin.username, [member.username])).id;
      project.id = projectId;
    }
    await addUserToProject(request, projects[0].code, manager.username, 'manager');
    project4.id = (await initTestProject(request, project4.code, project4.name, manager.username, [])).id;
  });

  // test if can change project name
  test('Normal user cannot access projectSettings to a project of which the user is a member', async ({ memberTab }) => {
    const editorPage = new EditorPage(memberTab, projects[0]);
    await editorPage.goto();
    await expect(editorPage.settingsMenuLink).not.toBeVisible();
  });

  test('Project member can navigate from editor to settings', async({ managerTab }) => {
    const editorPage = new EditorPage(managerTab, projects[0]);
    await editorPage.goto();
    const projectSettingsPage = await editorPage.navigateToProjectSettings();
    await expect(projectSettingsPage.projectTab.tabTitle).toBeVisible();
  });

  test('Project owner can manage project they own', async ({ adminTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(adminTab, projects[0]);
    await projectSettingsPage.goto();
    expect(await projectSettingsPage.noticeList.count()).toBe(0);
    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
  });

  test('Manager cannot view delete tab if not owner', async ({ admin, manager, managerTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(managerTab, projects[0])
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.deleteTab.tabTitle).not.toBeVisible();
  });

  test('Manager can delete if owner', async ({managerTab}) => {
    const projectsPage = new ProjectsPage(managerTab);
    await projectsPage.goto();
    expect(await projectsPage.hasProject(project4.name)).toBe(true);
    const projectSettingsPage = new ProjectSettingsPage(managerTab, project4);
    await projectSettingsPage.goto();
    expect(await projectSettingsPage.countNotices()).toBe(0);

    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
    await projectSettingsPage.deleteTab.confirmDeleteInput.fill('delete');
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeEnabled();
    await projectSettingsPage.deleteTab.deleteProjectButton.click();
    await projectSettingsPage.deleteModal.confirm.click();

    await projectsPage.waitForPage();
    expect(await projectsPage.hasProject(project4.name)).toBe(false);
  });

});
