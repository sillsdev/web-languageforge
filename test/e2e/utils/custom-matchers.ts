import { expect, Locator } from '@playwright/test';

export const matchers = {
  toHaveSelectedOption: async (select: Locator, option: { label?: string, value?: string }) => {
    if (option.label === undefined && option.value === undefined) {
      throw new Error('At least one of either label or value must be set');
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
  },
};

// Some black magic that simply ensures the matchers we declare below contains the matchers that
// Playwright adds to the interface of `expect` based on the matchers defined above.
type RemoveFirstFromTuple<T extends any[]> = T extends [infer T, ...infer R] ? [...R] : [];
type RemoveFirstParam<T extends (...args: any[]) => any> = (...args: RemoveFirstFromTuple<Parameters<T>>) => void;
type CustomMatchers = { [K in keyof typeof matchers]: RemoveFirstParam<typeof matchers[K]> }

declare global {
  namespace PlaywrightTest {
    class Matchers<R> implements CustomMatchers {

      /**
       * Ensures the [Locator] points to a select element with the specified selected option.
       * An option is considered matching if all specified properties match.
       *
       * @param option Properties of the expected selected option.
       */
      toHaveSelectedOption(option: { label?: string, value?: string }): Promise<void>;
    }
  }
}
