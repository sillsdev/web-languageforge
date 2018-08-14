import {browser, by, ExpectedConditions, utils} from 'protractor';

import {BellowsLoginPage} from '../../bellows/shared/login.page';
import {Utils} from '../../bellows/shared/utils';
import {SfProjectSettingsPage} from './shared/project-settings.page';
import {SfProjectPage} from './shared/project.page';

describe('SFChecks E2E project settings page - project manager', async () => {
  const constants = require('../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectPage = new SfProjectPage();
  const projectSettingsPage = new SfProjectSettingsPage();
  const util = new Utils();

  it('setup: logout, login as project manager, go to project settings', async () => {
    await BellowsLoginPage.logout();
    await loginPage.loginAsManager();
    await projectSettingsPage.get(constants.testProjectName);
  });

  describe('members tab', async () => {
    let memberCount = 0;

    it('setup: click on tab', async () => {
      await expect<any>(projectSettingsPage.tabs.members.isPresent()).toBe(true);
      await projectSettingsPage.tabs.members.click();
    });

    it('can list project members', async () => {
      await expect(projectSettingsPage.membersTab.list.count()).toBeGreaterThan(0);
      await projectSettingsPage.membersTab.list.count().then( val => { memberCount = val; });
    });

    it('can filter the list of members', async () => {
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
      await projectSettingsPage.membersTab.listFilter.sendKeys(constants.managerUsername);
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(1);
      await projectSettingsPage.membersTab.listFilter.clear();
    });

    it('can add a new user as a member', async () => {
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
      await projectSettingsPage.membersTab.addButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.membersTab.newMember.input),
        Utils.conditionTimeout);
      await projectSettingsPage.membersTab.newMember.input.sendKeys('du');

      // sendKeys is split to force correct button behaviour. IJH 2015-10
      await projectSettingsPage.membersTab.newMember.input.sendKeys('de');
      await projectSettingsPage.membersTab.newMember.button.click();
      await projectSettingsPage.membersTab.waitForNewUserToLoad(memberCount);
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount + 1);
    });

    it('can not add the same user twice', async () => {
      await projectSettingsPage.membersTab.newMember.input.clear();
      await projectSettingsPage.membersTab.newMember.input.sendKeys('dude');
      await expect(projectSettingsPage.membersTab.newMember.button.isEnabled()).toBeFalsy();
      await expect(projectSettingsPage.membersTab.newMember.warning.isDisplayed()).toBeTruthy();
      await projectSettingsPage.membersTab.newMember.input.clear();
    });

    it('can change the role of a member', async () => {
      await projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      await browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.membersTab.list.first()
        .element(by.model('user.role'))));
      await Utils.clickDropdownByValue(projectSettingsPage.membersTab.list.first().element(by.model('user.role')),
        'Manager');
      await expect<any>(projectSettingsPage.membersTab.list.first().element(by.model('user.role'))
        .element(by.css('option:checked')).getText()).toEqual('Manager');
      await projectSettingsPage.membersTab.listFilter.clear();
    });

    it('can remove a member', async () => {
      await projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      await projectSettingsPage.membersTab.list.first().element(by.css('input[type="checkbox"]')).click();
      await projectSettingsPage.membersTab.removeButton.click();
      await projectSettingsPage.membersTab.listFilter.clear();
      await projectSettingsPage.membersTab.listFilter.sendKeys('dude');
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(0);
      await projectSettingsPage.membersTab.listFilter.clear();
      await expect<any>(projectSettingsPage.membersTab.list.count()).toBe(memberCount);
    });

    // it('can message selected user', function() {});  // how can we test this? - cjh

  });

  describe('question templates tab', async () => {

    it('setup: click on tab', async () => {
      await expect<any>(projectSettingsPage.tabs.templates.isPresent()).toBe(true);
      await projectSettingsPage.tabs.templates.click();
    });

    it('can list templates', async () => {
      await expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(2);
    });

    it('can add a template', async () => {
      await projectSettingsPage.templatesTab.addButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.templatesTab.editor.title),
        Utils.conditionTimeout);
      await projectSettingsPage.templatesTab.editor.title.sendKeys('sound check');
      await projectSettingsPage.templatesTab.editor.description
        .sendKeys('What do you think of when I say the words... "boo"');
      await projectSettingsPage.templatesTab.editor.saveButton.click();
      await expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(3);
      await expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
    });

    it('can update an existing template', async () => {
      await projectSettingsPage.templatesTab.list.last().element(by.linkText('sound check')).click();
      await browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.templatesTab.editor.saveButton),
        Utils.conditionTimeout);
      await expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(true);
      await projectSettingsPage.templatesTab.editor.title.clear();
      await projectSettingsPage.templatesTab.editor.title.sendKeys('test12');
      await projectSettingsPage.templatesTab.editor.saveButton.click();
      await browser.wait(ExpectedConditions.invisibilityOf(projectSettingsPage.templatesTab.editor.saveButton),
        Utils.conditionTimeout);
      await expect<any>(projectSettingsPage.templatesTab.editor.saveButton.isDisplayed()).toBe(false);
      await expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(3);
    });

    it('can delete a template', async () => {
      await projectSettingsPage.templatesTab.list.last().element(by.css('input[type="checkbox"]')).click();
      await projectSettingsPage.templatesTab.removeButton.click();
      await expect<any>(projectSettingsPage.templatesTab.list.count()).toBe(2);
    });

  });

  // The Archived Texts tab is tested as part of a process in the Project page tests. IJH 2014-06

  describe('project properties tab', async () => {
    const newName = constants.thirdProjectName;

    it('setup: click on tab', async () => {
      await loginPage.loginAsManager();
      await projectSettingsPage.get(constants.testProjectName);
      await expect<any>(projectSettingsPage.tabs.project.isPresent()).toBe(true);
      await projectSettingsPage.tabs.project.click();
    });

    it('can read properties', async () => {
      await expect(projectSettingsPage.projectTab.name.getAttribute('value')).toBe(constants.testProjectName);
      await expect(projectSettingsPage.projectTab.allowAudioDownload.getAttribute('checked')).toBeTruthy();
    });

    it('can change properties and verify they persist', async () => {
      await projectSettingsPage.projectTab.name.clear();
      await projectSettingsPage.projectTab.name.sendKeys(newName);
      await projectSettingsPage.projectTab.allowAudioDownload.click();
      await projectSettingsPage.projectTab.saveButton.click();
      await browser.navigate().refresh();
      await projectSettingsPage.tabs.project.click();
      await expect(projectSettingsPage.projectTab.name.getAttribute('value')).toBe(newName);
      await expect(projectSettingsPage.projectTab.allowAudioDownload.getAttribute('checked')).toBeFalsy();
      await projectSettingsPage.get(newName);
      await projectSettingsPage.tabs.project.click();
      await projectSettingsPage.projectTab.name.clear();
      await projectSettingsPage.projectTab.name.sendKeys(constants.testProjectName);
      await expect<any>(projectSettingsPage.noticeList.count()).toBe(0);
      await projectSettingsPage.projectTab.saveButton.click();
      await expect<any>(projectSettingsPage.noticeList.count()).toBe(1);
      await projectSettingsPage.lastNoticeCloseButton.click();
    });

  });

  describe('user profile lists', async () => {

    it('setup: click on tab and select the Study Group list for editing and display', async () => {
      await projectSettingsPage.tabs.optionlists.click();
      await util.findRowByText(projectSettingsPage.optionlistsTab.editList, 'Study Group').then(row => {
        row.click();
      });
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsLabel.getText()).toEqual('Study Group');
      await util.findRowByText(projectSettingsPage.optionlistsTab.showList, 'Study Group').then(async row => {
        await row.click();
        await expect<any>(row.element(by.tagName('input')).isSelected()).toBe(true);
      });
    });

    it('can add two values to a list', async () => {
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(0);
      await projectSettingsPage.optionlistsTab.addInput.sendKeys('foo');
      await projectSettingsPage.optionlistsTab.addButton.click();
      await browser.wait(ExpectedConditions.visibilityOf(projectSettingsPage.optionlistsTab.addInput),
        Utils.conditionTimeout);
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
      await projectSettingsPage.optionlistsTab.addInput.sendKeys('bar');
      await projectSettingsPage.optionlistsTab.addButton.click();
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(2);
    });

    it('can delete a value from the list', async () => {
      const firstEditContentsList = projectSettingsPage.optionlistsTab.editContentsList.first();
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(2);
      await projectSettingsPage.optionlistsTab.deleteButton(firstEditContentsList).click();
      await browser.sleep(1000);
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
    });

    it('should persist data', async () => {

      await expect<any>(projectSettingsPage.noticeList.count()).toBe(0);
      await projectSettingsPage.optionlistsTab.saveButton.click();
      await expect<any>(projectSettingsPage.noticeList.count()).toBe(1);
      await projectSettingsPage.lastNoticeCloseButton.click();
      await Utils.clickBreadcrumb(constants.thirdProjectName);
      await expect<any>(projectPage.newText.showFormButton.isDisplayed()).toBe(true);
      await projectSettingsPage.clickOnSettingsLink();
      await expect<any>(projectSettingsPage.tabs.optionlists.isDisplayed()).toBe(true);
      await projectSettingsPage.tabs.optionlists.click();
      await util.findRowByText(projectSettingsPage.optionlistsTab.editList, 'Study Group').then(async row => {
        await row.click();
      });
      await util.findRowByText(projectSettingsPage.optionlistsTab.showList, 'Study Group').then(async row => {
        await expect<any>(row.element(by.tagName('input')).isSelected()).toBe(true);
      });
      await expect<any>(projectSettingsPage.optionlistsTab.editContentsList.count()).toBe(1);
    });

  });

  describe('communication settings tab', async () => {

    it('is visible for project manager', async () => {
      await browser.wait(() => projectSettingsPage.tabs.communication, Utils.conditionTimeout);
      await expect<any>(projectSettingsPage.tabs.communication.isDisplayed()).toBe(true);
    });

    describe('as a system admin', async () => {
      it('setup: logout, login as system admin, go to project settings', async () => {
        await browser.sleep(1000);
        await BellowsLoginPage.logout();
        await loginPage.loginAsAdmin();
        await projectSettingsPage.get(constants.testProjectName);
      });

      it('the communication settings tab is visible', async () => {
        await expect<any>(projectSettingsPage.tabs.communication.isPresent()).toBe(true);
        await projectSettingsPage.tabs.communication.click();
      });

      it('can persist communication fields', async () => {
        await expect<any>(projectSettingsPage.communicationTab.sms.accountId.getAttribute('value')).toBe('');
        await expect<any>(projectSettingsPage.communicationTab.sms.authToken.getAttribute('value')).toBe('');
        await expect<any>(projectSettingsPage.communicationTab.sms.number.getAttribute('value')).toBe('');
        await expect<any>(projectSettingsPage.communicationTab.email.address.getAttribute('value')).toBe('');
        await expect<any>(projectSettingsPage.communicationTab.email.name.getAttribute('value')).toBe('');

        const sample = { a: '12345', b: '78', c: '90', d: 'email@me.com', e: 'John Smith' };
        await projectSettingsPage.communicationTab.sms.accountId.sendKeys(sample.a);
        await projectSettingsPage.communicationTab.sms.authToken.sendKeys(sample.b);
        await projectSettingsPage.communicationTab.sms.number.sendKeys(sample.c);
        await projectSettingsPage.communicationTab.email.address.sendKeys(sample.d);
        await projectSettingsPage.communicationTab.email.name.sendKeys(sample.e);
        await projectSettingsPage.communicationTab.button.click();

        await browser.navigate().refresh();
        // await browser.sleep(600);
        await projectSettingsPage.tabs.communication.click();

        await expect<any>(projectSettingsPage.communicationTab.sms.accountId.getAttribute('value')).toBe(sample.a);
        await expect<any>(projectSettingsPage.communicationTab.sms.authToken.getAttribute('value')).toBe(sample.b);
        await expect<any>(projectSettingsPage.communicationTab.sms.number.getAttribute('value')).toBe(sample.c);
        await expect<any>(projectSettingsPage.communicationTab.email.address.getAttribute('value')).toBe(sample.d);
        await expect<any>(projectSettingsPage.communicationTab.email.name.getAttribute('value')).toBe(sample.e);
      });

    });

  });

});
