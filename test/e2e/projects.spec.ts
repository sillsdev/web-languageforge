import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { ProjectsPage } from './pages/projects.page';
import { Project } from './projects-settings.spec';

import { initTestProject, addUserToProject } from './utils/testSetup';
import { gotoProjectDirectly } from './utils/navigation';


// import {EditorPage} from '../languageforge/lexicon/shared/editor.page';
// import {BellowsLoginPage} from './shared/login.page';

test.describe('E2E Projects List app', () => {
  // const constants = require('../testConstants.json');
  let projectsPageMember: ProjectsPage;
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

  // const editorPage = new EditorPage();
  // const projectNameLabel = element(by.className('page-name ng-binding'));
  // let projectsPage: ProjectsPage;

  test.beforeAll(async ({ request, member, manager, memberTab, admin }) => {
    projectsPageMember = new ProjectsPage(memberTab);

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

  // // Two helper functions to avoid duplicating the same checks in admin test below
  // const shouldProjectBeLinked = async (projectName: string, projectRow: ElementFinder, bool: boolean) => {
  //   expect<any>(await projectRow.element(by.cssContainingText('a', projectName)).isDisplayed()).toBe(bool);
  // };

  // const shouldProjectHaveButtons = async (projectRow: ElementFinder, bool: boolean) => {
  //   const addAsTechSupportBtn = projectRow.element(by.id('techSupportButton'));
  //   expect<any>(await addAsTechSupportBtn.isDisplayed()).toBe(bool);
  // };

  test.describe('for System Admin User', () => {
    let projectsPageAdmin: ProjectsPage;

    test.beforeAll(async ({ adminTab }) => {
      projectsPageAdmin = new ProjectsPage(adminTab);
    });

    test('Should list all projects', async () => {
      await projectsPageAdmin.goto();
      expect(await projectsPageAdmin.projectsList.count()).toBeGreaterThan(0);
      for (const project of projects) {
        expect(await projectsPageAdmin.findProject(project.name)).not.toMatch('-1');
      }

      // Check that the test project is around
      // return projectsPage.findProject(constants.testProjectName).then((projectRow: ElementFinder) => {
      //   return shouldProjectBeLinked(constants.testProjectName, projectRow, true);
      // });
    });

    // TOASK: is this test really useful?
    test('Should show add and delete buttons', async () => {
      await expect(projectsPageAdmin.createButton).toBeVisible();

      // // projectsPage.createBtn.getOuterHtml().then(console.log);
      // expect(await projectsPage.createBtn.isDisplayed()).toBeTruthy();
    });

    // demonstrating how one can access the names of all projects
    test.skip('admin', async () => {
      await projectsPageAdmin.goto();
      const nProjects = await projectsPageAdmin.projectNames.count();
      for (let i = 0; i < nProjects; i++) {
        console.log(i + " " + await projectsPageAdmin.projectNames.nth(i).locator('span').innerText());

      }
      await projectsPageAdmin.page.pause();
    });

    test('Should allow the admin to add themselves to the project as member or manager', async () => {
      await projectsPageAdmin.goto();
      // The admin should not see "Add myself to project" buttons when he's already a project member
      // or manager, and the project name should be a clickable link
      const project4LocatorString: string = await projectsPageAdmin.findProject(project4.name);
      // This attribute results in making the element clickable.
      await expect(projectsPageAdmin.page.locator(project4LocatorString + ' >> xpath=..')).toHaveAttribute('data-ng-show', '$ctrl.isInProject(project)');
      // not have tech support button TOASK: why does this not work?
      //await expect(projectsPageAdmin.page.locator(project4LocatorString + ' >> xpath=.. >> xpath=.. >> xpath=.. >> ' + projectsPageAdmin.addAsTechSupportBtnText)).not.toBeVisible();

      const project5LocatorString: string = await projectsPageAdmin.findProject(project5.name);
      // This attribute results in making the element not clickable. Playwright does not have a isClickable method
      await expect(projectsPageAdmin.page.locator(project5LocatorString)).toHaveAttribute('data-ng-show', '!$ctrl.isInProject(project)');
      // have tech support button
      await expect(projectsPageAdmin.page.locator(project5LocatorString + ' >> xpath=.. >> xpath=.. >> ' + projectsPageAdmin.addAsTechSupportBtnText)).toBeVisible();

      // add admin as tech support
      await projectsPageAdmin.page.locator(project5LocatorString + ' >> xpath=.. >> xpath=.. >> ' + projectsPageAdmin.addAsTechSupportBtnText).click();
      // not have tech support button any more
      await expect(projectsPageAdmin.page.locator(project5LocatorString + ' >> xpath=.. >> xpath=.. >> ' + projectsPageAdmin.addAsTechSupportBtnText)).not.toBeVisible();
      // project should now be clickable
      // TOASK: how to make this more comprehensible
      await expect(projectsPageAdmin.page.locator(project5LocatorString)).toBeHidden();
    });

    // test.describe('Lexicon E2E Project Access', () => {

    //   test('Admin added to project when accessing without membership', async () => {
    //     /* This test passes on my local machine.  It's a valid test.  However it fails on GHA for an unknown reason.
    //        I am going to comment out this test so that it is still present to be converted to Cyprus E2E when that happens
    //     await loginPage.loginAsManager();
    //     const url = await browser.getCurrentUrl();
    //     const projectName = await projectNameLabel.getText();
    //     await projectsPage.get();
    //     await browser.wait(ExpectedConditions.visibilityOf(projectsPage.createBtn), constants.conditionTimeout);
    //     await projectsPage.removeUserFromProject(projectName, constants.adminUsername);
    //     await loginPage.loginAsAdmin();
    //     await browser.get(url);
    //     await browser.wait(ExpectedConditions.visibilityOf(editorPage.editDiv), constants.conditionTimeout);
    //     expect<any>(await editorPage.editDiv.isPresent()).toBe(true);
    //     */
    //   });

    test('Admin added to project when accessing without membership', async () => {
      // this is already tested in a test above but makes the test more understandable
      await expect(await projectsPageAdmin.projectLinkLocator(projects[2].name)).not.toBeVisible();
      await gotoProjectDirectly(projectsPageAdmin.page, projects[2].id, projects[2].name);
      await projectsPageAdmin.goto();
      await expect(await projectsPageAdmin.projectLinkLocator(projects[2].name)).toBeVisible();
    });

    // });

  });
});
