export interface TransifexLive {
  // noinspection TsLint
  onReady(cb: (load_msec: number) => void): void;

  onFetchLanguages(cb: (languages: TransifexLanguage[]) => void): void;

  // noinspection TsLint
  onTranslatePage(cb: (language_code: string) => void): void;

  // noinspection TsLint
  onDynamicContent(cb: (new_strings: any) => void): void;

  onError(cb: (err: any) => void): void;

  unBind(cb: (params: any) => void): void;

  // noinspection TsLint
  hasLanguageCode(lang_code: string): boolean;

  // noinspection TsLint
  hasTargetLanguage(lang_code: string): boolean;

  getSourceLanguage(): TransifexLanguage;

  // noinspection TsLint
  getLanguageName(lang_code: string): string;

  getAllLanguages(): TransifexLanguage[];

  // noinspection TsLint
  matchLanguageCode(lang_code: string): string;

  // noinspection TsLint
  normalizeLangCode(lang_code: string): string;

  detectLanguage(): string;

  getSelectedLanguageCode(): string;

  translateTo(code: string): void;

  translateNode(element: HTMLElement): void;

  translateNodes(array: HTMLElement[]): void;

  translateText(text: string, variables?: any): void;
}

export interface TransifexLanguage {
  code: string;
  name: string;
  source?: boolean;
}
