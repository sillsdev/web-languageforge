import { expect, Locator } from '@playwright/test';

export const toHaveSelectedOption = async (select: Locator, option: {label?: string, value?: string}) => {
  if (option.label === undefined && option.value === undefined) {
    throw new  Error('At least one of either label or value must be set');
  }

  const value = await select.inputValue();

  if (option.value !== undefined) {
    await expect(select).toHaveValue(option.value);
  }

  if (option.label !== undefined) {
    const optionElem = select.locator(`option[value="${value}"]`);
    const optionLabel = await optionElem.textContent();

    if (option.label === optionLabel) {
      return {
        message: () => `Did not expect '${option.label}' to be selected.`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected '${option.label}' to be selected, but was '${optionLabel}'.`,
        pass: false,
      };
    }
  }
};
