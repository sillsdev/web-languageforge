import * as angular from 'angular';
import 'ng-drag-to-reorder';

import {CoreModule} from '../../../../bellows/core/core.module';
import {NoticeModule} from '../../../../bellows/core/notice/notice.module';
import {PickListEditorModule} from '../../../../bellows/shared/pick-list-editor.module';
import {SelectLanguageModule} from '../../../../bellows/shared/select-language.component';
import {TabSetModule} from '../../../../bellows/shared/tabset.module';
import {TypeAheadModule} from '../../../../bellows/shared/type-ahead.module';
import {LexiconCoreModule} from '../../core/lexicon-core.module';
import {ModelTransformModule} from '../../shared/model-transform.directive';
import {AdvancedOptionsConfigurationComponent} from './configuration-advanced-options.component';
import {FieldsConfigurationComponent} from './configuration-fields.component';
import {InputSystemsConfigurationComponent} from './configuration-input-systems.component';
import {OptionListConfigurationComponent} from './configuration-option-lists.component';

export const LexiconConfigurationModule = angular
  .module('lexiconConfigurationModule', [
    'ui.bootstrap',
    'ngDragToReorder',
    CoreModule,
    NoticeModule,
    PickListEditorModule,
    SelectLanguageModule,
    TabSetModule,
    TypeAheadModule,
    ModelTransformModule,
    LexiconCoreModule
  ])
  .component('lscAdvancedOptions', AdvancedOptionsConfigurationComponent)
  .component('lscFields', FieldsConfigurationComponent)
  .component('lscInputSystems', InputSystemsConfigurationComponent)
  .component('lscOptionLists', OptionListConfigurationComponent)
  .name;
