import { Locator, Page } from '@playwright/test';
import { Project } from '../utils/types';
import { BasePage } from './base-page';

const fieldsSelector = '[data-ng-repeat="tab in $ctrl.tabs"] >> text=Fields >> visible=true';

export class ConfigurationPage extends BasePage<ConfigurationPage> {

  readonly tabs = {
    fields: this.page.locator(fieldsSelector)
  };
  readonly applyButton = this.page.locator('button >> text=Apply');

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}/#!/configuration`, page.locator(fieldsSelector));
  }

  async getTable(tableTitle: string): Promise<Locator> {
    // note that at the moment, all tables are in one huge <table>
    return this.page.locator(`table:has(th:has-text("${tableTitle}"))`);
  }

  async getRow(tableLocator: Locator, rowTitle: string): Promise<Locator> {
    const row: Locator = tableLocator.locator(`tr:has-text("${rowTitle}"):not(:has-text("Input Systems for")) >> visible=true`);
    // if two rows within the same table have the same name, a warning is logged to the console
    //  note: this warning is always logged in the test "Makw taud input system.." of file editor-entry.spec.ts because of the messy table layout
    if (await row.count() > 1) console.log(`Warning: more than 1 row was located with the row title ${rowTitle}. Proceeding with the first row.`);
    return row.first();
  }

  async getCheckbox(tableTitle: string, rowTitle: string, columnTitle: string): Promise<Locator> {
    const table: Locator = await this.getTable(tableTitle);
    const row: Locator = await this.getRow(table, rowTitle);
    const columnIndex = await this.getChildPosition(table.locator('tr').first(), 'th', columnTitle);
    return row.locator('css=td,th').nth(columnIndex).locator('input');
  }

  async getFieldSpecificButton(tableTitle: string, rowTitle: string): Promise<Locator> {
    const row: Locator = await this.getRow(await this.getTable(tableTitle), rowTitle);
    return row.locator('.field-specific-btn');
  }

  async getFieldSpecificCheckbox(tableTitle: string, rowTitle: string, checkboxLabel: string): Promise<Locator> {
    const row: Locator = await this.getRow(await this.getTable(tableTitle), rowTitle);
    const parentOfRow: Locator = row.locator('xpath=..');
    const positionInTable = await this.getChildPosition(parentOfRow, 'tr', await row.innerText());
    let checkbox = parentOfRow.locator('tr').nth(positionInTable+2).locator(`tr:has-text("${checkboxLabel}") >> input[type="checkbox"] >> visible=true`);
    if (await checkbox.count() == 0) {
      checkbox = parentOfRow.locator('tr').nth(positionInTable+1).locator(`input[type="checkbox"] >> visible=true`);
    }
    return checkbox;
  }

  async getChildPosition(parentLocator: Locator, childElementType: string, innerText: string): Promise<number> {
    const children = parentLocator.locator(childElementType);
    for (let i=0; i < await children.count(); i++) {
      if (await children.nth(i).innerText() == innerText) {
        return i;
      }
    }
    console.log(`Warning: there is no element with text ${innerText} with the parent ${parentLocator}.`);
    return undefined;
  }
}
