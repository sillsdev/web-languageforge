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
  const semanticDomain1dot1Thai = constants.testEntry1.senses[0].semanticDomain.values[0] + ' ท้องฟ้า';

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

  test('Can change Project default language to Thai & back and forth', async () => {
    const projectSettingsPage = new ProjectSettingsPage(editorPage.page, project);

    // can change Project default language to Thai
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('ภาษาไทย - semantic domain only');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'ภาษาไทย - semantic domain only'});
    await expect(pageHeader.languageDropdownButton).toHaveText('ภาษาไทย');

    // should be using Thai semantic domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1Thai);

    // can change Project default language back to English
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('English');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'English'});
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should be using English Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first()).toHaveText(semanticDomain1dot1English);

    // can change Project default language back to Thai
    await projectSettingsPage.goto();
    await projectSettingsPage.setDefaultInterfaceLanguage('ภาษาไทย - semantic domain only');
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'ภาษาไทย - semantic domain only'});

    // should be using Thai Semantic Domain
    await editorPage.goto();
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1Thai);

    // can change user interface language
    await expect(pageHeader.languageDropdownButton).toHaveText('ภาษาไทย');
    await pageHeader.languageDropdownButton.click();
    await pageHeader.languageDropdownItem.filter({ hasText: 'English' }).click();
    await expect(pageHeader.languageDropdownButton).toHaveText('English');

    // should be using English Semantic Domain
    await expect(editorPage.senseCard.locator(editorPage.semanticDomainSelector).first())
      .toHaveText(semanticDomain1dot1English);

    // should still have Thai for Project default language
    await projectSettingsPage.goto();
    await expect(projectSettingsPage.projectTab.defaultInterfaceLanguageInput)
      .toHaveSelectedOption({label: 'ภาษาไทย - semantic domain only'});

    // user interface language should still be English
    await expect(pageHeader.languageDropdownButton).toHaveText('English');
  });
});
