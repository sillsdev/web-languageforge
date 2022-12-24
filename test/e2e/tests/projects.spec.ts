import { expect } from '@playwright/test';
import { users } from '../constants';
import { test } from '../fixtures';
import { EditorPage, ProjectsPage } from '../pages';
import { Project } from '../utils';

test.describe('Projects List', () => {

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

  test.beforeAll(async ({ projectService }) => {
    for (const project of projects) {
      const projectId = (await projectService.initTestProject(project.name, project.code, users.manager, [users.member])).id;
      project.id = projectId;
    }
    project4.id = (await projectService.initTestProject(project4.name, project4.code, users.manager, [users.admin])).id;
    project5.id = (await projectService.initTestProject(project5.name, project5.code, users.manager, [])).id;
  });

  test.describe('for Normal User', () => {

    let projectsPageMember: ProjectsPage;

    test.beforeEach(async ({ memberTab }) => {
      projectsPageMember = await ProjectsPage.goto(memberTab);
    });

    test('Should list projects of which the user is a member', async () => {
      for (const project of projects) {
        await expect(projectsPageMember.projectRow(project.name)).toBeVisible();
      }
    });

    test('Should not list projects the user is not a member of', async () => {
      await expect(projectsPageMember.projectRow(project4.name)).not.toBeVisible();
    });

    test('Project to which user is added shows up when page reloaded', async ({ projectService }) => {
      await expect(projectsPageMember.projectRow(project4.name)).not.toBeVisible();
      await projectService.addUserToProject(project4, users.member);
      await projectsPageMember.page.reload();
      await projectsPageMember.goto();
      await expect(projectsPageMember.projectRow(project4.name)).toBeVisible();
    });
  });

  test.describe('for System Admin User', () => {

    let projectsPageAdmin: ProjectsPage;

    test.beforeEach(async ({ adminTab }) => {
      projectsPageAdmin = await ProjectsPage.goto(adminTab);
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


    test('Should allow admin (tech support) to remove him- or herself from a project', async () => {
      await expect(projectsPageAdmin.projectLink(project4.name)).toBeVisible();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project4.name)).toBeVisible();

      await projectsPageAdmin.projectLeaveProjectButtonLocator(project4.name).click();

      const noticeElement = projectsPageAdmin.noticeList;
      await expect(noticeElement.notices).toBeVisible();
      await expect(noticeElement.notices).toContainText(`${project4.name} is no longer in your projects.`);
      await expect(projectsPageAdmin.projectLeaveProjectButtonLocator(project4.name)).not.toBeVisible();
      await expect(projectsPageAdmin.projectLink(project4.name)).not.toBeVisible();

      // admin is no longer a contributor
      await expect(projectsPageAdmin.projectLink(project4.name)).not.toBeVisible();
      await expect(projectsPageAdmin.projectAddTechSupportButtonLocator(project4.name)).toBeVisible();

    });

  });

  test.describe('Project Access', () => {

    test('Admin added to project when accessing without membership', async ({ adminTab }) => {
      const projectsPageAdmin = await new ProjectsPage(adminTab).goto();
      // this is already tested in a test above but makes the test more understandable
      await expect(projectsPageAdmin.projectLink(projects[2].name)).not.toBeVisible();
      await new EditorPage(projectsPageAdmin.page, projects[2]).goto();
      await projectsPageAdmin.goto();
      await expect(projectsPageAdmin.projectLink(projects[2].name)).toBeVisible();
    });

    test('User redirected to projects app when accessing without membership', async ({ memberTab }) => {
      await Promise.all([
        memberTab.goto('/app/lexicon/' + project5.id + '/#!/editor/list'),
        new ProjectsPage(memberTab).waitFor(),
      ]);
    });

  });
});
