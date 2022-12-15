import { expect } from '@playwright/test';
import { EditorPage } from './pages/editor.page';
import { ProjectSettingsPage } from './pages/project-settings.page';
import { ProjectsPage } from './pages/projects.page';
import { Project } from './utils';
import { test } from './utils/fixtures';
import { addUserToProject, initTestProject } from './utils/testSetup';
import { users } from './constants';

test.describe('Project Settings', () => {
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

  test.beforeAll(async ({ request }) => {
    for (const project of projects) {
      const projectId = (await initTestProject(request, project.code, project.name, users.admin, [users.member])).id;
      project.id = projectId;
    }
    await addUserToProject(request, projects[0], users.manager, 'manager');
    project4.id = (await initTestProject(request, project4.code, project4.name, users.manager, [])).id;
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
    await expect(projectSettingsPage.noticeList).toHaveCount(0);
    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
  });

  test('Manager cannot view delete tab if not owner', async ({ managerTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(managerTab, projects[0])
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.deleteTab.tabTitle).not.toBeVisible();
  });

  test('Manager can delete if owner', async ({managerTab}) => {
    const projectsPage = new ProjectsPage(managerTab);
    await projectsPage.goto();
    await expect(projectsPage.projectRow(project4.name)).toBeVisible();
    const projectSettingsPage = new ProjectSettingsPage(managerTab, project4);
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.noticeList).toHaveCount(0);

    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
    await projectSettingsPage.deleteTab.confirmDeleteInput.fill('delete');
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeEnabled();
    await projectSettingsPage.deleteTab.deleteProjectButton.click();
    await projectSettingsPage.deleteModal.confirm.click();

    await projectsPage.waitForPage();
    await expect(projectsPage.projectRow(project4.name)).not.toBeVisible();
  });

});
