import * as angular from 'angular';

import { PuiAutoFocus } from './pui-autoFocus.directive';
import { PuiCompositionInput } from './pui-compositionInput.directive';
import { PuiIdleValidate } from './pui-idleValidate.directive';

export const PuiUtilityModule = angular
  .module('palaso.ui.utils', [])
  .directive('puiAutoFocus', PuiAutoFocus)

  // ToDo: the directives below will need to be components for Angular 2+. IJH 2017-09
  // Shouldn't use scope or require in directives
  .directive('compositionInput', PuiCompositionInput)
  .directive('idleValidate', PuiIdleValidate)
  .name;
