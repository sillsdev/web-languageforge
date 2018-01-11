'use strict';

module.exports = new SiteAdminPage();

function SiteAdminPage() {
  var util = require('./util.js');

  this.url = browser.baseUrl + '/app/siteadmin';
  this.get = function get() {
    // todo: refactor this to be a click recipe (as a user would click on the menu to navigate)
    browser.get(this.url);
  };

  this.activePane = element(by.css('div.tab-pane.active'));

  this.tabs = {
    reports: element(by.id('users')),
    archivedProjects: element(by.id('archivedprojects'))
  };

  this.tabs.archivedProjects.republishButton = element(by.id('site-admin-republish-btn'));
  this.tabs.archivedProjects.deleteButton = element(by.id('site-admin-delete-btn'));
  this.tabs.archivedProjects.projectsList =
    element.all(by.repeater('project in visibleProjects'));
  this.tabs.archivedProjects.setCheckbox = function (row, value) {
    var projectRow = this.tabs.archivedProjects.projectsList.get(row);
    var rowCheckbox = projectRow.element(by.css('input[type="checkbox"]'));
    util.setCheckbox(rowCheckbox, value);
  }.bind(this);

  //noinspection JSUnusedGlobalSymbols
  this.addBtn = element(by.id('site-admin-add-new-btn'));

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
