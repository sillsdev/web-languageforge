import { expect } from '@playwright/test';
import { test } from './utils/fixtures';

import { ProjectsPage } from './pages/projects.page';

import { Project } from './utils/types';

import { addLexEntry, addPictureFileToProject, initTestProject } from './utils/testSetup';


import constants from './testConstants.json';
import { EditorPage } from './pages/editor.page';
import { PageHeader } from './components/page-header.component';
import { ProjectSettingsPage } from './pages/project-settings.page';
import { expectOptionSelectedInSelectElement } from './utils/playwright-helpers';

test.describe('Lexicon E2E Semantic Domains Lazy Load', () => {
  let projectsPageManager: ProjectsPage;
  let editorPage: EditorPage;
  let pageHeader: PageHeader;
  const project: Project = {
    name: 'semantic_domainsprojects_spec_ts Project 04',
    code: 'p04_projects_spec_ts__project_04',
    id: ''
  };
  const lexemeLabel = 'Word';
  const semanticDomain1dot1English = constants.testEntry1.senses[0].semanticDomain.values[0] + ' Sky';
  const semanticDomain1dot1Thai = constants.testEntry1.senses[0].semanticDomain.values[0] + ' ท้องฟ้า';

  test.beforeAll(async ({ request, managerTab, member, manager, admin, }) => {
    project.id = await initTestProject(request, project.code, project.name, manager.username, [admin.username]);
    await addPictureFileToProject(request, project.code, constants.testEntry1.senses[0].pictures[0].fileName);
    const lexEntryId = await addLexEntry(request, project.code, constants.testEntry1);
    projectsPageManager = new ProjectsPage(managerTab);
    editorPage = new EditorPage(managerTab, project.id, lexEntryId);
    pageHeader = new PageHeader(editorPage.page);
  });

  test('Should be using English Semantic Domain for manager', async () => {
    await editorPage.goto();
    expect(await (await editorPage.getTextarea(editorPage.entryCard, lexemeLabel, 'th')).inputValue()).toEqual(constants.testEntry1.lexeme.th.value);
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });

  test('Can change Project default language to Thai & back and forth', async () => {
    // as this test is pretty long, the default test timeout is not sufficient
    test.setTimeout(60000);

    // can change Project default language to Thai
    const projectSettingsPage = new ProjectSettingsPage(editorPage.page);
    await projectSettingsPage.gotoProjectSettingsDirectly(project.id, project.name);
    await expect(projectSettingsPage.projectTab.tabTitle).toBeVisible();
    await expect(projectSettingsPage.projectTab.saveButton).toBeVisible();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput).toBeVisible();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText('English');
    await projectSettingsPage.page.waitForTimeout(1000);
    await projectSettingsPage.projectTab.defaultInterfaceLanguageInput.selectOption({ label: 'ภาษาไทย - semantic domain only' });
    await projectSettingsPage.page.waitForTimeout(2000);

    await projectSettingsPage.projectTab.saveButton.click();
    await expectOptionSelectedInSelectElement(projectSettingsPage.projectTab.defaultInterfaceLanguageInput, 'ภาษาไทย');
    await expect(pageHeader.languageDropdownButton).toHaveText('ภาษาไทย');

    // should be using Thai semantic domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1Thai);

    // can change Project default language back to English
    await projectSettingsPage.gotoProjectSettingsDirectly(project.id, project.name);
    // all the visibility checks and timeouts were added because the selectOption was flaky
    // with the timeouts, it does not fail (0 out of 18 times)
    await expect(projectSettingsPage.projectTab.tabTitle).toBeVisible();
    await expect(projectSettingsPage.projectTab.saveButton).toBeVisible();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput).toBeVisible();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText('ภาษาไทย - semantic domain only');
    await projectSettingsPage.page.waitForTimeout(1000);
    await projectSettingsPage.projectTab.defaultInterfaceLanguageInput.selectOption({ label: 'English' });
    await projectSettingsPage.page.waitForTimeout(2000);
    await projectSettingsPage.projectTab.saveButton.click();
    await expectOptionSelectedInSelectElement(projectSettingsPage.projectTab.defaultInterfaceLanguageInput, 'English');
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should be using English Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);

    // can change Project default language back to Thai
    await projectSettingsPage.gotoProjectSettingsDirectly(project.id, project.name);
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText('English');
    await projectSettingsPage.page.waitForTimeout(1000);
    await projectSettingsPage.projectTab.defaultInterfaceLanguageInput.selectOption({ label: 'ภาษาไทย - semantic domain only' });
    await projectSettingsPage.page.waitForTimeout(2000);
    await projectSettingsPage.projectTab.saveButton.click();
    await expectOptionSelectedInSelectElement(projectSettingsPage.projectTab.defaultInterfaceLanguageInput, 'ภาษาไทย');

    // should be using Thai Semantic Domain after refresh
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1Thai);
    // browser refresh
    await editorPage.page.reload();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1Thai);

    // can change user interface language
    await expect(pageHeader.languageDropdownButton).toHaveText('ภาษาไทย');
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should still have Thai for Project default language
    await projectSettingsPage.gotoProjectSettingsDirectly(project.id, project.name);
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText('ภาษาไทย - semantic domain only');

    // should be using English Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);

    // should be using English Semantic Domain after refresh
    // browser refresh
    await editorPage.page.reload();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);

    // should still have Thai for Project default language
    await projectSettingsPage.gotoProjectSettingsDirectly(project.id, project.name);
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput.locator('option[selected="selected"]')).toHaveText('ภาษาไทย - semantic domain only');

    // can change user interface language to English
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();

    // can change Project default language to match interface language twice
    await projectSettingsPage.page.waitForTimeout(1000);
    await projectSettingsPage.projectTab.defaultInterfaceLanguageInput.selectOption({ label: 'English' });
    await projectSettingsPage.page.waitForTimeout(2000);
    await projectSettingsPage.projectTab.saveButton.click();
    await expectOptionSelectedInSelectElement(projectSettingsPage.projectTab.defaultInterfaceLanguageInput, 'English');
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    await projectSettingsPage.page.waitForTimeout(1000);
    await projectSettingsPage.projectTab.defaultInterfaceLanguageInput.selectOption({ label: 'ภาษาไทย - semantic domain only' });
    await projectSettingsPage.page.waitForTimeout(2000);
    await projectSettingsPage.projectTab.saveButton.click();
    await expectOptionSelectedInSelectElement(projectSettingsPage.projectTab.defaultInterfaceLanguageInput, 'ภาษาไทย');
    await expect(pageHeader.languageDropdownButton).toHaveText('ภาษาไทย');

    // can change user interface language to back English
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });
});
