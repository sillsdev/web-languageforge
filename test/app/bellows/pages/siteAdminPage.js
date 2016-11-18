'use strict';

module.exports = new SiteAdminPage();

function SiteAdminPage() {
  var util = require('./util.js');
  var _this = this;

  this.url = browser.baseUrl + '/app/siteadmin';
  this.get = function get() {
    // todo: refactor this to be a click recipe (as a user would click on the menu to navigate)
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
  this.tabs.archivedProjects.setCheckbox = function setCheckbox(row, value) {
    var projectRow = _this.tabs.archivedProjects.projectsList.get(row);
    var rowCheckbox = projectRow.element(by.css('input[type="checkbox"]'));
    util.setCheckbox(rowCheckbox, value);
  };

  //noinspection JSUnusedGlobalSymbols
  this.addBtn = element(by.partialButtonText('Add New'));

  //noinspection JSUnusedGlobalSymbols
  this.userFilterInput = element(by.model('filterUsers'));
  this.usernameInput = element(by.model('record.username'));
  this.nameInput = element(by.model('record.name'));
  this.emailInput = element(by.model('record.email'));

  //noinspection JSUnusedGlobalSymbols
  this.roleInput = element(by.model('record.role'));

  //noinspection JSUnusedGlobalSymbols
  this.activeCheckbox = element(by.model('record.active'));
  this.passwordInput = element(by.model('record.password'));

  //noinspection JSUnusedGlobalSymbols
  this.clearForm = function clearForm() {
    this.usernameInput.clear();
    this.nameInput.clear();
    this.emailInput.clear();
    this.passwordInput.clear();

    //this.activeCheckbox.clear();
  };
}
