import * as angular from 'angular';

import {EditorFieldModule} from './field/field.module';

export const LexiconEditorModule = angular
  .module('lexiconEditorModule', [EditorFieldModule])
  .name;
