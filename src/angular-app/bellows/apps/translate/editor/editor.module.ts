import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import { BrowserCheckModule } from '../../../core/browser-check.service';
import { CoreModule } from '../../../core/core.module';
import { PuiUtilityModule } from '../../../shared/utils/pui-utils.module';
import { TranslateCoreModule } from '../core/translate-core.module';
import { TranslateEditorComponent } from './editor.component';
import { MetricService } from './metric.service';
import { QuillModule } from './quill/quill.module';
import { RealTimeService } from './realtime.service';

export const TranslateEditorModule = angular
  .module('translateEditorModule', [uiRouter, 'ui.bootstrap', CoreModule,
    BrowserCheckModule, TranslateCoreModule, QuillModule, PuiUtilityModule])
  .component('translateEditor', TranslateEditorComponent)
  .service('metricService', MetricService)
  .service('realTimeService', RealTimeService)
  .name;
