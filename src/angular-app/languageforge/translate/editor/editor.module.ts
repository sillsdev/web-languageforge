import * as angular from 'angular';
import { WordParser } from './word-parser.service';
import { DocumentDataService } from './document-data.service';
import { EditorComponent } from './editor.component';

export const EditorModule = angular
  .module('editorModule', ['ui.router', 'ui.bootstrap', 'bellows.services', 'ngQuill',
    'translateCoreModule', 'translate.quill', 'palaso.ui.showOverflow'])
  .service('wordParser', WordParser)
  .service('documentDataService', DocumentDataService)
  .component('editorComponent', EditorComponent)

  ;
