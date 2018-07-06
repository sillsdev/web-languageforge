import * as angular from 'angular';
import 'ng-drag-to-reorder';

import {CoreModule} from '../../../../bellows/core/core.module';
import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {SelectLanguageModule} from '../../../../bellows/shared/select-language.component';
import {LexiconCoreModule} from '../../core/lexicon-core.module';
import {FieldsConfigurationComponent} from './configuration-fields.component';
import {InputSystemsConfigurationComponent} from './configuration-input-systems.component';
import {OptionListConfigurationComponent} from './configuration-option-lists.component';

export const LexiconConfigurationModule = angular
  .module('lexiconConfigurationModule', [
    'ui.bootstrap',
    'ngDragToReorder',
    CoreModule,
    NoticeModule,
    SelectLanguageModule,
    'palaso.ui.tabset',
    'palaso.ui.typeahead',
    'palaso.ui.picklistEditor',
    'palaso.util.model.transform',
    LexiconCoreModule
  ])
  .component('lscFields', FieldsConfigurationComponent)
  .component('lscInputSystems', InputSystemsConfigurationComponent)
  .component('lscOptionLists', OptionListConfigurationComponent)
  .name;
