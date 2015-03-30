'use strict';

var SfProjectSettingsPage = function() {
  
  this.tabs = {
    members:      element(by.linkText('Members')),
    templates:      element(by.linkText('Question Templates')),
    archiveTexts:    element(by.linkText('Archived Texts')),
    projectProperties:  element(by.linkText('Project Properties')),
    optionlists:    element(by.linkText('User Profile Lists')),
    communication:    element(by.linkText('Communication Settings'))
  };
  
  this.membersTab = {
    addButton:    element(by.partialButtonText('Add Members')),
    removeButton:  element(by.partialButtonText('Remove Members')),
    messageButton:  element(by.partialButtonText('Message Selected Users')),
    listFilter:    element(by.model('userFilter')),
    list:      element.all(by.repeater('user in list.visibleUsers')),
    newMember:    {
              input:    element(by.model('term')),
              button:    element(by.model('addMode')),
              warning:  element(by.binding('warningText')),
              results:  $('.typeahead').$('ul li')
            }
  };
  
  this.addNewMember = function(name) {
    this.tabs.members.click();
    this.membersTab.addButton.click();
    this.membersTab.newMember.input.sendKeys(name);
    this.membersTab.newMember.button.click();
  };

  this.templatesTab = {
    list:      element.all(by.repeater('template in visibleTemplates')),
    addButton:    element(by.partialButtonText('Add New Template')),
    removeButton:  element(by.partialButtonText('Remove Templates')),
    editor:  {
      title:       element(by.model('editedTemplate.title')),
      description:  element(by.model('editedTemplate.description')),
      saveButton:    element(by.id('question_templates_save_button')),
    },
  };
  
  this.archivedTextsTab = {
    textNames:    element.all(by.repeater('text in visibleTexts').column('title')),
    textList:    element.all(by.repeater('text in visibleTexts')),
    publishButton:  element(by.partialButtonText('Re-publish Texts')),

    textLink: function(title) {
      return element(by.linkText(title));
    }
  };
  // getFirstCheckbox has to be a function because the .first() method will actually resolve the finder
  this.archivedTextsTabGetFirstCheckbox = function() {
    return this.archivedTextsTab.textList.first().element(by.css('input[type="checkbox"]'));
  };
  
  this.propertiesTab = {
    name:    element(by.model('project.projectName')),
    code:    element(by.model('project.projectCode')),
    featured:  element(by.model('project.featured')),
    allowAudioDownload:  element(by.model('project.allowAudioDownload')),
    button:    element(by.id('project_properties_save_button'))
  };
  
  this.optionlistsTab = {
    // TODO: Find better names for these
    showList:      element(by.id('showInProfileFieldset')).all(by.repeater('(listId, list) in project.userProperties.userProfilePickLists')),
    editList:      element(by.id('editListValuesFieldset')).all(by.repeater('(listId, list) in project.userProperties.userProfilePickLists')),
    editContentsList:  element(by.id('picklistEditorFieldset')).all(by.repeater('item in items')),
    defaultValue:    element(by.id('picklistEditorFieldset')).element(by.model('defaultKey')),
    addInput:      element(by.id('picklistEditorFieldset')).element(by.model('newValue')),
    addButton:      element(by.id('picklistEditorFieldset')).element(by.css('input[type="text"] + a')),
    saveButton:      element(by.id('user_profile_lists_save_button')),
    unsavedWarning:    element(by.css('span.unsaved-warning')),
    deleteButton: function(repeaterRow) {
      // Given a single repeater row in the picklist, return the delete button for that row
      return repeaterRow.element(by.css('a:first-of-type'));
    },
  }; // NYI - wait for refactor
  
  this.communicationTab = {
    sms: {
      accountId:    element(by.model('settings.sms.accountId')),
      authToken:    element(by.model('settings.sms.authToken')),
      number:      element(by.model('settings.sms.fromNumber')),
    },
    email: {
      address:    element(by.model('settings.email.fromAddress')),
      name:      element(by.model('settings.email.fromName')),
    },
    button:        element(by.id('communication_settings_save_button'))
  };
  
};

module.exports = new SfProjectSettingsPage();
