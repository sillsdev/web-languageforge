'use strict';

module.exports = new ProjectsPage();

function ProjectsPage() {
  var util = require('./util');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;
  var projectTypes = {
    sf: 'Community Scripture Checking', // ScriptureForge
    lf: 'Web Dictionary' // LanguageForge
  };

  this.url = '/app/projects';
  this.get = function get() {
    browser.get(browser.baseUrl + this.url);
  };

  this.testProjectName = 'Test Project';

  this.createBtn = element(by.partialButtonText('Start or Join a New Project'));
  this.newProjectNameInput  = element(by.model('newProject.projectName'));
  this.newProjectTypeSelect = element(by.model('newProject.appName'));
  this.saveBtn = element(by.partialButtonText('Save'));

  this.settings = {};
  this.settings.button = element(by.className('fa fa-cog'));
  if (browser.baseUrl.includes('scriptureforge')) {
    this.settings.userManagementLink = element(by.linkText('Project Settings'));
  } else if (browser.baseUrl.includes('languageforge')) {
    this.settings.userManagementLink = element(by.linkText('User Management'));
  }

  // Or just select "100" from the per-page dropdown, then you're pretty much guaranteed the Test
  // Project will be on page 1, and you can find it.
  this.itemsPerPageCtrl = element(by.model('itemsPerPage'));
  this.projectsList = element.all(by.repeater('project in visibleProjects'));
  this.projectNames = element.all(by.repeater('project in visibleProjects')
    .column('project.projectName'));

  //noinspection JSUnusedGlobalSymbols
  this.projectTypes = element.all(by.repeater('project in visibleProjects')
    .column('{{project.projectName}} ({{projectTypes[project.appName]}})'));

  //noinspection JSUnusedGlobalSymbols
  this.select100ItemsPerPage = function select100ItemsPerPage() {
    util.clickDropdownByValue(this.itemsPerPageCtrl, '100');
    expect(element(by.model('itemsPerPage')).element(by.css('option:checked'))
      .getText()).toEqual('100');
  };

  this.findProject = function findProject(projectName) {
    var foundRow = undefined;
    var result = protractor.promise.defer();
    var searchName = new RegExp(projectName);
    this.projectsList.map(function (row) {
      row.getText().then(function (text) {
        if (searchName.test(text)) {
          foundRow = row;
        }
      });
    }).then(function () {
      if (foundRow) {
        result.fulfill(foundRow);
      } else {
        result.reject('Project ' + projectName + ' not found.');
      }
    });

    return result;
  };

  //noinspection JSUnusedGlobalSymbols
  this.addNewProject = function addNewProject(nameToAdd) {
    this.createBtn.click();
    this.newProjectNameInput.sendKeys(nameToAdd);
    util.clickDropdownByValue(this.newProjectTypeSelect, projectTypes.sf);
    this.saveBtn.click();
  };

  this.clickOnProject = function clickOnProject(projectName) {
    this.findProject(projectName).then(function (projectRow) {
      var projectLink = projectRow.element(by.css('a'));
      projectLink.getAttribute('href').then(function (url) {
        browser.get(url);
      });
    });
  };

  this.addUserToProject = function addUserToProject(projectName, usersName, roleText) {
    this.findProject(projectName).then(function (projectRow) {
      var projectLink = projectRow.element(by.css('a'));
      projectLink.click();
      browser.wait(expectedCondition.visibilityOf(this.settings.button), CONDITION_TIMEOUT);
      this.settings.button.click();
      browser.wait(expectedCondition.visibilityOf(this.settings.userManagementLink),
        CONDITION_TIMEOUT);
      this.settings.userManagementLink.click();

      var addMembersBtn = element(by.id('addMembersButton'));
      browser.wait(expectedCondition.visibilityOf(addMembersBtn), CONDITION_TIMEOUT);
      addMembersBtn.click();
      var newMembersDiv = element(by.css('#newMembersDiv'));
      var userNameInput = newMembersDiv.element(by.id('typeaheadInput'));
      browser.wait(expectedCondition.visibilityOf(userNameInput), CONDITION_TIMEOUT);
      userNameInput.sendKeys(usersName);

      var typeaheadDiv = element(by.css('.typeahead'));
      var typeaheadItems = typeaheadDiv.all(by.css('ul li'));
      util.findRowByText(typeaheadItems, usersName).then(function (item) {
        item.click();
      });

      // This should be unique no matter what
      var addToProjectBtn = newMembersDiv.element(by.id('addUserButton'));
      expect(addToProjectBtn.getText()).toContain('Add Existing User');
      addToProjectBtn.click();

      // Now set the user to member or manager, as needed
      var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
      var foundUserRow;
      projectMemberRows.map(function (row) {
        var nameColumn = row.element(by.binding('user.username'));
        nameColumn.getText().then(function (text) {
          if (text === usersName) {
            foundUserRow = row;
          }
        });
      }).then(function () {
        if (foundUserRow) {
          var select = foundUserRow.element(by.css('select:not([disabled])'));
          util.clickDropdownByValue(select, roleText);
        }
      });

      this.get(); // After all is finished, reload projects page
    }.bind(this));
  };

  //noinspection JSUnusedGlobalSymbols
  this.addManagerToProject = function addManagerToProject(projectName, usersName) {
    this.addUserToProject(projectName, usersName, 'Manager');
  };

  this.addMemberToProject = function addMemberToProject(projectName, usersName) {
    this.addUserToProject(projectName, usersName, 'Contributor');
  };

  this.removeUserFromProject = function removeUserFromProject(projectName, userName) {
    this.findProject(projectName).then(function (projectRow) {
      var projectLink = projectRow.element(by.css('a'));
      projectLink.click();

      this.settings.button.click();
      this.settings.userManagementLink.click();

      var userFilter = element(by.model('userFilter'));
      userFilter.sendKeys(userName);
      var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
      var foundUserRow = projectMemberRows.first();
      var rowCheckbox = foundUserRow.element(by.css('input[type="checkbox"]'));
      util.setCheckbox(rowCheckbox, true);
      var removeMembersBtn = element(by.partialButtonText('Remove Members'));
      removeMembersBtn.click();

      this.get(); // After all is finished, reload projects page
    }.bind(this));
  };
}
