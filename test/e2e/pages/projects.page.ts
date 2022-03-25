import { expect, Locator, Page } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly pageName: Locator;
  readonly projectsList: Locator;
  readonly projectNames: Locator;
  readonly createButton: Locator;
  static readonly url: string = '/app/projects';

  constructor(page: Page) {
    this.page = page;
    this.pageName = page.locator('.page-name >> text=My Projects');
    this.createButton = page.locator('button:has-text("Start or Join a New Project")');
    this.projectsList = page.locator('[data-ng-repeat="project in visibleProjects"]');
    this.projectNames = this.projectsList.locator('a[href^="/app/lexicon"]');
  }

  async goto() {
    await this.page.goto(ProjectsPage.url);
    await expect(this.pageName).toBeVisible();
  }

  async findProject(projectName: string) {
    const projects = this.page.locator('[search="$ctrl.queryProjectsForUser()"]');
    for (let i = 0; i < await projects.count(); i++) {
      let project = await projects.nth(i).innerText();
      console.log(project);

    }
  }
/*
  findProject1(projectName: string) {
    let foundRow: any;
    const result = protractor.promise.defer();
    const searchName = new RegExp(projectName);
    this.projectsList.map((row: any) => {
      row.getText().then((text: string) => {
        if (searchName.test(text)) {
          foundRow = row;
        }
      });
    }).then(() => {
      if (foundRow) {
        result.fulfill(foundRow);
      } else {
        result.reject('Project ' + projectName + ' not found.');
      }
    });

    return result.promise;
  }

  async clickOnProject(projectName:string) {
    return this.findProject(projectName).then((projectRow: any) => {
      const projectLink = projectRow.element(by.css('a'));
      projectLink.getAttribute('href').then((url: string) => {
        browser.get(url);
      });
    });
 } */
}
