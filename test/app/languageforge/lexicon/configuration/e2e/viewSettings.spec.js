'use strict';

describe('View settings page', function () {
  var constants    = require('../../../../testConstants');
  var loginPage    = require('../../../../bellows/pages/loginPage.js');
  var projectsPage = require('../../../../bellows/pages/projectsPage.js');
  var util         = require('../../../../bellows/pages/util.js');
  var editorPage       = require('../../pages/editorPage.js');
  var viewSettingsPage = require('../../pages/viewSettingsPage.js');

  it('setup: login, click on test project, go to the View Settings page', function () {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    viewSettingsPage.get();
  });

  it('setup: click Manager tab', function () {
    viewSettingsPage.getTabByName('Manager').click();
  });

  it('Hide Semantic Domain field for Manager', function () {
    expect(viewSettingsPage.getFieldByNameIconClass('Semantic Domain')).toMatch('icon-eye-open');
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, false);
    expect(viewSettingsPage.getFieldByNameIconClass('Semantic Domain'))
      .not.toMatch('icon-eye-open');
    viewSettingsPage.applyButton.click();
  });

  it('Hide Semantic Domain field for specific username of admin user', function () {
    viewSettingsPage.getTabByName('Member Specific').click();
    viewSettingsPage.addViewSettingsForMember(constants.adminUsername);
    viewSettingsPage.pickMemberWithViewSettings(constants.adminUsername);
    expect(viewSettingsPage.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, false);
    viewSettingsPage.applyButton.click();
  });

  it('Semantic Domain field is hidden for Manager', function () {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.getFields('Semantic Domain').count()).toBe(0);
  });

  it('Semantic Domain field is visible for Member', function () {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
  });

  it('Semantic Domain field is hidden for admin user', function () {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(editorPage.edit.getFields('Semantic Domain').count()).toBe(0);
  });

  it('Return view settings to normal before next test', function () {
    viewSettingsPage.get();
    viewSettingsPage.getTabByName('Member Specific').click();
    viewSettingsPage.pickMemberWithViewSettings(constants.adminUsername);
    expect(viewSettingsPage.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, true);
    viewSettingsPage.applyButton.click();
    viewSettingsPage.getTabByName('Manager').click();
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, true);
    viewSettingsPage.applyButton.click();
  });
});
