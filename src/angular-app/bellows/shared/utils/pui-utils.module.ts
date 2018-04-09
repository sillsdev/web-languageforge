import * as angular from 'angular';

import {PuiAutoFocus} from './pui-auto-focus.directive';
import {PuiCompositionInput} from './pui-composition-input.directive';
import {PuiIdleValidate} from './pui-idle-validate.directive';
import {PuiShowOverflow} from './pui-show-overflow.directive';

export const PuiUtilityModule = angular
  .module('palaso.ui.utils', [])
  .directive('puiAutoFocus', PuiAutoFocus)

  // ToDo: the directives below will need to be components for Angular 2+. IJH 2017-09
  // Shouldn't use scope or require in directives
  .directive('compositionInput', PuiCompositionInput)
  .directive('idleValidate', PuiIdleValidate)
  .directive('puiShowOverflow', PuiShowOverflow)
  .name;
