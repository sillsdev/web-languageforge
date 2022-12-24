import { Locator, Page } from '@playwright/test';
import { Project } from '../utils';
import { ConfigurationPage } from './configuration.page';

export class ConfigurationPageFieldsTab extends ConfigurationPage {

  protected readonly tabLink = this.tabLinks.fields;

  constructor(page: Page, project: Project) {
    super(page, project);
  }

  async getCheckbox(tableTitle: string, rowTitle: string, columnTitle: string): Promise<Locator> {
    const table: Locator = this.getTable(tableTitle);
    const row: Locator = this.getRow(table, rowTitle);
    const columnIndex = await this.getChildPosition(table.locator('tr').first(), 'th', columnTitle);
    return row.locator('css=td,th').nth(columnIndex).locator('input');
  }

  async toggleField(tableTitle: string, field: string): Promise<void> {
    const row: Locator = this.getRow(this.getTable(tableTitle), field);
    await row.locator('.field-specific-btn').click();
  }

  async getFieldCheckbox(tableTitle: string, field: string, inputSystem: string): Promise<Locator> {
    const row: Locator = this.getRow(this.getTable(tableTitle), field);
    const parentOfRow: Locator = row.locator('xpath=..');
    const positionInTable = await this.getChildPosition(parentOfRow, 'tr', await row.innerText());
    let checkbox = parentOfRow.locator('tr').nth(positionInTable + 2).locator(`tr:has-text("${inputSystem}") >> input[type="checkbox"] >> visible=true`);
    if (await checkbox.count() == 0) {
      checkbox = parentOfRow.locator('tr').nth(positionInTable + 1).locator(`input[type="checkbox"] >> visible=true`);
    }
    return checkbox;
  }

  private getTable(tableTitle: string): Locator {
    // note that at the moment, all tables are in one huge <table>
    return this.locator(`table:has(th:has-text("${tableTitle}"))`);
  }

  private getRow(tableLocator: Locator, rowTitle: string): Locator {
    return tableLocator.locator(`tr:has-text("${rowTitle}"):not(:has-text("Input Systems for")) >> visible=true`);
  }

  private async getChildPosition(parentLocator: Locator, childElementType: string, innerText: string): Promise<number> {
    const children = parentLocator.locator(childElementType);
    for (let i = 0; i < await children.count(); i++) {
      if (await children.nth(i).innerText() == innerText) {
        return i;
      }
    }
    console.log(`Warning: there is no element with text ${innerText} with the parent ${parentLocator}.`);
    return undefined;
  }
}
