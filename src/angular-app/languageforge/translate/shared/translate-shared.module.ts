'use strict';

import * as angular from 'angular';
import { LanguagesPickerComponent } from './languages-picker.component';

export const TranslateSharedModule = angular
  .module('translateSharedModule', ['palaso.ui.language'])
  .component('languagesPicker', LanguagesPickerComponent)

  ;
