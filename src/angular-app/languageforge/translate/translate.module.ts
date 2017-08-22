import * as angular from 'angular';

// these are imported here to ensure JS files can use them
import 'angularjs-slider';
import 'angularjs-slider/dist/rzslider.css';
import 'quill';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import 'ng-quill';

import '../../bellows/js/assets/inputSystems';
import './core/translate-core.module';
import './shared/translate-shared.module';
import './editor/editor.module';
import './editor/quill/quill.module'
import './editor/quill/quill.service'

export const TranslateModule = angular
  .module('translateModule', [])
    .name;
