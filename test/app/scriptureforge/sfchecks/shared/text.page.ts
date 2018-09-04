import {browser, by, element, ExpectedConditions} from 'protractor';

import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {SfProjectPage} from './project.page';

export class SfTextPage {
  private readonly utils = new Utils();
  private readonly projectsPage = new ProjectsPage();

  notice = this.utils.notice;

  async get(projectName: any, textTitle: any) {
    await this.projectsPage.get();
    await this.projectsPage.clickOnProject(projectName);
    await SfProjectPage.textLink(textTitle).click();
  }

  archiveButton = element(by.id('questions-archive-btn'));
  makeTemplateBtn = element(by.id('questions-make-template-btn'));
  addNewBtn = element(by.id('questions-add-new-btn'));
  textSettingsBtn = element(by.id('questions-text-settings-btn'));

  static async clickTextSettingsButton() {
    await element(by.id('questions-text-settings-btn')).click();
    await element(by.id('questions-text-settings-link')).click();
  }

  static questionLink(title: any) {
    return element(by.linkText(title));
  }

  static clickOnQuestion(questionTitle: any) {
    element(by.linkText(questionTitle)).click();
  }

  questionNames = element.all(by.repeater('question in visibleQuestions')
    .column('{{question.calculatedTitle}}'));
  questionRows  = element.all(by.repeater('question in visibleQuestions'));

  // getFirstCheckbox has to be a function because the .first() method will actually resolve the finder
  getFirstCheckbox() {
    return this.questionRows.first().element(by.css('input[type="checkbox"]'));
  }

  newQuestion = {
    showFormButton: element(by.id('questions-add-new-btn')),
    form: element(by.id('questions-new-question-form')),
    description: element(by.model('questionDescription')),
    summary: element(by.model('questionTitle')),
    saveButton: element(by.id('questions-save-question-btn'))
  };

  async addNewQuestion(description: any, summary: any) {
    await this.newQuestion.showFormButton.click();
    await browser.wait(ExpectedConditions.visibilityOf(this.newQuestion.description), Utils.conditionTimeout);
    await this.newQuestion.description.sendKeys(description);
    await this.newQuestion.summary.sendKeys(summary);
    await this.newQuestion.saveButton.click();
  }

  //noinspection JSUnusedGlobalSymbols
  async printQuestionNames() {
    await this.questionNames.each(async (names: any) => {
      await names.getText().then(console.log);
    });
  }

  textContent = element(by.id('textcontrol'));
}
