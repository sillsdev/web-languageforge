import {browser, protractor} from 'protractor';

import {BellowsLoginPage} from '../../../bellows/shared/login.page';
import {ProjectsPage} from '../../../bellows/shared/projects.page';
import {Utils} from '../../../bellows/shared/utils';
import {ConfigurationPage} from '../shared/configuration.page';
import {EditorPage} from '../shared/editor.page';

describe('Lexicon E2E Configuration Fields', () => {
  const constants = require('../../../testConstants.json');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const editorPage = new EditorPage();
  const configPage = new ConfigurationPage();
  const util = new Utils();

  it('setup: login as manager, select test project and first entry', async () => {
    await loginPage.loginAsManager();
    await projectsPage.get();
    await projectsPage.clickOnProject(constants.testProjectName);
    await editorPage.edit.toListLink.click();
    await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
    expect(await editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('check first entry for field order', async () => {
    await editorPage.edit.showHiddenFields();
    expect<any>(await editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
    expect<any>(await editorPage.edit.getFieldLabel(1).getText()).toEqual('Citation Form');
    expect<any>(await editorPage.edit.getFieldLabel(2).getText()).toEqual('Pronunciation');
  });

  it('check first entry for field-specific input systems', async () => {
    const citationFormLabel = 'Citation Form';
    const scientificNameLabel = 'Scientific Name';
    expect<any>(await editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
    expect<any>(await editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
    expect<any>(await editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(1);
    expect<any>(await editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
  });

  it('can go to Configuration and select unified Fields tab', async () => {
    expect<any>(await configPage.settingsMenuLink.isPresent()).toBe(true);
    await configPage.get();
    expect<any>(await configPage.applyButton.isDisplayed()).toBe(true);
    expect<any>(await configPage.applyButton.isEnabled()).toBe(false);
    await configPage.tabs.unified.click();
    expect<any>(await configPage.unifiedPane.inputSystem.addInputSystemButton.isDisplayed()).toBe(true);
  });

  it('check Apply button is enabled on changes', async () => {
    expect<any>(await configPage.applyButton.isEnabled()).toBe(false);
    await configPage.unifiedPane.observerCheckbox('English').click();
    expect<any>(await configPage.applyButton.isEnabled()).toBe(true);
    await configPage.unifiedPane.observerCheckbox('English').click();
    expect<any>(await configPage.applyButton.isEnabled()).toBe(false);
  });

  describe('Field-Specific Settings', () => {

    it('check sense POS has no field-specific settings', async () => {
      const rowLabel = new RegExp('^Part of Speech$');
      expect<any>(await configPage.unifiedPane.fieldSpecificButton(rowLabel).isPresent()).toBe(false);
    });

    it('check sense Pictures "Caption Hidden if Empty" field-specific setting', async () => {
      const rowLabel = new RegExp('^Pictures$');
      expect<any>(await configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      expect<any>(await configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-chevron-down');
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(await configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isDisplayed()).toBe(true);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(await configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isPresent()).toBe(false);
    });

    it('check sense field-specific settings', async () => {
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(await configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      expect<any>(await configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-chevron-down');
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(await configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isPresent()).toBe(false);
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(await configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-chevron-down');
      await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      await util.setCheckbox(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1), true);
      expect<any>(await configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 0).isSelected()).toBe(true);
      expect<any>(await configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1).isSelected()).toBe(true);
    });

  });

  describe('Reorder Rows', () => {
    // Since the drag and drop module inserts items below that row if they are dropped at the middle or below of that
    // row, and Utils.simulateDragDrop uses the middle of a row, then set the target to one row above where you want it.
    // IJH 2018-03

    it('can reorder Input System rows', async () => {
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai');
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai (IPA)');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.inputSystem.rows().get(2).getWebElement(),
        configPage.unifiedPane.inputSystem.rows().get(0).getWebElement());
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai (IPA)');
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai');
    });

    it('can reorder Entry rows', async () => {
      expect<any>(await configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        configPage.unifiedPane.entry.rows().get(0).getWebElement());
      expect<any>(await configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Pronunciation');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field order', async () => {
      expect<any>(await configPage.applyButton.isEnabled()).toBe(true);
      await configPage.applyButton.click();
      expect<any>(await configPage.applyButton.isEnabled()).toBe(false);
      await Utils.clickBreadcrumb(constants.testProjectName);
      await editorPage.edit.toListLink.click();
      await editorPage.browse.clickEntryByLexeme(constants.testEntry1.lexeme.th.value);
      await editorPage.edit.showHiddenFields();
      expect<any>(await editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
      expect<any>(await editorPage.edit.getFieldLabel(1).getText()).toEqual('Pronunciation');
      expect<any>(await editorPage.edit.getFieldLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field-specific input systems', async () => {
      const citationFormLabel = 'Citation Form';
      const scientificNameLabel = 'Scientific Name';
      expect<any>(await editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
      expect<any>(await editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(2);
      expect<any>(await editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
      expect<any>(await editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(1).getText()).toEqual('th');
      await configPage.get();
      await configPage.tabs.unified.click();
    });

    it('can restore sense field-specific settings back to how they were', async () => {
      const rowLabel = new RegExp('^Scientific Name$');
      const wordChevron = await configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class');
      if (wordChevron.includes('fa-chevron-down')) {
        await configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      }
      await util.setCheckbox(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1), false);
    });

    it('can reorder Entry rows back to how they were', async () => {
      await browser.executeScript(Utils.simulateDragDrop, await configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        await configPage.unifiedPane.entry.rows().get(0).getWebElement());
      expect<any>(await configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      expect<any>(await configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      await configPage.applyButton.click();
    });

    it('can reorder Sense rows', async () => {
      expect<any>(await configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      expect<any>(await configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Definition');
      expect<any>(await configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Pictures');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.sense.rows().get(2).getWebElement(),
        configPage.unifiedPane.sense.rows().get(0).getWebElement());
      expect<any>(await configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      expect<any>(await configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Pictures');
      expect<any>(await configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Definition');
    });

    it('can reorder Example rows', async () => {
      expect<any>(await configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      expect<any>(await configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Translation');
      expect<any>(await configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Reference');
      await browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.example.rows().get(2).getWebElement(),
        configPage.unifiedPane.example.rows().get(0).getWebElement());
      expect<any>(await configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      expect<any>(await configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Reference');
      expect<any>(await configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Translation');
    });

  });

  describe('Select All for Columns', () => {

    it('can fully function "Select All" down the Input System observer column', async () => {
      const column = 'observer';
      const rowLabel = 'English';
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
    });

    it('can select and de-select all down the Input System commenter column', async () => {
      const column = 'commenter';
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can select and de-select all down the Input System contributor column', async () => {
      const column = 'contributor';
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can select and de-select all down the Input System manager column', async () => {
      const column = 'manager';
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry observer column', async () => {
      const column = 'observer';
      expect<any>(await configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, false);
      expect<any>(await configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, true);
      expect<any>(await configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the entry commenter column', async () => {
      const column = 'commenter';
      const rowLabel = new RegExp('^Location$');
      expect<any>(await configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, false);
      expect<any>(await configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, true);
      expect<any>(await configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry contributor column', async () => {
      const column = 'contributor';
      expect<any>(await configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, false);
      expect<any>(await configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, true);
      expect<any>(await configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry manager column', async () => {
      const column = 'manager';
      expect<any>(await configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, false);
      expect<any>(await configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, true);
      expect<any>(await configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense observer column', async () => {
      const column = 'observer';
      expect<any>(await configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, false);
      expect<any>(await configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, true);
      expect<any>(await configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense commenter column', async () => {
      const column = 'commenter';
      expect<any>(await configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, false);
      expect<any>(await configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, true);
      expect<any>(await configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the sense contributor column', async () => {
      const column = 'contributor';
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(await configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, false);
      expect<any>(await configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, true);
      expect<any>(await configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense manager column', async () => {
      const column = 'manager';
      expect<any>(await configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, false);
      expect<any>(await configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, true);
      expect<any>(await configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example observer column', async () => {
      const column = 'observer';
      expect<any>(await configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, false);
      expect<any>(await configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, true);
      expect<any>(await configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example commenter column', async () => {
      const column = 'commenter';
      expect<any>(await configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, false);
      expect<any>(await configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, true);
      expect<any>(await configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example contributor column', async () => {
      const column = 'contributor';
      expect<any>(await configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, false);
      expect<any>(await configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, true);
      expect<any>(await configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the example manager column', async () => {
      const column = 'manager';
      const rowLabel = new RegExp('^Reference');
      expect<any>(await configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, false);
      expect<any>(await configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, true);
      expect<any>(await configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

  });

  describe('Select All for Rows', () => {

    it('can fully function "Select All" along an Input System row', async () => {
      const rowLabel = new RegExp('^Thai$');
      expect<any>(await configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
    });

    it('can fully function "Select All" along an entry row', async () => {
      const rowLabel = new RegExp('^Location$');
      expect<any>(await configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along a sense row', async () => {
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(await configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along an example row', async () => {
      const rowLabel = new RegExp('^Reference');
      expect<any>(await configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

  });

  describe('Member-Specific Settings', () => {
    let rowNumber = 0;

    it('can count number of Input System rows', async () => {
      await configPage.unifiedPane.inputSystem.rows().count().then(count => rowNumber = count);
    });

    it('can add a member-specific user settings', async () => {
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      await configPage.unifiedPane.entry.addGroupButton.click();
      await browser.wait(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed(), 500);
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      expect<any>(await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(6);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(await configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0).count()).toEqual(rowNumber);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0), true)).toBe(true);
    });

    it('cannot add the same member-specific user settings', async () => {
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      await configPage.unifiedPane.entry.addGroupButton.click();
      await browser.wait(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed(), 500);
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(5);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
    });

    it('can add a second member-specific user settings', async () => {
      const rowLabel = 'English';
      await configPage.unifiedPane.entry.addGroupButton.click();
      await browser.wait(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed(), 500);
      expect<any>(await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      await configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.memberUsername + protractor.Key.ENTER);
      await configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(2);
      expect<any>(await configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1).count()).toEqual(rowNumber);
      expect<any>(await configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(7);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1), true)).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.groupColumnCheckboxes(1), true)).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.groupColumnCheckboxes(1), true)).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.groupColumnCheckboxes(1), true)).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), true))
        .toBe(true);
    });

    it('can fully function "Select All" down a Input System member-specific column', async () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      expect<any>(await configPage.unifiedPane.inputSystem.rowLabel(rowIndex).getText()).toEqual(rowLabel);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(true);
    });

    it('check cross-over Select All row and column', async () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), false);
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(false);
      expect<any>(await configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      await util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
    });

    it('can remove member-specific user settings', async () => {
      // Setup, resetting state changed by previous tests
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, true);
      await util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, true);

      // Exercise
      await configPage.unifiedPane.entry.removeGroupButton(0).click();
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      await configPage.unifiedPane.entry.removeGroupButton(0).click();
      expect<any>(await configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(await Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), true))
        .toBe(true);
    });

  });

  describe('Custom Fields', () => {
    const customDisplayName = 'cust_name';
    let rowNumber = 0;

    it('can discard Configuration changes', async () => {
      await Utils.clickBreadcrumb(constants.testProjectName);
      await configPage.get();
      await configPage.tabs.unified.click();
      expect<any>(await configPage.applyButton.isEnabled()).toBe(false);
    });

    it('can count number of entry rows', async () => {
      await configPage.unifiedPane.entry.rows().count().then(count => rowNumber = count);
    });

  });

});
