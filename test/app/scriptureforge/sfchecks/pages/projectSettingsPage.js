'use strict';

module.exports = new SfProjectSettingsPage();

function SfProjectSettingsPage() {
  var projectsPage = require('../../../bellows/pages/projectsPage.js');
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.settingsMenuLink = element(by.className('btn dropdown-toggle'));
  this.projectSettingsLink = element(by.linkText('Project Settings'));

  // Get the projectSettings for project projectName
  this.get = function get(projectName) {
    projectsPage.get();
    projectsPage.clickOnProject(projectName);
    browser.wait(expectedCondition.visibilityOf(this.settingsMenuLink), CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    this.projectSettingsLink.click();
  };

  this.tabDivs = element.all(by.repeater('tab in tabs'));

  this.tabs = {
    members: element(by.linkText('Members')),
    templates: element(by.linkText('Question Templates')),
    archiveTexts: element(by.linkText('Archived Texts')),
    project: element(by.linkText('Project Properties')),
    optionlists: element(by.linkText('User Profile Lists')),
    communication: element(by.linkText('Communication Settings'))
  };

  this.membersTab = {
    addButton: element(by.partialButtonText('Add Members')),
    removeButton: element(by.partialButtonText('Remove Members')),
    messageButton: element(by.partialButtonText('Message Selected Users')),
    listFilter: element(by.model('userFilter')),
    list: element.all(by.repeater('user in list.visibleUsers')),
    newMember: {
      input: element(by.model('term')),
      button: element(by.model('addMode')),
      warning: element(by.binding('warningText')),
      results: element(by.css('.typeahead')).element(by.css('ul li'))
    }
  };

  this.membersTab.addNewMember = function (name) {
    this.tabs.members.click();
    this.membersTab.addButton.click();
    browser.wait(expectedCondition.visibilityOf(this.membersTab.newMember.input),
      CONDITION_TIMEOUT);
    this.membersTab.newMember.input.sendKeys(name);
    browser.wait(expectedCondition.textToBePresentInElementValue(this.membersTab.newMember.input,
      name), CONDITION_TIMEOUT);
    this.membersTab.newMember.button.click();
  }.bind(this);

  this.membersTab.waitForNewUserToLoad = function (memberCount) {
    browser.wait(function () {
      return this.membersTab.list.count().then(function (count) {
        return count >= memberCount + 1;
      });
    }.bind(this));
  }.bind(this);

  this.templatesTab = {
    list: element.all(by.repeater('template in visibleTemplates')),
    addButton: element(by.partialButtonText('Add New Template')),
    removeButton: element(by.partialButtonText('Remove Templates')),
    editor: {
      title: element(by.model('editedTemplate.title')),
      description: element(by.model('editedTemplate.description')),
      saveButton: element(by.id('question_templates_save_button'))
    }
  };

  this.archivedTextsTab = {
    textNames: element.all(by.repeater('text in visibleTexts').column('title')),
    textList: element.all(by.repeater('text in visibleTexts')),
    publishButton: element(by.partialButtonText('Re-publish Texts')),
    textLink: function textLink(title) {
      return element(by.linkText(title));
    }
  };

  // getFirstCheckbox has to be a function because the .first() method will actually resolve the
  // finder
  this.archivedTextsTabGetFirstCheckbox = function archivedTextsTabGetFirstCheckbox() {
    return this.archivedTextsTab.textList.first().element(by.css('input[type="checkbox"]'));
  };

  this.projectTab = {
    name: element(by.model('project.projectName')),
    code: element(by.model('project.projectCode')),
    featured: element(by.model('project.featured')),
    allowAudioDownload: element(by.model('project.allowAudioDownload')),
    saveButton: element(by.id('project_properties_save_button'))
  };

  this.optionlistsTab = {
    // TODO: Find better names for these
    showList: element(by.id('showInProfileFieldset'))
      .all(by.repeater('(listId, list) in project.userProperties.userProfilePickLists')),
    editList: element(by.id('editListValuesFieldset'))
      .all(by.repeater('(listId, list) in project.userProperties.userProfilePickLists')),
    editContentsList: element(by.id('picklistEditorFieldset')).all(by.repeater('item in items')),
    defaultValue: element(by.id('picklistEditorFieldset')).element(by.model('defaultKey')),
    addInput: element(by.id('picklistEditorFieldset')).element(by.model('newValue')),
    addButton: element(by.id('picklistEditorFieldset')).element(by.css('input[type="text"] + a')),
    saveButton: element(by.id('user_profile_lists_save_button')),
    unsavedWarning: element(by.css('span.unsaved-warning')),
    deleteButton: function deleteButton(repeaterRow) {
      // Given a single repeater row in the picklist, return the delete button for that row
      return repeaterRow.element(by.css('a:first-of-type'));
    }
  }; // NYI - wait for refactor

  this.communicationTab = {
    sms: {
      accountId: element(by.model('settings.sms.accountId')),
      authToken: element(by.model('settings.sms.authToken')),
      number: element(by.model('settings.sms.fromNumber'))
    },
    email: {
      address: element(by.model('settings.email.fromAddress')),
      name: element(by.model('settings.email.fromName'))
    },
    button: element(by.id('communication_settings_save_button'))
  };

}
