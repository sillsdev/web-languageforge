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
    viewSettingsPage.clickTabByName('Manager');
  });

  it('Hide Semantic Domain field for Manager', function () {
    var vsp = viewSettingsPage;

    // Eye icon should be present if "Show field" is checked for that field
    vsp.getFieldByName('Semantic Domain').then(function (elem) {
      var icon = elem.$('i');
      expect(icon.getAttribute('class')).toMatch('icon-eye-open');
    });

    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, false);
    vsp.getFieldByName('Semantic Domain').then(function (elem) {
      var icon = elem.$('i');
      expect(icon.getAttribute('class')).not.toMatch('icon-eye-open');
    });

    vsp.applyBtn.click();
  });

  it('Hide Semantic Domain field for specific username of admin user', function () {
    var vsp = viewSettingsPage;
    vsp.clickTabByName('Member Specific');
    vsp.addViewSettingsForMember(constants.adminUsername);
    vsp.pickMemberWithViewSettings(constants.adminUsername);
    expect(vsp.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, false);
    vsp.applyBtn.click();
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
    var vsp = viewSettingsPage;
    vsp.get();
    vsp.clickTabByName('Member Specific');
    vsp.pickMemberWithViewSettings(constants.adminUsername);
    expect(vsp.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, true);
    vsp.applyBtn.click();
    vsp.clickTabByName('Manager');
    vsp.clickFieldByName('Semantic Domain');
    util.setCheckbox(vsp.showField, true);
    vsp.applyBtn.click();
  });
});
