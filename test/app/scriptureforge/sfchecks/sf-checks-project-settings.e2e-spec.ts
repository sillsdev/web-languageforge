import {browser, by, ExpectedConditions} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectSettingsPage} from './shared/project-settings.page';
import {SfProjectPage} from './shared/project.page';

describe('SFChecks E2E project settings page - project manager', () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const util = new Utils();

  it('setup: logout, login as project manager, go to project settings', () => {
    BellowsLoginPage.logout();
    loginPage.loginAsManager();
    projectSettingsPage.get(constants.testProjectName);
  });

  describe('members tab', () => {
    let memberCount = 0;

    it('setup: click on tab', () => {
      expect<any>(projectSettingsPage.tabs.members.isPresent()).toBe(true);
      projectSettingsPage.tabs.members.click();
    });

    it('can list project members', () => {
      expect(projectSettingsPage.membersTab.list.count()).toBeGreaterThan(0);
      projectSettingsPage.membersTab.list.count().then( val => { memberCount = val; });
    });

    it('can filter the list of members', () => {
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
      projectSettingsPage.membersTab.listFilter.sendKeys(constants.managerUsername);
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(1);
      projectSettingsPage.membersTab.listFilter.clear();
    });

    it('can add a new user as a member', () => {
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
      projectSettingsPage.membersTab.addButton.click();
      browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.membersTab.newMember.input),
        Utils.conditionTimeout);
      projectSettingsPage.membersTab.newMember.input.sendKeys('du');

      // sendKeys is split to force correct button behaviour. IJH 2015-10
      projectSettingsPage.membersTab.newMember.input.sendKeys('de');
      projectSettingsPage.membersTab.newMember.button.click();
      projectSettingsPage.membersTab.waitForNewUserToLoad(memberCount);
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount + 1);
    });

    it('can not add the same user twice', () => {
      projectSettingsPage.membersTab.newMember.input.clear();
      projectSettingsPage.membersTab.newMember.input.sendKeys('dude');
      expect(projectSettingsPage.membersTab.newMember.button.isEnabled()).toBeFalsy();
      expect(projectSettingsPage.membersTab.newMember.warning.isDisplayed()).toBeTruthy();
      projectSettingsPage.membersTab.newMember.input.clear();
    });

    it('can change the role of a member', () => {
      projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.membersTab.list.first()
        .element(by.model('user.role'))));
      Utils.clickDropdownByValue(projectSettingsPage.membersTab.list.first().element(by.model('user.role')), 'Manager');
      expect<any>(projectSettingsPage.membersTab.list.first().element(by.model('user.role'))
        .element(by.css('option:checked')).getText()).toEqual('Manager');
      projectSettingsPage.membersTab.listFilter.clear();
    });

    it('can remove a member', () => {
      projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      projectSettingsPage.membersTab.list.first().element(by.css('input[type="checkbox"]')).click();
      projectSettingsPage.membersTab.removeButton.click();
      projectSettingsPage.membersTab.listFilter.clear();
      projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(0);
      projectSettingsPage.membersTab.listFilter.clear();
      expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
    });

    // it('can message selected user', function() {});  // how can we test this? - cjh

  });

  describe('question templates tab', () => {

    it('setup: click on tab', () => {
      expect<any>(projectSettingsPage.tabs.templates.isPresent()).toBe(true);
      projectSettingsPage.tabs.templates.click();
    });

    it('can list templates', () => {
      expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(2);
    });

    it('can add a template', () => {
      projectSettingsPage.templatesTab.addButton.click();
      browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.templatesTab.editor.title),
        Utils.conditionTimeout);
      projectSettingsPage.templatesTab.editor.title.sendKeys('sound check');
      projectSettingsPage.templatesTab.editor.description
        .sendKeys('What do you think of when I say the words... "boo"');
      projectSettingsPage.templatesTab.editor.saveButton.click();
      expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(3);
      expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
    });

    it('can update an existing template', () => {
      projectSettingsPage.templatesTab.list.last().element(by.linkText('sound check')).click();
      browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.templatesTab.editor.saveButton),
        Utils.conditionTimeout);
      expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(true);
      projectSettingsPage.templatesTab.editor.title.clear();
      projectSettingsPage.templatesTab.editor.title.sendKeys('test12');
      projectSettingsPage.templatesTab.editor.saveButton.click();
      browser.wait(ExpectedConditions.invisibilityOf(projectSettingsPage.templatesTab.editor.saveButton),
        Utils.conditionTimeout);
      expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
      expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(3);
    });

    it('can delete a template', () => {
      projectSettingsPage.templatesTab.list.last().element(by.css('input[type="checkbox"]')).click();
      projectSettingsPage.templatesTab.removeButton.click();
      expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(2);
    });

  });

  // The Archived Texts tab is tested as part of a process in the Project page tests. IJH 2014-06

  describe('project properties tab', () => {
    const newName = constants.thirdProjectName;

    it('setup: click on tab', () => {
      loginPage.loginAsManager();
      projectSettingsPage.get(constants.testProjectName);
      expect<any>(projectSettingsPage.tabs.project.isPresent()).toBe(true);
      projectSettingsPage.tabs.project.click();
    });

    it('can read properties', () => {
      expect(projectSettingsPage.projectTab.name.getAttribute('value')).toBe(constants.testProjectName);
      expect(projectSettingsPage.projectTab.allowAudioDownload.getAttribute('checked')).toBeTruthy();
    });

    it('can change properties and verify they persist', () => {
      projectSettingsPage.projectTab.name.clear();
      projectSettingsPage.projectTab.name.sendKeys(newName);
      projectSettingsPage.projectTab.allowAudioDownload.click();
      projectSettingsPage.projectTab.saveButton.click();
      browser.navigate().refresh();
      projectSettingsPage.tabs.project.click();
      expect(projectSettingsPage.projectTab.name.getAttribute('value')).toBe(newName);
      expect(projectSettingsPage.projectTab.allowAudioDownload.getAttribute('checked')).toBeFalsy();
      projectSettingsPage.get(newName);
      projectSettingsPage.tabs.project.click();
      projectSettingsPage.projectTab.name.clear();
      projectSettingsPage.projectTab.name.sendKeys(constants.testProjectName);
      expect<any>(projectSettingsPage.noticeList.count()).toBe(0);
      projectSettingsPage.projectTab.saveButton.click();
      expect<any>(projectSettingsPage.noticeList.count()).toBe(1);
      projectSettingsPage.lastNoticeCloseButton.click();
    });

  });

  describe('user profile lists', () => {

    it('setup: click on tab and select the Study Group list for editing and display', () => {
      projectSettingsPage.tabs.optionlists.click();
      util.findRowByText(projectSettingsPage.optionlistsTab.editList, 'Study Group').then(row => {
        row.click();
      });
      expect<any>(projectSettingsPage.optionlistsTab.editContentsLabel.getText()).toEqual('Study Group');
      util.findRowByText(projectSettingsPage.optionlistsTab.showList, 'Study Group').then(row => {
        row.click();
        expect<any>(row.element(by.tagName('input')).isSelected()).toBe(true);
      });
    });

    it('can add two values to a list', () => {
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(0);
      projectSettingsPage.optionlistsTab.addInput.sendKeys('foo');
      projectSettingsPage.optionlistsTab.addButton.click();
      browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.optionlistsTab.addInput),
        Utils.conditionTimeout);
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
      projectSettingsPage.optionlistsTab.addInput.sendKeys('bar');
      projectSettingsPage.optionlistsTab.addButton.click();
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(2);
    });

    it('can delete a value from the list', () => {
      const firstEditContentsList = projectSettingsPage.optionlistsTab.editContentsList.first();
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(2);
      projectSettingsPage.optionlistsTab.deleteButton(firstEditContentsList).click();
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
    });

    it('should persist data', () => {
      expect<any>(projectSettingsPage.noticeList.count()).toBe(0);
      projectSettingsPage.optionlistsTab.saveButton.click();
      expect<any>(projectSettingsPage.noticeList.count()).toBe(1);
      projectSettingsPage.lastNoticeCloseButton.click();
      Utils.clickBreadcrumb(constants.thirdProjectName);
      expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      projectSettingsPage.clickOnSettingsLink();
      expect<any>(projectSettingsPage.tabs.optionlists.isDisplayed()).toBe(true);
      projectSettingsPage.tabs.optionlists.click();
      util.findRowByText(projectSettingsPage.optionlistsTab.editList, 'Study Group').then(row => {
        row.click();
      });
      util.findRowByText(projectSettingsPage.optionlistsTab.showList, 'Study Group').then(row => {
        expect<any>(row.element(by.tagName('input')).isSelected()).toBe(true);
      });
      expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
    });

  });

  describe('communication settings tab', () => {

    it('is visible for project manager', () => {
      expect<any>(projectSettingsPage.tabs.communication.isDisplayed()).toBe(true);
    });

    describe('as a system admin', () => {
      it('setup: logout, login as system admin, go to project settings', () => {
        BellowsLoginPage.logout();
        loginPage.loginAsAdmin();
        projectSettingsPage.get(constants.testProjectName);
      });

      it('the communication settings tab is visible', () => {
        expect<any>(projectSettingsPage.tabs.communication.isPresent()).toBe(true);
        projectSettingsPage.tabs.communication.click();
      });

      it('can persist communication fields', () => {
        expect<any>(projectSettingsPage.communicationTab.sms.accountId.getAttribute('value')).toBe('');
        expect<any>(projectSettingsPage.communicationTab.sms.authToken.getAttribute('value')).toBe('');
        expect<any>(projectSettingsPage.communicationTab.sms.number.getAttribute('value')).toBe('');
        expect<any>(projectSettingsPage.communicationTab.email.address.getAttribute('value')).toBe('');
        expect<any>(projectSettingsPage.communicationTab.email.name.getAttribute('value')).toBe('');

        const sample = { a: '12345', b: '78', c: '90', d: 'email@me.com', e: 'John Smith' };
        projectSettingsPage.communicationTab.sms.accountId.sendKeys(sample.a);
        projectSettingsPage.communicationTab.sms.authToken.sendKeys(sample.b);
        projectSettingsPage.communicationTab.sms.number.sendKeys(sample.c);
        projectSettingsPage.communicationTab.email.address.sendKeys(sample.d);
        projectSettingsPage.communicationTab.email.name.sendKeys(sample.e);
        projectSettingsPage.communicationTab.button.click();

        browser.navigate().refresh();
        projectSettingsPage.tabs.communication.click();

        expect<any>(projectSettingsPage.communicationTab.sms.accountId.getAttribute('value')).toBe(sample.a);
        expect<any>(projectSettingsPage.communicationTab.sms.authToken.getAttribute('value')).toBe(sample.b);
        expect<any>(projectSettingsPage.communicationTab.sms.number.getAttribute('value')).toBe(sample.c);
        expect<any>(projectSettingsPage.communicationTab.email.address.getAttribute('value')).toBe(sample.d);
        expect<any>(projectSettingsPage.communicationTab.email.name.getAttribute('value')).toBe(sample.e);
      });

    });

  });

});
