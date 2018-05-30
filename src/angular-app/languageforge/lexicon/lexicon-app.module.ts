import * as angular from 'angular';
import 'angular-sanitize';
import uiRouter from 'angular-ui-router';

import {BreadcrumbModule} from '../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../bellows/core/core.module';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorModule} from './editor/editor.module';
import {LexiconAppComponentModule} from './lexicon-app.component';
import './new-project/lexicon-new-project.module';
import {LexiconSettingsModule} from './settings/settings.module';

export const LexiconAppModule = angular
  .module('lexiconModule', [
    'ui.bootstrap',
    uiRouter,
    'ngSanitize',
    'palaso.ui.typeahead',
    CoreModule,
    BreadcrumbModule,
    LexiconAppComponentModule,
    LexiconCoreModule,
    LexiconEditorModule,
    LexiconSettingsModule
  ])
  .name;
