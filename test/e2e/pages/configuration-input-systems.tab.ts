import { Locator, Page } from '@playwright/test';
import { ConfigurationPage } from './configuration.page';
import { Project } from '../utils/types';
import { GotoOptions } from './base-page';

const inputSystemListSelector = 'dt:text("Language Names") ~ dd .controls';

export class ConfigurationPageInputSystemsTab extends ConfigurationPage<ConfigurationPageInputSystemsTab> {

  readonly inputSystemList = this.page.locator(inputSystemListSelector);
  readonly selectedDisplayName = this.page.locator('#languageDisplayName');
  readonly abbreviationTextBox = this.page.locator('input#abbrev');
  readonly rtlCheckbox = this.page.getByLabel('Right to left language');
  readonly fontNameTextBox = this.page.locator('input#fontfamilycss');
  readonly specialTextBox = this.page.locator('input#special');

  protected readonly tabLink = this.tabLinks.inputSystems;

  constructor(page: Page, project: Project) {
    super(page, project, page.locator(inputSystemListSelector)); // don't pass the wait for page in here
  }

  async goto(options?: GotoOptions): Promise<ConfigurationPageInputSystemsTab> {
    await Promise.all([
      this.page.goto(this.url),
      options?.waitFor?.waitFor(),
    ]);
    await Promise.all([
      this.tabLinks.inputSystems.click(),
      this.waitForPage(),
    ]);
    return this;
  }

  inputSystemOption(inputSystem: string): Locator {
    return this.inputSystemList.locator(`div:has-text("${inputSystem}")`);
  }
}
