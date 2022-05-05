import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectsPage } from './pages/projects.page';
import { ProjectSettingsPage } from './pages/project-settings.page';


test.skip('Find Project', async ({ managerTab }) => {
  const projectsPage = new ProjectsPage(managerTab);
  await projectsPage.goto();
  //await projectsPage.page.pause();
  // await projectsPage.createEmptyProject('Test Project Exploration 01');
  // await projectsPage.findProject('Test Project Exploration 01');

  // await projectsPage.createEmptyProject('projects_spec_ts Project 02');
  //await projectsPage.addUserToProject('projects_spec_ts Project 02', 'test_runner_normal_user@example.com', 'can comment');
  const projectSettingsPage = new ProjectSettingsPage(managerTab);
  await projectSettingsPage.goto('projects_spec_ts Project 02');
  await projectSettingsPage.deleteProject();
});

// demonstrating how one can access the names of all projects
test.skip('example code', async ({ adminTab }) => {
  const projectsPageAdmin = new ProjectsPage(adminTab);
  //await projectsPageAdmin.goto();
  const nProjects = await projectsPageAdmin.projectNames.count();
  for (let i = 0; i < nProjects; i++) {
    console.log(i + " " + await projectsPageAdmin.projectNames.nth(i).locator('span').innerText());

  }
  console.log('ok \n');
  await projectsPageAdmin.countSpecificProjects('projects_spec_ts');

  await projectsPageAdmin.page.pause();
});
