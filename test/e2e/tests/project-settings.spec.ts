import { expect } from '@playwright/test';
import { users } from '../constants';
import { test } from '../fixtures';
import { EditorPage, ProjectSettingsPage, ProjectsPage } from '../pages';
import { Project } from '../utils';

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

  test.beforeAll(async ({ projectService }) => {
    for (const project of projects) {
      const projectId = (await projectService.initTestProject(project.name, project.code, users.admin, [users.member])).id;
      project.id = projectId;
    }
    await projectService.addUserToProject(projects[0], users.manager, 'manager');
    project4.id = (await projectService.initTestProject(project4.name, project4.code, users.manager, [])).id;
  });

  // test if can change project name
  test('Normal user cannot access projectSettings to a project of which the user is a member', async ({ memberTab }) => {
    const editorPage = new EditorPage(memberTab, projects[0]);
    await editorPage.goto();
    await expect(editorPage.settingsMenuLink).not.toBeVisible();
  });

  test('Project member can navigate from editor to settings', async ({ managerTab }) => {
    const editorPage = new EditorPage(managerTab, projects[0]);
    await editorPage.goto();
    const projectSettingsPage = await editorPage.navigateToProjectSettings();
    await expect(projectSettingsPage.projectTab.tabTitle).toBeVisible();
  });

  test('Project owner can manage project they own', async ({ adminTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(adminTab, projects[0]);
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.noticeList.notices).toHaveCount(0);
    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
  });

  test('Manager cannot view delete tab if not owner', async ({ managerTab }) => {
    const projectSettingsPage = new ProjectSettingsPage(managerTab, projects[0])
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.deleteTab.tabTitle).not.toBeVisible();
  });

  test('Manager can delete if owner', async ({ managerTab }) => {
    const projectsPage = new ProjectsPage(managerTab);
    await projectsPage.goto();
    await expect(projectsPage.projectRow(project4.name)).toBeVisible();
    const projectSettingsPage = new ProjectSettingsPage(managerTab, project4);
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.noticeList.notices).toHaveCount(0);

    await projectSettingsPage.deleteTab.tabTitle.click();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeVisible();
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeDisabled();
    await projectSettingsPage.deleteTab.confirmDeleteInput.fill('delete');
    await expect(projectSettingsPage.deleteTab.deleteProjectButton).toBeEnabled();
    await projectSettingsPage.deleteTab.deleteProjectButton.click();
    await projectSettingsPage.deleteModal.confirm.click();

    await projectsPage.waitFor();
    await expect(projectsPage.projectRow(project4.name)).not.toBeVisible();
  });

});
