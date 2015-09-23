'use strict';

/**
 *  TODO: refactor tests so that constants.siteType doesn't need to be specified
 *  in protractorConf.scriptureforge.js and protractorConf.languageforge.js as used in projectsPage.js.
 *  Perhaps User Management needs to be its own app. IJH 2015-01
 */
describe('E2E Projects List App', function() {
  var constants     = require('../../../testConstants.json');
  var util          = require('../../pages/util.js');
  var loginPage     = require('../../pages/loginPage');
  var projectsPage  = require('../../pages/projectsPage.js');

  describe('for Normal User', function() {

    it('should list the project of which the user is a member', function() {
      loginPage.loginAsMember();
      projectsPage.get();
      expect(projectsPage.projectNames.get(0).getText()).toBe(constants.testProjectName);
    });

    it('should not list projects the user is not a member of', function() {
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBe(1);
    });

    it('can list two projects of which the user is a member', function() {
      loginPage.loginAsAdmin();
      projectsPage.get();
      projectsPage.addMemberToProject(constants.otherProjectName, constants.memberUsername);
      loginPage.loginAsMember();
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBe(2);
    });
  });

  // Two helper functions to avoid duplicating the same checks in admin test below
  var shouldProjectBeLinked = function shouldProjectBeLinked(projectName, projectRow, bool) {
    expect(projectRow.element(by.elemMatches('a', projectName)).isDisplayed()).toBe(bool);
  };

  var shouldProjectHaveButtons = function shouldProjectHaveButtons(projectRow, bool) {
    var addAsManagerBtn = projectRow.element(by.partialButtonText('Add me as Manager'));
    var addAsMemberBtn = projectRow.element(by.partialButtonText('Add me as Contributor'));
    expect(addAsManagerBtn.isDisplayed()).toBe(bool);
    expect(addAsMemberBtn.isDisplayed()).toBe(bool);
  };

  describe('for System Admin User', function() {

    it('should list all projects for ScriptureForge', function() {
      loginPage.loginAsAdmin();
      projectsPage.get();
      expect(projectsPage.projectsList.count()).toBeGreaterThan(0);

      // Check that the test project is around
      projectsPage.findProject(constants.testProjectName).then(function(projectRow) {
        shouldProjectBeLinked(constants.testProjectName, projectRow, true);
      });
    });

    it('should show add and delete buttons', function() {
      // projectsPage.createBtn.getOuterHtml().then(console.log);
      // projectsPage.archiveButton.getOuterHtml().then(console.log);
      expect(projectsPage.createBtn.isDisplayed()).toBeTruthy();

      // expect(projectsPage.archiveButton.isDisplayed()).toBeTruthy();
    });

    it('should allow the admin to add themselves to the project as member or manager', function() {

      // First remove the admin from the project (must be a project admin is not the owner of)
      loginPage.loginAsManager();
      projectsPage.get();

      // The admin should not see "Add myself to project" buttons when he's already a project member or manager
      // And the project name should be a clickable link
      projectsPage.findProject(constants.otherProjectName).then(function(projectRow) {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        shouldProjectHaveButtons(projectRow, false);
      });

      projectsPage.removeUserFromProject(constants.otherProjectName, constants.adminUsername);
      loginPage.loginAsAdmin();
      projectsPage.get();

      // Now the admin should have "Add myself to project" buttons
      // And the project name should NOT be a clickable link
      projectsPage.findProject(constants.otherProjectName).then(function(projectRow) {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, false);
        shouldProjectHaveButtons(projectRow, true);

        // Now add the admin back to the project
        projectRow.element(by.partialButtonText('Add me as Manager')).click();
      });

      // And the buttons should go away after one of them is clicked
      projectsPage.findProject(constants.otherProjectName).then(function(projectRow) {
        shouldProjectBeLinked(constants.otherProjectName, projectRow, true);
        shouldProjectHaveButtons(projectRow, false);
      });
    });
  });

});
