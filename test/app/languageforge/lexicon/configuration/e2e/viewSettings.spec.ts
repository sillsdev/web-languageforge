import {BellowsLoginPage} from '../../../../bellows/pages/loginPage';
import {ProjectsPage} from '../../../../bellows/pages/projectsPage';
import {Utils} from '../../../../bellows/pages/utils';
import {EditorPage} from '../../pages/editorPage';
import {ViewSettingsPage} from '../../pages/viewSettingsPage';

describe('View settings page', () => {
  const constants    = require('../../../../testConstants');
  const loginPage = new BellowsLoginPage();
  const projectsPage = new ProjectsPage();
  const util = new Utils();
  const editorPage = new EditorPage();
  const viewSettingsPage = new ViewSettingsPage();

  it('setup: login, click on test project, go to the View Settings page', () => {
    loginPage.loginAsManager();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    viewSettingsPage.get();
  });

  it('setup: click Manager tab', () => {
    viewSettingsPage.goToManagerTab();
  });

  it('Hide Semantic Domain field for Manager', () => {
    expect(viewSettingsPage.getFieldByNameIconClass('Semantic Domain')).toMatch('fa fa-eye');
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, false);
    expect(viewSettingsPage.getFieldByNameIconClass('Semantic Domain'))
      .not.toMatch('fa fa-eye');
    viewSettingsPage.applyButton.click();
  });

  it('Hide Semantic Domain field for specific username of admin user', () => {
    viewSettingsPage.getTabByName('Member Specific').click();
    viewSettingsPage.addViewSettingsForMember(constants.adminName);
    viewSettingsPage.pickMemberWithViewSettings(constants.adminName);
    expect<any>(viewSettingsPage.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, false);
    viewSettingsPage.applyButton.click();
  });

  it('Semantic Domain field is hidden for Manager', () => {
    util.clickBreadcrumb(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.getFields('Semantic Domain').count()).toBe(0);
  });

  it('Semantic Domain field is visible for Member', () => {
    loginPage.loginAsMember();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect(editorPage.edit.getOneField('Semantic Domain').isPresent()).toBeTruthy();
  });

  it('Semantic Domain field is hidden for admin user', () => {
    loginPage.loginAsAdmin();
    projectsPage.get();
    projectsPage.clickOnProject(constants.testProjectName);
    editorPage.browse.findEntryByLexeme(constants.testEntry1.lexeme.th.value).click();
    expect<any>(editorPage.edit.getFields('Semantic Domain').count()).toBe(0);
  });

  it('Return view settings to normal before next test', () => {
    viewSettingsPage.get();
    viewSettingsPage.getTabByName('Member Specific').click();
    viewSettingsPage.pickMemberWithViewSettings(constants.adminUsername);
    expect<any>(viewSettingsPage.accordionEnabledFields.getText()).toEqual(
        'Enabled Fields for ' + constants.adminName + ' (' + constants.adminUsername + ')'
    );
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, true);
    viewSettingsPage.applyButton.click();
    viewSettingsPage.getTabByName('Manager').click();
    viewSettingsPage.getFieldByName('Semantic Domain').click();
    util.setCheckbox(viewSettingsPage.showField, true);
    viewSettingsPage.applyButton.click();
  });
});
