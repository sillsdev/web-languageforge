import * as angular from 'angular';
import 'angularjs-slider';
import 'angularjs-slider/dist/rzslider.css';

import {BrowserCheckModule} from '../../../core/browser-check.service';
import {CoreModule} from '../../../core/core.module';
import {NoticeModule} from '../../../core/notice/notice.module';
import {ArchiveProjectModule} from '../../../shared/archive-project.component';
import {DeleteProjectModule} from '../../../shared/delete-project.component';
import {ListViewModule} from '../../../shared/list-view.component';
import {TypeAheadModule} from '../../../shared/type-ahead.module';
import {TranslateSharedModule} from '../shared/translate-shared.module';
import {TranslateSettingsComponent} from './settings.component';
import {TranslateSyncComponent} from './sync.component';

export const TranslateSettingsModule = angular
  .module('translateSettingsModule', [
    'rzModule',
    'ui.bootstrap',
    CoreModule,
    BrowserCheckModule,
    ArchiveProjectModule,
    DeleteProjectModule,
    ListViewModule,
    TypeAheadModule,
    NoticeModule,
    TranslateSharedModule
  ])
  .component('translateSettings', TranslateSettingsComponent)
  .component('translateSync', TranslateSyncComponent)
  .name;
