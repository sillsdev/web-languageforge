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

  it('setup: login as manager, select test project and first entry', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.getFirstLexeme()).toEqual(constants.testEntry1.lexeme.th.value);
  });

  it('check first entry for field order', () => {
    editorPage.edit.showHiddenFields();
    expect<any>(editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
    expect<any>(editorPage.edit.getFieldLabel(1).getText()).toEqual('Citation Form');
    expect<any>(editorPage.edit.getFieldLabel(2).getText()).toEqual('Pronunciation');
  });

  it('check first entry for field-specific input systems', () => {
    const citationFormLabel = 'Citation Form';
    const scientificNameLabel = 'Scientific Name';
    expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
    expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
    expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(1);
    expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
  });

  it('can go to Configuration and select unified Fields tab', () => {
    expect<any>(configPage.settingsMenuLink.isDisplayed()).toBe(true);
    configPage.get();
    expect<any>(configPage.applyButton.isDisplayed()).toBe(true);
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    configPage.tabs.unified.click();
    expect<any>(configPage.unifiedPane.inputSystem.addInputSystemButton.isDisplayed()).toBe(true);
    expect<any>(configPage.unifiedPane.entry.addCustomEntryButton.isDisplayed()).toBe(true);
    expect<any>(configPage.unifiedPane.sense.addCustomSenseButton.isDisplayed()).toBe(true);
    expect<any>(configPage.unifiedPane.example.addCustomExampleButton.isDisplayed()).toBe(true);
  });

  it('check Apply button is enabled on changes', () => {
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    configPage.unifiedPane.observerCheckbox('English').click();
    expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    configPage.unifiedPane.observerCheckbox('English').click();
    expect<any>(configPage.applyButton.isEnabled()).toBe(false);
  });

  describe('Field-Specific Settings', () => {

    it('check sense POS has no field-specific settings', () => {
      const rowLabel = new RegExp('^Part of Speech$');
      expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isPresent()).toBe(false);
    });

    it('check sense Pictures "Caption Hidden if Empty" field-specific setting', () => {
      const rowLabel = new RegExp('^Pictures$');
      expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-check-square-o');
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
      configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isDisplayed()).toBe(true);
      expect<any>(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isDisplayed()).toBe(true);
      configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
    });

    it('check sense field-specific settings', () => {
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(configPage.unifiedPane.fieldSpecificButton(rowLabel).isDisplayed()).toBe(true);
      expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-check-square-o');
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isPresent()).toBe(false);
      configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(configPage.unifiedPane.fieldSpecificCaptionHiddenIfEmptyCheckbox(rowLabel).isPresent()).toBe(false);
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isDisplayed()).toBe(true);
      expect<any>(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel).isSelected()).toBe(true);
      util.setCheckbox(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel), false);
      configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      expect<any>(configPage.unifiedPane.fieldSpecificIcon(rowLabel).getAttribute('class'))
        .toEqual('fa fa-chevron-down');
      configPage.unifiedPane.fieldSpecificButton(rowLabel).click();
      util.setCheckbox(configPage.unifiedPane.useFieldSpecificInputSystemsCheckbox(rowLabel), true);
      util.setCheckbox(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1), true);
      expect<any>(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 0).isSelected()).toBe(true);
      expect<any>(configPage.unifiedPane.sense.fieldSpecificInputSystemCheckbox(rowLabel, 1).isSelected()).toBe(true);
    });

  });

  describe('Reorder Rows', () => {
    // Since the drag and drop module inserts items below that row if they are dropped at the middle or below of that
    // row, and Utils.simulateDragDrop uses the middle of a row, then set the target to one row above where you want it.
    // IJH 2018-03

    it('can reorder Input System rows', () => {
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai');
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai (IPA)');
      browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.inputSystem.rows().get(2).getWebElement(),
        configPage.unifiedPane.inputSystem.rows().get(0).getWebElement());
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(0).getText()).toEqual('English');
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(1).getText()).toEqual('Thai (IPA)');
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(2).getText()).toEqual('Thai');
    });

    it('can reorder Entry rows', () => {
      expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        configPage.unifiedPane.entry.rows().get(0).getWebElement());
      expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Pronunciation');
      expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field order', () => {
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
      configPage.applyButton.click();
      expect<any>(configPage.applyButton.isEnabled()).toBe(false);
      Utils.clickBreadcrumb(constants.testProjectName);
      editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
      editorPage.edit.showHiddenFields();
      expect<any>(editorPage.edit.getFieldLabel(0).getText()).toEqual('Word');
      expect<any>(editorPage.edit.getFieldLabel(1).getText()).toEqual('Pronunciation');
      expect<any>(editorPage.edit.getFieldLabel(2).getText()).toEqual('Citation Form');
    });

    it('check first entry for changed field-specific input systems', () => {
      const citationFormLabel = 'Citation Form';
      const scientificNameLabel = 'Scientific Name';
      expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).count()).toEqual(1);
      expect<any>(editorPage.edit.getMultiTextInputSystems(citationFormLabel).get(0).getText()).toEqual('th');
      expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).count()).toEqual(2);
      expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(0).getText()).toEqual('en');
      expect<any>(editorPage.edit.getMultiTextInputSystems(scientificNameLabel).get(1).getText()).toEqual('th');
      configPage.get();
      configPage.tabs.unified.click();
    });

    it('can reorder Entry rows back to how they were', () => {
      browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.entry.rows().get(2).getWebElement(),
        configPage.unifiedPane.entry.rows().get(0).getWebElement());
      expect<any>(configPage.unifiedPane.entry.rowLabel(0).getText()).toEqual('Word');
      expect<any>(configPage.unifiedPane.entry.rowLabel(1).getText()).toEqual('Citation Form');
      expect<any>(configPage.unifiedPane.entry.rowLabel(2).getText()).toEqual('Pronunciation');
      configPage.applyButton.click();
    });

    it('can reorder Sense rows', () => {
      expect<any>(configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      expect<any>(configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Definition');
      expect<any>(configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Pictures');
      browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.sense.rows().get(2).getWebElement(),
        configPage.unifiedPane.sense.rows().get(0).getWebElement());
      expect<any>(configPage.unifiedPane.sense.rowLabel(0).getText()).toEqual('Gloss');
      expect<any>(configPage.unifiedPane.sense.rowLabel(1).getText()).toEqual('Pictures');
      expect<any>(configPage.unifiedPane.sense.rowLabel(2).getText()).toEqual('Definition');
    });

    it('can reorder Example rows', () => {
      expect<any>(configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      expect<any>(configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Translation');
      expect<any>(configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Reference');
      browser.executeScript(Utils.simulateDragDrop, configPage.unifiedPane.example.rows().get(2).getWebElement(),
        configPage.unifiedPane.example.rows().get(0).getWebElement());
      expect<any>(configPage.unifiedPane.example.rowLabel(0).getText()).toEqual('Sentence');
      expect<any>(configPage.unifiedPane.example.rowLabel(1).getText()).toEqual('Reference');
      expect<any>(configPage.unifiedPane.example.rowLabel(2).getText()).toEqual('Translation');
    });

  });

  describe('Select All for Columns', () => {

    it('can fully function "Select All" down the Input System observer column', () => {
      const column = 'observer';
      const rowLabel = 'English';
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(false);
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.observer, false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.observer.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System commenter column', () => {
      const column = 'commenter';
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.commenter, false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System contributor column', () => {
      const column = 'contributor';
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.contributor, false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can select and de-select all down the Input System manager column', () => {
      const column = 'manager';
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.manager, false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes(column), false))
        .toBe(true);
    });

    it('can de-select and select all down the entry observer column', () => {
      const column = 'observer';
      expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, false);
      expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.observer, true);
      expect<any>(configPage.unifiedPane.entry.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the entry commenter column', () => {
      const column = 'commenter';
      const rowLabel = new RegExp('^Location$');
      expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, false);
      expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.commenter, true);
      expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(false);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.entry.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry contributor column', () => {
      const column = 'contributor';
      expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, false);
      expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.contributor, true);
      expect<any>(configPage.unifiedPane.entry.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the entry manager column', () => {
      const column = 'manager';
      expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, false);
      expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.entry.selectAll.manager, true);
      expect<any>(configPage.unifiedPane.entry.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense observer column', () => {
      const column = 'observer';
      expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, false);
      expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.observer, true);
      expect<any>(configPage.unifiedPane.sense.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense commenter column', () => {
      const column = 'commenter';
      expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, false);
      expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.commenter, true);
      expect<any>(configPage.unifiedPane.sense.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the sense contributor column', () => {
      const column = 'contributor';
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, false);
      expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.contributor, true);
      expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(false);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.sense.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the sense manager column', () => {
      const column = 'manager';
      expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, false);
      expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.sense.selectAll.manager, true);
      expect<any>(configPage.unifiedPane.sense.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example observer column', () => {
      const column = 'observer';
      expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, false);
      expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.observer, true);
      expect<any>(configPage.unifiedPane.example.selectAll.observer.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example commenter column', () => {
      const column = 'commenter';
      expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, false);
      expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.commenter, true);
      expect<any>(configPage.unifiedPane.example.selectAll.commenter.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can de-select and select all down the example contributor column', () => {
      const column = 'contributor';
      expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, false);
      expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.contributor, true);
      expect<any>(configPage.unifiedPane.example.selectAll.contributor.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

    it('can fully function "Select All" down the example manager column', () => {
      const column = 'manager';
      const rowLabel = new RegExp('^Reference');
      expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, false);
      expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      util.setCheckbox(configPage.unifiedPane.example.selectAll.manager, true);
      expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), false))
        .toBe(false);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.example.selectAll.manager.isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes(column), true))
        .toBe(true);
    });

  });

  describe('Select All for Rows', () => {

    it('can fully function "Select All" along an Input System row', () => {
      const rowLabel = new RegExp('^Thai$');
      expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      util.setCheckbox(configPage.unifiedPane.commenterCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
    });

    it('can fully function "Select All" along an entry row', () => {
      const rowLabel = new RegExp('^Location$');
      expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.contributorCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along a sense row', () => {
      const rowLabel = new RegExp('^Scientific Name$');
      expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.managerCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

    it('can fully function "Select All" along an example row', () => {
      const rowLabel = new RegExp('^Reference');
      expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(5);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), false);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.observerCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
    });

  });

  describe('Member-Specific Settings', () => {
    let rowNumber = 0;

    it('can count number of Input System rows', () => {
      configPage.unifiedPane.inputSystem.rows().count().then(count => rowNumber = count);
    });

    it('can add a member-specific user settings', () => {
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      configPage.unifiedPane.entry.addGroupButton.click();
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      expect<any>(configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.isDisplayed()).toBe(true);
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(6);
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0).count()).toEqual(rowNumber);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(0), false)).toBe(true);
    });

    it('cannot add the same member-specific user settings', () => {
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      configPage.unifiedPane.entry.addGroupButton.click();
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.sendKeys('a');
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(5);
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.managerUsername + protractor.Key.ENTER);
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadResults.count()).toEqual(0);
      configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
    });

    it('can add a second member-specific user settings', () => {
      const rowLabel = 'English';
      configPage.unifiedPane.entry.addGroupButton.click();
      expect<any>(configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.isDisplayed()).toBe(true);
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput.clear();
      configPage.unifiedPane.addGroupModal.usernameTypeaheadInput
        .sendKeys(constants.memberUsername + protractor.Key.ENTER);
      configPage.unifiedPane.addGroupModal.addMemberSpecificSettingsButton.click();
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(2);
      expect<any>(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1).count()).toEqual(rowNumber);
      expect<any>(configPage.unifiedPane.rowCheckboxes(rowLabel).count()).toEqual(7);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(1), false)).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), false))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.groupColumnCheckboxes(1), false)).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), false))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.groupColumnCheckboxes(1), false)).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), false))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.groupColumnCheckboxes(1), false)).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), false))
        .toBe(true);
    });

    it('can fully function "Select All" down a Input System member-specific column', () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      expect<any>(configPage.unifiedPane.inputSystem.rowLabel(rowIndex).getText()).toEqual(rowLabel);
      util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(false);
      util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(true);
    });

    it('check cross-over Select All row and column', () => {
      const columnIndex = 0;
      const rowIndex = 0;
      const rowLabel = 'English';
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(true);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex).get(rowIndex), false);
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), true))
        .toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.groupColumnCheckboxes(columnIndex), false))
        .toBe(false);
      expect<any>(configPage.unifiedPane.selectRowCheckbox(rowLabel).isSelected()).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), true)).toBe(false);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.rowCheckboxes(rowLabel), false)).toBe(false);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), true);
      util.setCheckbox(configPage.unifiedPane.inputSystem.selectAll.groups().get(columnIndex), false);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), true);
      util.setCheckbox(configPage.unifiedPane.selectRowCheckbox(rowLabel), false);
    });

    it('can remove member-specific user settings', () => {
      configPage.unifiedPane.entry.removeGroupButton(0).click();
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(1);
      configPage.unifiedPane.entry.removeGroupButton(0).click();
      expect<any>(configPage.unifiedPane.inputSystem.selectAll.groups().count()).toEqual(0);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.inputSystem.columnCheckboxes('select-row'), false))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.entry.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.sense.columnCheckboxes('select-row'), true))
        .toBe(true);
      expect<any>(Utils.isAllCheckboxes(configPage.unifiedPane.example.columnCheckboxes('select-row'), true))
        .toBe(true);
    });

  });

  describe('Custom Fields', () => {
    const customDisplayName = 'cust_name';
    let rowNumber = 0;

    it('can discard Configuration changes', () => {
      Utils.clickBreadcrumb(constants.testProjectName);
      configPage.get();
      configPage.tabs.unified.click();
      expect<any>(configPage.applyButton.isEnabled()).toBe(false);
    });

    it('can count number of entry rows', () => {
      configPage.unifiedPane.entry.rows().count().then(count => rowNumber = count);
    });

    it('can open the custom field modal for an entry', () => {
      expect<any>(configPage.unifiedPane.entry.addCustomEntryButton.isEnabled()).toBe(true);
      configPage.unifiedPane.entry.addCustomEntryButton.click();
      expect<any>(configPage.modal.customField.displayNameInput.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.typeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field name', () => {
      expect<any>(configPage.modal.customField.fieldCodeExists.isPresent()).toBe(true);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      expect<any>(configPage.modal.customField.addButton.getText()).toEqual('Add ' + customDisplayName);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a field type', () => {
      Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-input-system Text');
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can add custom field', () => {
      configPage.modal.customField.addButton.click();
      expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect<any>(configPage.unifiedPane.entry.rows().count()).toEqual(rowNumber + 1);
      expect<any>(configPage.unifiedPane.entry.rowLabelCustomInput(rowNumber).getAttribute('value'))
        .toEqual(customDisplayName);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('cannot add a duplicate field name', () => {
      configPage.unifiedPane.entry.addCustomEntryButton.click();
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can cancel custom entry field modal', () => {
      configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

    it('can add a duplicate field name for a sense', () => {
      configPage.unifiedPane.sense.addCustomSenseButton.click();
      expect<any>(configPage.modal.customField.displayNameInput.getAttribute('value')).toEqual('');
      configPage.modal.customField.displayNameInput.sendKeys(customDisplayName + protractor.Key.ENTER);
      expect<any>(configPage.modal.customField.fieldCodeExists.isDisplayed()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('list code only shows when a list type is selected', () => {
      Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown,
        'Multi-input-system Text');
      expect<any>(configPage.modal.customField.listCodeDropdown.isPresent()).toBe(false);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
      Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Multi-option List');
      expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
      Utils.clickDropdownByValue(configPage.modal.customField.typeDropdown, 'Option List');
      expect<any>(configPage.modal.customField.listCodeDropdown.isDisplayed()).toBe(true);
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(false);
    });

    it('can enter a list code', () => {
      Utils.clickDropdownByValue(configPage.modal.customField.listCodeDropdown, 'Part of Speech');
      expect<any>(configPage.modal.customField.addButton.isEnabled()).toBe(true);
    });

    it('can cancel custom sense field modal', () => {
      configPage.modal.customField.displayNameInput.sendKeys(protractor.Key.ESCAPE);
      expect<any>(configPage.modal.customField.displayNameInput.isPresent()).toBe(false);
      expect<any>(configPage.applyButton.isEnabled()).toBe(true);
    });

  });

});
