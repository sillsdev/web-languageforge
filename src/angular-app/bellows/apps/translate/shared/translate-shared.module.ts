import * as angular from 'angular';

import {SelectLanguageModule} from '../../../shared/select-language.component';
import {LanguagesPickerComponent} from './languages-picker.component';

export const TranslateSharedModule = angular
  .module('translateSharedModule', [SelectLanguageModule])
  .component('languagesPicker', LanguagesPickerComponent)
  .name;
