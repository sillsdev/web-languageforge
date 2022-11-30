import { expect } from '@playwright/test';
import { test } from './utils/fixtures';
import { Project } from './utils/types';
import { addLexEntry, addPictureFileToProject, initTestProject } from './utils/testSetup';
import constants from './testConstants.json';
import { EditorPage } from './pages/editor.page';
import { PageHeader } from './components/page-header.component';
import { ProjectSettingsPage } from './pages/project-settings.page';

test.describe('Lexicon E2E Semantic Domains Lazy Load', () => {
  let editorPage: EditorPage;
  let pageHeader: PageHeader;
  const project: Project = {
    name: 'semantic_domainsprojects_spec_ts Project 04',
    code: 'p04_projects_spec_ts__project_04',
    id: ''
  };
  const lexemeLabel = 'Word';
  const semanticDomain1dot1English = constants.testEntry1.senses[0].semanticDomain.values[0] + ' Sky';
  const semanticDomain1dot1Khmer = constants.testEntry1.senses[0].semanticDomain.values[0] + ' មេឃ';

  test.beforeAll(async ({ request, managerTab, manager, admin, }) => {
    project.id = await initTestProject(request, project.code, project.name, manager.username, [admin.username]);
    await addPictureFileToProject(request, project.code, constants.testEntry1.senses[0].pictures[0].fileName);
    await addLexEntry(request, project.code, constants.testEntry1);
    editorPage = new EditorPage(managerTab, project);
    pageHeader = new PageHeader(editorPage.page);
  });

  test('Should be using English Semantic Domain for manager', async () => {
    await editorPage.goto();
    expect(editorPage.getTextarea(editorPage.entryCard, lexemeLabel, 'th')).toHaveValue(constants.testEntry1.lexeme.th.value);
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });

  test('Can change Project default language to Khmer & back and forth', async () => {
    const projectSettingsPage = new ProjectSettingsPage(editorPage.page, project);

    // can change Project default language to Khmer
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('Khmer');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'Khmer'});
    await expect(pageHeader.languageDropdownButton).toHaveText('Khmer');

    // should be using Khmer semantic domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1Khmer);

    // can change Project default language back to English
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('English');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'English'});
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should be using English Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);

    // can change Project default language back to Khmer
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('Khmer');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'Khmer'});

    // should be using Khmer Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1Khmer);

    // can change user interface language
    await expect(pageHeader.languageDropdownButton).toHaveText('Khmer');
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should be using English Semantic Domain
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1English);

    // should still have Khmer for Project default language
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'Khmer'});

    // user interface language should still be English
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });
});
