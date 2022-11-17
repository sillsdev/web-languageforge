export {};

declare global {
 namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveSelectedOption(option: {label?: string, value?: string}): Promise<void>;
    }
  }
}
