import { browser, by, element, ExpectedConditions} from 'protractor';
import { Utils } from '../../../bellows/pages/utils.js'
import { ProjectsPage } from '../../../bellows/pages/projectsPage.js';
import { SfProjectPage } from '../../sfchecks/pages/projectPage.js';

const CONDITION_TIMEOUT = 3000;
const utils = new Utils();
const projectsPage = new ProjectsPage();
const projectPage = new SfProjectPage();

export class SfTextPage {
  notice = utils.notice;

  get(projectName: any, textTitle: any) {
    projectsPage.get();
    projectsPage.clickOnProject(projectName);
    projectPage.textLink(textTitle).click();
  }

  archiveButton = element(by.id('questions-archive-btn'));
  makeTemplateBtn = element(by.id('questions-make-template-btn'));
  addNewBtn = element(by.id('questions-add-new-btn'));
  textSettingsBtn = element(by.id('questions-text-settings-btn'));

  clickTextSettingsButton() {
    element(by.id('questions-text-settings-btn')).click();
    element(by.id('questions-text-settings-link')).click();
  }

  questionLink(title: any) {
    return element(by.linkText(title));
  }

  clickOnQuestion(questionTitle: any) {
    element(by.linkText(questionTitle)).click();
  }

  questionNames = element.all(by.repeater('question in visibleQuestions')
    .column('{{question.calculatedTitle}}'));
  questionRows  = element.all(by.repeater('question in visibleQuestions'));

  //noinspection JSUnusedGlobalSymbols
  //this.questionText = element(by.model('questionDescription'));

  //noinspection JSUnusedGlobalSymbols
  //this.questionSummary = element(by.model('questionTitle'));

  //noinspection JSUnusedGlobalSymbols
  //this.saveQuestion = element(by.partialButtonText('Save'));

  // getFirstCheckbox has to be a function because the .first() method will actually resolve the
  // finder
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

  addNewQuestion(description: any, summary: any) {
    this.newQuestion.showFormButton.click();
    browser.wait(ExpectedConditions.visibilityOf(this.newQuestion.description), CONDITION_TIMEOUT);
    this.newQuestion.description.sendKeys(description);
    this.newQuestion.summary.sendKeys(summary);
    this.newQuestion.saveButton.click();
  }

  //noinspection JSUnusedGlobalSymbols
  printQuestionNames() {
    this.questionNames.each( (names: any) => {
      names.getText().then(console.log);
    });
  }

  textContent = element(by.id('textcontrol'));
}
