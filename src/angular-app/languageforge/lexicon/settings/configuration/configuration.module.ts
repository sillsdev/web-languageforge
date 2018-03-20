import * as angular from 'angular';
import 'ng-drag-to-reorder';

import {CoreModule} from '../../../../bellows/core/core.module';
import {InputSystemsModule} from '../../../../bellows/core/input-systems/input-systems.service';
import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {FieldConfigurationComponent} from './configuration-fields.component';
import {InputSystemsConfigurationComponent} from './configuration-input-systems.component';
import {OptionListConfigurationComponent} from './configuration-option-lists.component';
import {UnifiedConfigurationComponent} from './configuration-unified.component';
import {LexiconConfigurationComponent} from './configuration.component';

export const LexiconConfigurationModule = angular
  .module('lexiconConfigurationModule', ['ui.bootstrap', 'ngDragToReorder', CoreModule, NoticeModule,
    'palaso.ui.language', 'palaso.ui.tabset', 'palaso.ui.picklistEditor', 'palaso.util.model.transform',
    InputSystemsModule])
  .component('lscConfig', LexiconConfigurationComponent)
  .component('lscUnified', UnifiedConfigurationComponent)
  .component('lscFields', FieldConfigurationComponent)
  .component('lscInputSystems', InputSystemsConfigurationComponent)
  .component('lscOptionLists', OptionListConfigurationComponent)
  .name;
