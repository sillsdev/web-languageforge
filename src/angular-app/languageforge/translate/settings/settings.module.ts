import * as angular from 'angular';
import 'angularjs-slider';
import 'angularjs-slider/dist/rzslider.css';

import { CoreModule } from '../../../bellows/core/core.module';
import { TranslateSettingsComponent } from './settings.component';
import { TranslateSharedModule } from '../shared/translate-shared.module';

export const TranslateSettingsModule = angular
  .module('translateSettingsModule', [CoreModule, 'ui.bootstrap', 'palaso.ui.listview',
    'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
    'palaso.ui.textdrop', TranslateSharedModule, 'rzModule'])
  .component('translateSettings', TranslateSettingsComponent)
  .name;
