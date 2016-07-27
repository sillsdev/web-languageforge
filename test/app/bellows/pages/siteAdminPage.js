'use strict';

var SiteAdminPage = function () {
  var util = require('./util.js');
  var _this = this;

  this.url = browser.baseUrl + '/app/siteadmin';
  this.get = function () {
    browser.get(this.url);
  };

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.activePane = element(by.css('div.tab-pane.active'));

  this.tabs = {
    reports: element(by.linkText('Users')),
    archivedProjects: element(by.linkText('Archived Projects'))
  };

  this.tabs.archivedProjects.republishButton =
    this.activePane.element(by.buttonText('Re-publish Projects'));
  this.tabs.archivedProjects.deleteButton =
    this.activePane.element(by.buttonText('Delete Projects'));
  this.tabs.archivedProjects.projectsList =
    element.all(by.repeater('project in visibleProjects'));
  this.tabs.archivedProjects.setCheckbox = function (row, value) {
    var projectRow = _this.tabs.archivedProjects.projectsList.get(row);
    var rowCheckbox = projectRow.element(by.css('input[type="checkbox"]'));
    util.setCheckbox(rowCheckbox, value);
  };

  this.addBtn = element(by.partialButtonText('Add New'));
  this.userFilterInput = element(by.model('filterUsers'));
  this.usernameInput = element(by.model('record.username'));
  this.nameInput = element(by.model('record.name'));
  this.emailInput = element(by.model('record.email'));

  this.roleInput = element(by.model('record.role'));
  this.activeCheckbox = element(by.model('record.active'));
  this.passwordInput = element(by.model('record.password'));

  this.clearForm = function () {
    this.usernameInput.clear();
    this.nameInput.clear();
    this.emailInput.clear();
    this.passwordInput.clear();

    //this.activeCheckbox.clear();
  };
};

module.exports = new SiteAdminPage();
