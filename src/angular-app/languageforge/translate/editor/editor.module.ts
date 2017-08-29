import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import { TranslateCoreModule } from '../core/translate-core.module';
import { EditorComponent } from './editor.component';
import { QuillModule } from './quill/quill.module';

export const EditorModule = angular
  .module('editorModule', [uiRouter, 'ui.bootstrap', 'bellows.services',
    TranslateCoreModule, QuillModule, 'palaso.ui.showOverflow'])
  .component('editorComponent', EditorComponent)
  .name;
