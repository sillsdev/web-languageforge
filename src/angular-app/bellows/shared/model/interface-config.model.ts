import {OrderedOptions} from './options.model';

export class InterfaceConfig {
  direction = 'ltr';
  pullNormal = 'float-left';
  pullToSide = 'float-right';
  placementNormal = 'right';
  placementToSide = 'left';
  languageCode = 'en';
  isUserLanguageCode?: boolean;
  selectLanguages?: OrderedOptions<SelectLanguage>;
}

export interface SelectLanguage {
  name: string;
  option: string;
  hasSemanticDomain?: boolean;
}
