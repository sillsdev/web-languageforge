"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const loginPage_js_1 = require("../../../bellows/pages/loginPage.js");
const projectsPage_js_1 = require("../../../bellows/pages/projectsPage.js");
const projectPage_js_1 = require("../pages/projectPage.js");
const questionPage_js_1 = require("../pages/questionPage.js");
const textPage_js_1 = require("../pages/textPage.js");
const textSettingsPage_js_1 = require("../pages/textSettingsPage.js");
const utils_js_1 = require("../../../bellows/pages/utils.js");
describe('the question page', () => {
    const constants = require('../../../testConstants.json');
    const loginPage = new loginPage_js_1.BellowsLoginPage();
    const util = new utils_js_1.Utils();
    const projectListPage = new projectsPage_js_1.ProjectsPage();
    const projectPage = new projectPage_js_1.SfProjectPage();
    const textPage = new textPage_js_1.SfTextPage();
    const textSettingsPage = new textSettingsPage_js_1.SfTextSettingsPage();
    const questionPage = new questionPage_js_1.SfQuestionPage();
    const CONDITION_TIMEOUT = 3000;
    describe('a normal user', () => {
        it('setup: login as normal user', () => {
            loginPage.loginAsMember();
            projectListPage.get();
            projectListPage.clickOnProject(constants.testProjectName);
            projectPage.textLink(constants.testText1Title).click();
            textPage.questionLink(constants.testText1Question1Title).click();
        });
        it('cannot edit question settings - NYI', () => {
        });
        it('cannot edit comment - NYI', () => {
        });
        it('cannot delete comment - NYI', () => {
        });
        it('cannot tag answer - NYI', () => {
        });
        it('cannot edit answer - NYI', () => {
        });
        it('cannot delete answer - NYI', () => {
        });
        it('cannot flag answer for export', () => {
            expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
            expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
        });
    });
    describe('a project manager', () => {
        it('setup: login as manager', () => {
            loginPage.loginAsManager();
            projectListPage.get();
            projectListPage.clickOnProject(constants.testProjectName);
            projectPage.textLink(constants.testText1Title).click();
            textPage.questionLink(constants.testText1Question1Title).click();
        });
        it('can edit question settings - NYI', () => {
        });
        it('can edit comment - NYI', () => {
        });
        it('can delete comment - NYI', () => {
        });
        it('can tag answer - NYI', () => {
        });
        it('can edit answer - NYI', () => {
        });
        it('can delete answer - NYI', () => {
        });
        it('can flag answer for export', () => {
            expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
            expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
            questionPage.answers.flags.lastButtonClear().click();
            expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
            expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
        });
        describe('paratext export of flagged answer', () => {
            it('setup: back to Text, click settings, click on tab', () => {
                // click on breadcrumb text title to go back one
                protractor_1.element(protractor_1.by.linkText(constants.testText1Title)).click();
                // click on text settings
                textPage.clickTextSettingsButton();
                textSettingsPage.tabs.paratextExport.click();
            });
            it('can prepare export for answers flagged for export without comments', () => {
                expect(textSettingsPage.paratextExportTab.exportAnswers.getAttribute('checked'))
                    .toBeTruthy();
                expect(textSettingsPage.paratextExportTab.exportComments.getAttribute('checked'))
                    .toBeFalsy();
                expect(textSettingsPage.paratextExportTab.exportFlagged.getAttribute('checked'))
                    .toBeTruthy();
                expect(textSettingsPage.paratextExportTab.prepareButton.isPresent()).toBe(true);
                textSettingsPage.paratextExportTab.prepareButton.click();
                protractor_1.browser.wait(protractor_1.ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount), CONDITION_TIMEOUT);
                expect(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
                expect(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
                expect(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(false);
                expect(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
            });
            it('can prepare export for answers flagged for export with comments', () => {
                textSettingsPage.paratextExportTab.exportComments.click();
                textSettingsPage.paratextExportTab.prepareButton.click();
                protractor_1.browser.wait(protractor_1.ExpectedConditions.visibilityOf(textSettingsPage.paratextExportTab.answerCount), CONDITION_TIMEOUT);
                expect(textSettingsPage.paratextExportTab.answerCount.isDisplayed()).toBe(true);
                expect(textSettingsPage.paratextExportTab.answerCount.getText()).toEqual('1');
                expect(textSettingsPage.paratextExportTab.commentCount.isDisplayed()).toBe(true);
                expect(textSettingsPage.paratextExportTab.commentCount.getText()).toEqual('1');
                expect(textSettingsPage.paratextExportTab.downloadButton.isDisplayed()).toBe(true);
            });
        });
    });
    describe('a system admin', () => {
        it('setup: login as admin', () => {
            loginPage.loginAsAdmin();
            projectListPage.get();
            projectListPage.clickOnProject(constants.testProjectName);
            projectPage.textLink(constants.testText1Title).click();
            textPage.questionLink(constants.testText1Question1Title).click();
        });
        it('can edit question settings - NYI', () => {
        });
        it('can edit comment - NYI', () => {
        });
        it('can delete comment - NYI', () => {
        });
        it('can tag answer - NYI', () => {
        });
        it('can edit answer - NYI', () => {
        });
        it('can delete answer - NYI', () => {
        });
        it('can flag answer for export', () => {
            expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBe(true);
            expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBeFalsy();
            questionPage.answers.flags.lastButtonSet().click();
            expect(questionPage.answers.flags.lastButtonSet().isDisplayed()).toBeFalsy();
            expect(questionPage.answers.flags.lastButtonClear().isDisplayed()).toBe(true);
        });
    });
});
//# sourceMappingURL=question.spec.js.map