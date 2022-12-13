import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { ProjectsPage } from './pages/projects.page';
import { NoticeElement } from './components/notice.component';

import { Project } from './utils/types';

import { initTestProject, addUserToProject } from './utils/testSetup';
import { EditorPage } from './pages/editor.page';


test.describe('Projects List', () => {
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
      const projectId = (await initTestProject(request, project.code, project.name, manager.username, [member.username])).id;
      project.id = projectId;
    }
    project4.id = (await initTestProject(request, project4.code, project4.name, manager.username, [admin.username])).id;
    project5.id = (await initTestProject(request, project5.code, project5.name, manager.username, [])).id;
  });

  test.describe('for Normal User', () => {

    test.beforeEach(async () => {
      await projectsPageMember.goto();
    });

    test('Should list projects of which the user is a member', async () => {
      for (const project of projects) {
        await expect(projectsPageMember.projectRow(project.name)).toBeVisible();
      }
    });

    test('Should not list projects the user is not a member of', async () => {
      await expect(projectsPageMember.projectRow(project4.name)).not.toBeVisible();
    });

    test('Project to which user is added shows up when page reloaded', async ({ request, member }) => {
      await expect(projectsPageMember.projectRow(project4.name)).not.toBeVisible();
      await addUserToProject(request, project4, member.username);
      await projectsPageMember.page.reload();
      await projectsPageMember.goto();
      await expect(projectsPageMember.projectRow(project4.name)).toBeVisible();
    });
  });


  test.describe('for System Admin User', () => {
    test.beforeEach(async () => {
      await projectsPageAdmin.goto();
    });

    test('Should list all projects', async () => {
      for (const project of [...projects, project4, project5]) {
        await expect(projectsPageAdmin.projectRow(project.name)).toBeVisible();
      }
      // only project4 where admin is a member should be linked
      for (const project of [...projects, project5]) {
        await expect(projectsPageAdmin.projectLink(project.name)).not.toBeVisible();
      }
      await expect(projectsPageAdmin.projectLink(project4.name)).toBeVisible();
    });

    test('Should allow admin to add him- or herself to the project as tech support if not already a manager', async () => {
      await expect(projectsPageAdmin.projectLink(project5.name)).not.toBeVisible();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project5.name)).toBeVisible();

      await projectsPageAdmin.projectAddTechSupportButtonLocator(project5.name).click();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project5.name)).not.toBeVisible();
    });


    test('Should allow admin (tech support) to remove him- or herself from a project' , async () => {
      await expect(projectsPageAdmin.projectLink(project4.name)).toBeVisible();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project4.name)).toBeVisible();

      await projectsPageAdmin.projectLeaveProjectButtonLocator(project4.name).click();

      const noticeElement = new NoticeElement(projectsPageAdmin.page);
      await expect(noticeElement.notice).toBeVisible();
      await expect(noticeElement.notice).toContainText(`${project4.name} is no longer in your projects.`);
      await expect(projectsPageAdmin.projectLeaveProjectButtonLocator(project4.name)).not.toBeVisible();
      await expect(projectsPageAdmin.projectLink(project4.name)).not.toBeVisible();

      // admin is no longer a contributor
      await expect(projectsPageAdmin.projectLink(project4.name)).not.toBeVisible();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project4.name)).toBeVisible();

    });

  });



  test.describe('Project Access', () => {

    test('Admin added to project when accessing without membership', async () => {
      // this is already tested in a test above but makes the test more understandable
      await expect(projectsPageAdmin.projectLink(projects[2].name)).not.toBeVisible();
      await new EditorPage(projectsPageAdmin.page, projects[2]).goto();
      await projectsPageAdmin.goto();
      await expect(projectsPageAdmin.projectLink(projects[2].name)).toBeVisible();
    });

    test('User redirected to projects app when accessing without membership', async ({ baseURL }) => {
      await projectsPageMember.page.goto('/app/lexicon/' + project5.id + '/#!/editor/list');
      // redirect
      await expect(projectsPageMember.createButton).toBeVisible();
      expect(projectsPageMember.page.url().startsWith(baseURL + projectsPageMember.url)).toBe(true);
    });

  });
});
