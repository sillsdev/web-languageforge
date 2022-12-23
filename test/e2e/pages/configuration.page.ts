import { Locator, Page } from '@playwright/test';
import { Project } from '../utils';
import { TabbedBasePage } from './tabbed-page';

const tabSelector = (tab: string) => `.tab-links .tab-link:text("${tab}")`;

const fieldsSelector = tabSelector('Fields');

export abstract class ConfigurationPage extends TabbedBasePage {

  readonly tabLinks = {
    fields: this.locator(fieldsSelector),
    inputSystems: this.locator(tabSelector('Input Systems')),
  };

  readonly applyButton = this.locator('button >> text=Apply');

  constructor(page: Page, readonly project: Project, locator?: Locator) {
    super(page, `/app/lexicon/${project.id}/#!/configuration`,
      locator ? [locator, page.locator(fieldsSelector)] : page.locator(fieldsSelector));
  }

  async applyChanges(): Promise<void> {
    await Promise.all([
      this.applyButton.click(),
      this.waitFor(),
    ]);
  }
}
