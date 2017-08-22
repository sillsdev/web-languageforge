import * as angular from 'angular';

import { TranslateSettingsComponent } from './settings.component';

export const TranslateSettingsModule = angular
  .module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
    'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
    'palaso.ui.textdrop', 'translateSharedModule', 'rzModule'])
  .component('translateSettings', TranslateSettingsComponent)
  .name;
