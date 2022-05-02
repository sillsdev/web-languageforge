import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectsPage } from './pages/projects.page';
import { Project } from './projects-settings.spec';

import { initTestProject, addUserToProject } from './utils/testSetup';
import { gotoProjectDirectly } from './utils/navigation';

import { NoticeElement } from './components/notice.component';


test.describe('E2E Projects List app', () => {
  let projectsPageMember: ProjectsPage;
  let projectsPageAdmin: ProjectsPage;

  const projects: Project[] = [
    {
      name: 'projects_spec_ts Project 01',
      code: 'p01_projects_spec_ts__project_01',
      id: ''
    },
    {
      name: 'projects_spec_ts Project 02',
      code: 'p02_projects_spec_ts__project_02',
      id: ''
    },
    {
      name: 'projects_spec_ts Project 03',
      code: 'p03_projects_spec_ts__project_03',
      id: ''
    },
  ];
  const project4: Project = {
    name: 'projects_spec_ts Project 04',
    code: 'p04_projects_spec_ts__project_04',
    id: ''
  };
  const project5: Project = {
    name: 'projects_spec_ts Project 05',
    code: 'p05_projects_spec_ts__project_05',
    id: ''
  };

  test.beforeAll(async ({ request, member, manager, memberTab, admin, adminTab }) => {
    projectsPageMember = new ProjectsPage(memberTab);
    projectsPageAdmin = new ProjectsPage(adminTab);

    for (const project of projects) {
      const projectId = await initTestProject(request, project.code, project.name, manager.username, [member.username]);
      project.id = projectId;
    }
    project4.id = await initTestProject(request, project4.code, project4.name, manager.username, [admin.username]);
    project5.id = await initTestProject(request, project5.code, project5.name, manager.username, []);

  });

  test.describe('for Normal User', () => {

    test.beforeEach(async () => {
      await projectsPageMember.goto();
    });

    test('Should list projects of which the user is a member', async () => {
      for (const project of projects) {
        expect(await projectsPageMember.findProject(project.name)).not.toMatch('-1');
      }
    });

    test('Should not list projects the user is not a member of', async () => {
      expect(await projectsPageMember.findProject(project4.name)).toMatch('-1');
    });

    test('Project to which user is added shows up when page reloaded', async ({ request, member }) => {
      const nProjects = await projectsPageMember.countProjects();

      await addUserToProject(request, project4.code, member.username);
      await projectsPageMember.page.reload();
      await projectsPageMember.goto();
      expect(await projectsPageMember.countProjects()).toBe(nProjects + 1);
    });
  });


  test.describe('for System Admin User', () => {
    test.beforeEach(async () => {
      await projectsPageAdmin.goto();
    });

    test('Should list all projects', async () => {
      for (const project of [...projects, project4, project5]) {
        expect(await projectsPageAdmin.findProject(project.name)).not.toMatch('-1');
      }
      // only project4 where admin is a member should be linked
      for (const project of [...projects, project5]) {
        await expect(await projectsPageAdmin.projectLinkLocator(project.name)).not.toBeVisible();
      }
      await expect(await projectsPageAdmin.projectLinkLocator(project4.name)).toBeVisible();
    });

    test('Should allow admin to add him- or herself to the project as tech support if not already a manager', async () => {
      expect(await projectsPageAdmin.projectIsLinked(project5.name)).toBe(false);
      expect(await projectsPageAdmin.projectHasAddTechSupportButton(project5.name)).toBe(true);

      await (await projectsPageAdmin.projectAddTechSupportButtonLocator(project5.name)).click();

      const noticeElement = new NoticeElement(projectsPageAdmin.page);
      await expect(noticeElement.notice).toBeVisible();
      await expect(noticeElement.notice).toContainText(`You are now Tech Support for the '${project5.name}' project.`);
      await expect(await projectsPageAdmin.projectAddTechSupportButtonLocator(project5.name)).not.toBeVisible();
      await expect(await projectsPageAdmin.projectLinkLocator(project5.name)).toBeVisible();

      // admin is a contributor
      expect(await projectsPageAdmin.projectIsLinked(project4.name)).toBe(true);
      expect(await projectsPageAdmin.projectHasAddTechSupportButton(project4.name)).toBe(true);
    });
  });

  test.describe('Lexicon E2E Project Access', () => {

    test('Admin added to project when accessing without membership', async () => {
      // this is already tested in a test above but makes the test more understandable
      await expect(await projectsPageAdmin.projectLinkLocator(projects[2].name)).not.toBeVisible();
      await gotoProjectDirectly(projectsPageAdmin.page, projects[2].id, projects[2].name);
      await projectsPageAdmin.goto();
      await expect(await projectsPageAdmin.projectLinkLocator(projects[2].name)).toBeVisible();
    });

    test('User redirected to projects app when accessing without membership', async ({ baseURL }) => {
      await projectsPageMember.page.goto('/app/lexicon/' + project5.id + '/#!/editor/list');
      // redirect
      await expect(projectsPageMember.createButton).toBeVisible();
      expect(projectsPageMember.page.url().startsWith(baseURL + ProjectsPage.url)).toBe(true);
    });

  });
});
