import * as angular from 'angular';
import 'angular-sanitize';

import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorModule} from './editor/editor.module';
import './new-project/lexicon-new-project.module';
import {LexiconSettingsModule} from './settings/settings.module';

export const LexiconModule = angular
  .module('lexiconModule', [
    LexiconCoreModule,
    LexiconEditorModule,
    LexiconSettingsModule
  ])
  .name;
