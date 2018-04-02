declare namespace jasmine {
  interface Matchers<T> {
    toContainMultilineMatch(regex: RegExp): boolean;
    toContainMatch(text: string): boolean;

  }
}
