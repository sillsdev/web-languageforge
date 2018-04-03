import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {CoreModule} from '../../../core/core.module';
import {PuiUtilityModule} from '../../../shared/utils/pui-utils.module';
import {TranslateCoreModule} from '../core/translate-core.module';
import {TranslateEditorComponent} from './editor.component';
import {MetricService} from './metric.service';
import {QuillModule} from './quill/quill.module';

export const TranslateEditorModule = angular
  .module('translateEditorModule', [uiRouter, 'ui.bootstrap', CoreModule,
    TranslateCoreModule, QuillModule, PuiUtilityModule])
  .component('translateEditor', TranslateEditorComponent)
  .service('metricService', MetricService)
  .name;
