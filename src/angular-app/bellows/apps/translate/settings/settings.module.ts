import * as angular from 'angular';
import 'angularjs-slider';
import 'angularjs-slider/dist/rzslider.css';

import { CoreModule } from '../../../core/core.module';
import { NoticeModule } from '../../../core/notice/notice.module';
import { TranslateSharedModule } from '../shared/translate-shared.module';
import { TranslateSettingsComponent } from './settings.component';
import { TranslateSyncComponent } from './sync.component';

export const TranslateSettingsModule = angular
  .module('translateSettingsModule', ['ui.bootstrap', CoreModule, 'palaso.ui.listview',
    'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', NoticeModule,
    'palaso.ui.textdrop', TranslateSharedModule, 'rzModule'])
  .component('translateSettings', TranslateSettingsComponent)
  .component('translateSync', TranslateSyncComponent)
  .name;
