import * as angular from 'angular';
import { TranslateSettingsComponent } from './settings.component';
import { TranslateSharedModule } from '../shared/translate-shared.module';
import 'angularjs-slider';
import 'angularjs-slider/dist/rzslider.css';

export const TranslateSettingsModule = angular
  .module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
    'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
    'palaso.ui.textdrop', TranslateSharedModule, 'rzModule'])
  .component('translateSettings', TranslateSettingsComponent)
  .name;
