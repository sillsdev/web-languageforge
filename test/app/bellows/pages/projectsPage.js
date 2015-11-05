'use strict';

var projectTypes = {
  sf: 'Community Scripture Checking', // ScriptureForge
  lf: 'Web Dictionary' // LanguageForge
};

var util = require('./util');
var constants = require('../../testConstants.json');

var SfProjectsPage = function() {
  var _this = this;
  this.url = '/app/projects';
  this.get = function() {
    browser.get(browser.baseUrl + this.url);
  };

  this.testProjectName = 'Test Project';

  this.archiveButton = element(by.partialButtonText('Archive Selected Projects'));
  this.createBtn = element(by.partialButtonText('Create New Project'));
  this.newProjectNameInput  = element(by.model('newProject.projectName'));
  this.newProjectTypeSelect = element(by.model('newProject.appName'));
  this.saveBtn = element(by.partialButtonText('Save'));

  // Or just select "100" from the per-page dropdown, then you're pretty much guaranteed the Test Project will be on page 1, and you can find it.
  this.itemsPerPageCtrl = element(by.model('itemsPerPage'));
  this.projectsCtrl =     element(by.repeater('project in visibleProjects'));
  this.projectsList = element.all(by.repeater('project in visibleProjects'));
  this.projectNames = element.all(by.repeater('project in visibleProjects').column('{{project.projectName}}'));
  this.projectTypes = element.all(by.repeater('project in visibleProjects').column('{{project.projectName}} ({{projectTypes[project.appName]}})'));

  this.select100ItemsPerPage = function() {
    util.clickDropdownByValue(this.itemsPerPageCtrl, '100');
    expect(element(by.model('itemsPerPage')).element(by.css('option:checked')).getText()).toEqual('100');
  };

  this.projectExists = function() {
  };

  this.findProject = function(projectName) {
    var foundRow = undefined;
    var result = protractor.promise.defer();
    var searchName = new RegExp(projectName);
    this.projectsList.map(function(row) {
      row.getText().then(function(text) {
        if (searchName.test(text)) {
          foundRow = row;
        }
      });
    }).then(function() {
      if (foundRow) {
        result.fulfill(foundRow);
      } else {
        result.reject('Project ' + projectName + ' not found.');
      }
    });

    return result;
  };

  this.deleteProject = function(nameToDelete) {
    var _this = this; // For use inside the anonymous functions below
    this.findProject(nameToDelete).then(function(projectRow) {
      var elem = projectRow.element(by.css('input[type=\'checkbox\']'));
      elem.click();
      _this.deleteBtn.click();

      // Clicking the delete button pops up an "are you sure?" alert
      util.clickModalButton('Archive');
    });
  };

  this.addNewProject = function(nameToAdd) {
    this.createBtn.click();
    this.newProjectNameInput.sendKeys(nameToAdd);
    util.clickDropdownByValue(this.newProjectTypeSelect, projectTypes.sf);
    this.saveBtn.click();
  };

  this.clickOnProject = function(projectName) {
    this.findProject(projectName).then(function(projectRow) {
      var link = projectRow.element(by.css('a'));
      link.getAttribute('href').then(function(url) {
        browser.get(url);
      });
    });
  };

  this.addUserToProject = function(projectName, userName, roleText) {
    this.findProject(projectName).then(function(projectRow) {
      var link = projectRow.element(by.css('a'));
      link.click();

      var settingsButton = element(by.css('a.btn i.icon-cog'));
      var userManagementLink;
      if (constants.siteType == 'scriptureforge') {
        userManagementLink = element(by.linkText('Project Settings'));
      } else if (constants.siteType == 'languageforge') {
        userManagementLink = element(by.linkText('User Management'));
      }

      settingsButton.click();
      userManagementLink.click();

      var addMembersBtn = element(by.partialButtonText('Add Members'));
      var newMembersDiv = element(by.css('#newMembersDiv'));
      var userNameInput = newMembersDiv.element(by.css('input[type="text"]'));
      addMembersBtn.click();
      userNameInput.sendKeys(userName);

      var typeaheadDiv = element(by.css('.typeahead'));
      var typeaheadItems = typeaheadDiv.element(by.css('ul'));
      typeaheadItems.click();

      var addToProjectBtn = newMembersDiv.element(by.css('button')); // This should be unique no matter what
      expect(addToProjectBtn.getText()).toContain('Add Existing User');
      addToProjectBtn.click();

      // Now set the user to member or manager, as needed
      var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
      var foundUserRow;
      projectMemberRows.map(function(row) {
        var nameColumn = row.element(by.binding('{{user.username}}'));
        nameColumn.getText().then(function(text) {
          if (text === userName) {
            foundUserRow = row;
          }
        });
      }).then(function() {
        if (foundUserRow) {
          var select = foundUserRow.element(by.css('select:not([disabled])'));
          util.clickDropdownByValue(select, roleText);
        }
      });

      _this.get(); // After all is finished, reload projects _this
    });
  };

  this.addManagerToProject = function(projectName, userName) {
    this.addUserToProject(projectName, userName, 'Manager');
  };

  this.addMemberToProject = function(projectName, userName) {
    this.addUserToProject(projectName, userName, 'Contributor');
  };

  this.removeUserFromProject = function(projectName, userName) {
    this.findProject(projectName).then(function(projectRow) {
      var link = projectRow.element(by.css('a'));
      link.getAttribute('href').then(function(url) {
        var extraUrlPart;
        if (constants.siteType == 'scriptureforge') {
          extraUrlPart = '#/settings';
        } else if (constants.siteType == 'languageforge') {
          extraUrlPart = '#/users';
        }

        browser.get(url + extraUrlPart);
        var userFilter = element(by.model('userFilter'));
        userFilter.sendKeys(userName);
        var projectMemberRows = element.all(by.repeater('user in list.visibleUsers'));
        var foundUserRow = projectMemberRows.first();
        var rowCheckbox = foundUserRow.element(by.css('input[type="checkbox"]'));
        util.setCheckbox(rowCheckbox, true);
        var removeMembersBtn = element(by.partialButtonText('Remove Members'));
        removeMembersBtn.click();
      });

      _this.get(); // After all is finished, reload projects page
    });
  };
};

module.exports = new SfProjectsPage();
