import { expect, Locator, Page } from '@playwright/test';

/**
 * Check whether the option that should be selected is selected.
 * Playwright does not hava a way to directly get the text of the selected option.
 * This function therefore works with the value.
 * @param selectElement , \<select\>
 * @param textShouldBeSelectedOption , e.g. 'Pizza Margherita' or a substring, e.g. 'Margherita'
 */
export async function expectOptionSelectedInSelectElement(selectElement: Locator, textShouldBeSelectedOption: string) {
  const selectedValue: string = await selectElement.inputValue();
  const shouldBeSelectedOption: Locator = selectElement.locator('option').filter({ hasText: textShouldBeSelectedOption });
  await expect(shouldBeSelectedOption).toHaveAttribute('value', selectedValue);
}
