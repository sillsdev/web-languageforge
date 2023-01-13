import { Locator, Page } from '@playwright/test';
import { Project } from '../utils';
import { GotoOptions } from './base-page';
import { ConfigurationPage } from './configuration.page';

const inputSystemListSelector = 'dt:text("Language Names") ~ dd .controls';

export class ConfigurationPageInputSystemsTab extends ConfigurationPage {

  readonly inputSystemList = this.locator(inputSystemListSelector);
  readonly selectedDisplayName = this.locator('#languageDisplayName');
  readonly abbreviationTextBox = this.locator('input#abbrev');
  readonly rtlCheckbox = this.page.getByLabel('Right to left language');
  readonly fontNameTextBox = this.locator('input#fontfamilycss');
  readonly specialTextBox = this.locator('input#special');

  protected readonly tabLink = this.tabLinks.inputSystems;

  constructor(page: Page, project: Project) {
    super(page, project, page.locator(inputSystemListSelector));
  }

  inputSystemOption(inputSystem: string): Locator {
    return this.inputSystemList.locator(`div:has-text("${inputSystem}")`);
  }
}
