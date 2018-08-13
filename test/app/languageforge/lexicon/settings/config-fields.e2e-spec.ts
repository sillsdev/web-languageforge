import {browser, ExpectedConditions, protractor} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {ConfigurationPage} from '../shared/configuration.page';
import {EditorPage} from '../shared/editor.page';

describe('Lexicon E2E Configuration Fields', async () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage = new EditorPage();
  const configPage = new ConfigurationPage();
  const util = new Utils();

  it('setup: login as manager, select test project and first entry', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProjectName(constants.testProjectName);
    await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    await expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('check first entry for field order', async () => {
    await editorPage.edit.showHiddenFields();
    await browser.wait(() => editorPage.edit.getFieldLabel(0), Utils.conditionTimeout);
    await expect<any>(editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
    await expect<any>(editorPage.edit.getFieldLabel(1).getText()).toEqual('Citation Form');
    await expect<any>(editorPage.edit.getFieldLabel(2).getText()).toEqual('Pronunciation');
  });

  it('check first entry for field-specific input systems', async () => {
    const citationFormLabel = 'Citation Form';
    const scientificNameLabel = 'Scientific Name';
    await browser.wait(() => editorPage.edit.getMultiTextInputSystems(citationFormLabel), Utils.conditionTimeout);
    await expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
    await expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
    await browser.wait(() => editorPage.edit.getMultiTextInputSystems(scientificNameLabel), Utils.conditionTimeout);
    await expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(1);
    await expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
  });

  it('can go to Configuration and select unified Fields tab', async () => {
    await expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    await configPage.get();
    await browser.wait(() => configPage.applyButton, Utils.conditionTimeout);
    await expect<any>(configPage.applyButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    await configPage.tabs.unified.click();
    await browser.wait(() => configPage.unifiedPane.inputSystem.addInputSystemButton, Utils.conditionTimeout);
    await expect<any>(configPage.unifiedPane.inputSystem.addInputSystemButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.unifiedPane.entry.addCustomEntryButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.unifiedPane.sense.addCustomSenseButton.isDisplayed()).toBe(true);
    await expect<any>(configPage.unifiedPane.example.addCustomExampleButton.isDisplayed()).toBe(true);
  });

  it('check Apply button is enabled on changes', async () => {
    await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    await configPage.unifiedPane.observerCheckbox('English').click();
    await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    await configPage.unifiedPane.observerCheckbox('English').click();
    await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  describe('Field-Specific Settings', async () => {

    it('check sense POS has no field-specific settings', async () => {
      const rowLabel = new RegExp('^Part of Speech$');
      await expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isPresent()).toBe(false);
    });

    it('check sense Pictures "Caption Hidden if Empty" field-specific setting', async () => {
      const rowLabel = new RegExp('^Pictures$');
      await expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      await expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-check-square-o');
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isDisplayed()).toBe(true);
      await expect<any>(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isDisplayed()).
        toBe(true);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
    });

    it('check sense field-specific settings', async () => {
      const rowLabel = new RegExp('^Scientific Name$');
      await expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      await expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-check-square-o');
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await expect<any>(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isPresent()).
        toBe(false);
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isDisplayed()).toBe(true);
      await expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel), false);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-chevron-down');
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await util.setCheckbox(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1), true);
      await expect<any>(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 0).isSelected()).
        toBe(true);
      await expect<any>(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1).isSelected()).
        toBe(true);
    });

  });

  describe('Reorder Rows', async () => {
    // Since the drag and drop module inserts items below that row if they are dropped at the middle or below of that
    // row, and Utils.simulateDragDrop uses the middle of a row, then set the target to one row above where you want it.
    // IJH 2018-03

    it('can reorder Input System rows', async () => {
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai');
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai (IPA)');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.inputSystem.rows().get(2).
        getWebElement(), configPage.unifiedPane.inputSystem.rows().get(0).getWebElement());
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai (IPA)');
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai');
    });

    it('can reorder Entry rows', async () => {
      await browser.wait(() => configPage.unifiedPane.entry.rowLabel(0), Utils.conditionTimeout);
      await expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        configPage.unifiedPane.entry.rows().get(0).getWebElement());
      await expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Pronunciation');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field order', async () => {
      await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
      await configPage.applyButton.click();
      await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
      await Utils.clickBreadcrumb(constants.testProjectName);
      await editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
      await editorPage.edit.showHiddenFields();
      await expect<any>(editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
      await expect<any>(editorPage.edit.getFieldLabel(1).getText()).toEqual('Pronunciation');
      await expect<any>(editorPage.edit.getFieldLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field-specific input systems', async () => {
      const citationFormLabel = 'Citation Form';
      const scientificNameLabel = 'Scientific Name';
      // await browser.wait(() => editorPage.edit.getMultiTextInputSystems(citationFormLabel), Utils.conditionTimeout);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
    // await browser.wait(() => editorPage.edit.getMultiTextInputSystems(scientificNameLabel), Utils.conditionTimeout);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(2);
      await expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
      await expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(1).getText()).toEqual('th');
      await configPage.get();
      await configPage.tabs.unified.click();
    });

    it('can reorder Entry rows back to how they were', async () => {
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        configPage.unifiedPane.entry.rows().get(0).getWebElement());
      // await browser.wait(() => configPage.unifiedPane.entry.rowLabel(0), Utils.conditionTimeout);
      await expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      await expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      await configPage.applyButton.click();
    });

    it('can reorder Sense rows', async () => {
      // await browser.wait(() => configPage.unifiedPane.sense.rowLabel(0), Utils.conditionTimeout);
      await expect<any>(configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      await expect<any>(configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Definition');
      await expect<any>(configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Pictures');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.sense.rows().get(2).getWebElement(),
        configPage.unifiedPane.sense.rows().get(0).getWebElement());
      // await browser.wait(() => configPage.unifiedPane.sense.rowLabel(0), Utils.conditionTimeout);
      await expect<any>(configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      await expect<any>(configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Pictures');
      await expect<any>(configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Definition');
    });

    it('can reorder Example rows', async () => {
      await expect<any>(configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      await expect<any>(configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Translation');
      await expect<any>(configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Reference');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.example.rows().get(2).getWebElement(),
        configPage.unifiedPane.example.rows().get(0).getWebElement());
      await expect<any>(configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      await expect<any>(configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Reference');
      await expect<any>(configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Translation');
    });

  });

  describe('Select All for Columns', async () => {

    it('can fully function "Select All" down the Input System observer column', async () => {
      const column = 'observer';
      const rowLabel = 'English';
      await browser.wait(() => configPage.unifiedPane.observerCheckbox(rowLabel), Utils.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      await browser.wait(() => configPage.unifiedPane.inputSystem.selectAll.observer, Utils.conditionTimeout);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      await browser.wait(() => configPage.unifiedPane.inputSystem.selectAll.observer, Utils.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await browser.wait(() => configPage.unifiedPane.observerCheckbox(rowLabel), Utils.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(false);
      await browser.wait(() => configPage.unifiedPane.observerCheckbox(rowLabel), Utils.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await browser.wait(() => configPage.unifiedPane.inputSystem.selectAll.observer, Utils.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System commenter column', async () => {
      const column = 'commenter';
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System contributor column', async () => {
      const column = 'contributor';
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System manager column', async () => {
      const column = 'manager';
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can de-select and select all down the entry observer column', async () => {
      const column = 'observer';
      await expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, false);
      await expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await browser.wait(ExpectedConditions.visibilityOf(configPage.unifiedPane.entry.selectAll.observer),
        constants.conditionTimeout);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, true);
      await expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      await browser.wait(ExpectedConditions.visibilityOf(configPage.unifiedPane.entry.selectAll.observer),
        constants.conditionTimeout);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the entry commenter column', async () => {
      const column = 'commenter';
      const rowLabel = new RegExp('^Location$');
      await expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, false);
      await expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, true);
      await expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry contributor column', async () => {
      const column = 'contributor';
      await expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, false);
      await expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, true);
      await expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry manager column', async () => {
      const column = 'manager';
      await expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, false);
      await expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, true);
      await expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense observer column', async () => {
      const column = 'observer';
      await expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, false);
      await expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, true);
      await expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense commenter column', async () => {
      const column = 'commenter';
      await expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, false);
      await expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, true);
      await expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the sense contributor column', async () => {
      const column = 'contributor';
      const rowLabel = new RegExp('^Scientific Name$');
      await expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, false);
      await expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, true);
      await expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense manager column', async () => {
      const column = 'manager';
      await expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, false);
      await expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, true);
      await expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example observer column', async () => {
      const column = 'observer';
      await expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, false);
      await expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, true);
      await expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example commenter column', async () => {
      const column = 'commenter';
      await expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, false);
      await expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, true);
      await expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example contributor column', async () => {
      const column = 'contributor';
      await expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, false);
      await expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, true);
      await expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the example manager column', async () => {
      const column = 'manager';
      const rowLabel = new RegExp('^Reference');
      await expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, false);
      await expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, true);
      await expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

  });

  describe('Select All for Rows', () => {

    it('can fully function "Select All" along an Input System row', async () => {
      const rowLabel = new RegExp('^Thai$');
      await expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
    });

    it('can fully function "Select All" along an entry row', async () => {
      const rowLabel = new RegExp('^Location$');
      await expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along a sense row', async () => {
      const rowLabel = new RegExp('^Scientific Name$');
      await expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along an example row', async () => {
      const rowLabel = new RegExp('^Reference');
      await expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      await await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

  });

  describe('Member-Specific Settings', async () => {
    let rowNumber = 0;

    it('can count number of Input System rows', async () => {
      await configPage.unifiedPane.inputSystem.rows().count().then(count => rowNumber = count);
    });

    it('can add a member-specific user settings', async () => {
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      await configPage.unifiedPane.entry.addGroupButton.click();
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      await expect<any>(configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(6);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      await expect<any>(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0).count()).toEqual(rowNumber);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0), false)).
        toBe(true);
    });

    it('cannot add the same member-specific user settings', async () => {
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      await configPage.unifiedPane.entry.addGroupButton.click();
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(5);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
    });

    it('can add a second member-specific user settings', async () => {
      const rowLabel = 'English';
      await configPage.unifiedPane.entry.addGroupButton.click();
      await expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.memberUsername + protractor.Key.ENTER);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(2);
      await expect<any>(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1).count()).toEqual(rowNumber);
      await expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(7);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1), false)).
        toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), false))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.groupColumnCheckboxes(1), false)).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), false))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.groupColumnCheckboxes(1), false)).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), false))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.groupColumnCheckboxes(1), false)).
        toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), false))
        .toBe(true);
    });

    it('can fully function "Select All" down a Input System member-specific column', async () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      await expect<any>(configPage.unifiedPane.inputSystem.rowLabel(rowIndex).getText()).toEqual(rowLabel);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).
        toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex),
        false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).
        toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).
        toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        false)).toBe(true);
    });

    it('check cross-over Select All row and column', async () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        true)).toBe(true);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex),
        false);
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).
        toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex),
        false)).toBe(false);
      await expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
    });

    it('can remove member-specific user settings', async () => {
      await configPage.unifiedPane.entry.removeGroupButton(0).click();
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      await configPage.unifiedPane.entry.removeGroupButton(0).click();
      await expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), false))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), true))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), true))
        .toBe(true);
      await expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), true))
        .toBe(true);
    });

  });

  describe('Custom Fields', async () => {
    const customDisplayName = 'cust_name';
    let rowNumber = 0;

    it('can discard Configuration changes', async () => {
      await Utils.clickBreadcrumb(constants.testProjectName);
      await configPage.get();
      await configPage.tabs.unified.click();
      await expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    });

    it('can count number of entry rows', async () => {
      await configPage.unifiedPane.entry.rows().count().then(count => rowNumber = count);
    });

    it('can open the custom field modal for an entry', async () => {
      await expect<any>(configPage.unifiedPane.entry.addCustomEntryButton.isEnabled()).toBe(true);
      await configPage.unifiedPane.entry.addCustomEntryButton.click();
      await expect<any>(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.typeDropdown.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      await expect<any>(configPage.modal.customField.addButton.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field name', async () => {
      await expect<any>(configPage.modal.customField.fieldCodeExists.isPresent()).toBe(true);
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      await configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      await expect<any>(configPage.modal.customField.addButton.getText()).toEqual('Add ' + customDisplayName);
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field type', async () => {
      await Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-input-system Text');
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can add custom field', async () => {
      await configPage.modal.customField.addButton.click();
      await expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      await expect<any>(configPage.unifiedPane.entry.rows().count()).toEqual(rowNumber + 1);
      await expect<any>(configPage.unifiedPane.entry.rowLabelCustomInput(rowNumber).getAttribute('value'))
        .toEqual(customDisplayName);
      await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('cannot add a duplicate field name', async () => {
      await configPage.unifiedPane.entry.addCustomEntryButton.click();
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      await configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can cancel custom entry field modal', async () => {
      await configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      await expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('can add a duplicate field name for a sense', async () => {
      await configPage.unifiedPane.sense.addCustomSenseButton.click();
      await expect<any>(configPage.modal.customField.displayNameInput.getAttribute('value')).toEqual('');
      await configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      await expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('list code only shows when a list type is selected', async () => {
      await Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      await expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
      await Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-option List');
      await expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      await Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Option List');
      await expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a list code', async () => {
      await Utils.clickDropdownByValue(configPage.modal.customField.listCodeDropdown, 'Part of Speech');
      await expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can cancel custom sense field modal', async () => {
      await configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      await expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      await expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

});
