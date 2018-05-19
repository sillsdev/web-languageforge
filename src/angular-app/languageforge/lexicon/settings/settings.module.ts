import * as angular from 'angular';

import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {SelectLanguageModule} from '../../../bellows/shared/select-language.component';
import {LexiconConfigurationComponent} from './configuration/configuration.component';
import {LexiconConfigurationModule} from './configuration/configuration.module';
import {LexiconImportComponent} from './import.component';
import {LexiconProjectSettingsComponent} from './project-settings.component';
import {LexiconSyncComponent} from './sync.component';

export const LexiconSettingsModule = angular
  .module('lexiconSettingsModule', ['ui.bootstrap',  'ngFileUpload', CoreModule, NoticeModule,
    LexiconConfigurationModule, 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', SelectLanguageModule,
    'palaso.ui.listview', 'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.typeahead'])
  .component('lexiconConfig', LexiconConfigurationComponent)
  .component('lexiconImport', LexiconImportComponent)
  .component('lexiconProjectSettings', LexiconProjectSettingsComponent)
  .component('lexiconSync', LexiconSyncComponent)
  .name;
