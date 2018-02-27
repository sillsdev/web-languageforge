"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protractor_1 = require("protractor");
const loginPage_1 = require("../../../../bellows/pages/loginPage");
const projectsPage_1 = require("../../../../bellows/pages/projectsPage");
const editorPage_1 = require("../../pages/editorPage");
const loginPage = new loginPage_1.BellowsLoginPage();
const projectsPage = new projectsPage_1.ProjectsPage();
const editorPage = new editorPage_1.EditorPage();
const constants = require('../../../../testConstants');
const CONDITION_TIMEOUT = 3000;
describe('Editor Comments', () => {
    it('setup: login, click on test project', () => {
        loginPage.loginAsManager();
        projectsPage.get();
        projectsPage.clickOnProject(constants.testProjectName);
    });
    it('browse page has correct word count', () => {
        // flaky assertion, also test/app/languageforge/lexicon/editor/e2e/editor-entry.spec.js:20
        expect(editorPage.browse.entriesList.count()).toEqual(editorPage.browse.getEntryCount());
        expect(editorPage.browse.getEntryCount()).toBe(3);
    });
    it('click on first word', () => {
        editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    });
    it('switch to comments page, add one comment', () => {
        editorPage.edit.toCommentsLink.click();
        editorPage.comment.newComment.textarea.sendKeys('First comment on this word.');
        editorPage.comment.newComment.postBtn.click();
    });
    it('comments page: check that comment shows up', () => {
        var comment = editorPage.comment.getComment(0);
        expect(comment.wholeComment.isPresent()).toBe(true);
        // Earlier tests modify the avatar and name of the manager user; don't check those
        //expect<any>(comment.avatar.getAttribute('src')).toContain(constants.avatar);
        //expect<any>(comment.author.getText()).toEqual(constants.managerName);
        expect(comment.score.getText()).toEqual('0');
        expect(comment.plusOne.isPresent()).toBe(true);
        expect(comment.content.getText()).toEqual('First comment on this word.');
        expect(comment.date.getText()).toMatch(/ago|in a few seconds/);
        // This comment should have no "regarding" section
        expect(comment.regarding.fieldLabel.isDisplayed()).toBe(false);
    });
    it('comments page: add comment about a specific part of the entry', () => {
        editorPage.comment.newComment.textarea.clear();
        editorPage.comment.newComment.textarea.sendKeys('Second comment.');
        editorPage.comment.entry.getOneFieldAllInputSystems('Word').first().click();
        editorPage.comment.newComment.postBtn.click();
    });
    it('comments page: check that second comment shows up', () => {
        var comment = editorPage.comment.getComment(-1);
        expect(comment.wholeComment.isPresent()).toBe(true);
        // Earlier tests modify the avatar and name of the manager user; don't check those
        //expect<any>(comment.avatar.getAttribute('src')).toContain(constants.avatar);
        //expect<any>(comment.author.getText()).toEqual(constants.managerName);
        expect(comment.score.getText()).toEqual('0');
        expect(comment.plusOne.isPresent()).toBe(true);
        expect(comment.content.getText()).toEqual('Second comment.');
        expect(comment.date.getText()).toMatch(/ago|in a few seconds/);
        // This comment should have a "regarding" section
        expect(comment.regarding.fieldLabel.isDisplayed()).toBe(true);
        var word = constants.testEntry1.lexeme.th.value;
        var definition = constants.testEntry1.senses[0].definition.en.value;
        expect(comment.regarding.word.getText()).toEqual(word);
        expect(comment.regarding.definition.getText()).toEqual(definition);
        expect(comment.regarding.fieldLabel.getText()).toEqual('Word');
        expect(comment.regarding.fieldWsid.getText()).toEqual('th');
        expect(comment.regarding.fieldValue.getText()).toEqual(word);
    });
    it('comments page: click +1 button on first comment', () => {
        var comment = editorPage.comment.getComment(0);
        expect(comment.plusOne.getAttribute('data-ng-click')).not.toBe(null); // Should be clickable
        comment.plusOne.click();
        expect(comment.score.getText()).toEqual('1');
    });
    it('comments page: +1 button disabled after clicking', () => {
        var comment = editorPage.comment.getComment(0);
        expect(comment.plusOne.getAttribute('data-ng-click')).toBe(null); // Should NOT be clickable
        comment.plusOne.click();
        expect(comment.score.getText()).toEqual('1'); // Should not change from previous test
    });
    it('comments page: refresh returns to comment', () => {
        var comment = editorPage.comment.getComment(0);
        protractor_1.browser.refresh();
        protractor_1.browser.wait(protractor_1.ExpectedConditions.visibilityOf(comment.content), CONDITION_TIMEOUT);
        expect(comment.content.getText()).toEqual('First comment on this word.');
    });
});
//# sourceMappingURL=editor-comments.spec.js.map