"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loginPage_1 = require("../../../../bellows/pages/loginPage");
const projectSettingsPage_1 = require("../../pages/projectSettingsPage");
const constants = require('../../../../testConstants.json');
const loginPage = new loginPage_1.BellowsLoginPage();
const projectSettingsPage = new projectSettingsPage_1.ProjectSettingsPage();
describe('Project Settings page', () => {
    it('should display project properties for manager', () => {
        loginPage.loginAsManager();
        projectSettingsPage.get(constants.testProjectName);
        expect(projectSettingsPage.tabs.project.isDisplayed());
        expect(projectSettingsPage.projectTab.saveButton.isDisplayed()).toBe(true);
    });
});
//# sourceMappingURL=projectSettings.spec.js.map