import * as angular from 'angular';
import { WordParser } from './word-parser.service';
import { DocumentDataService } from './document-data.service';

export const EditorModule = angular
  .module('editorModule', [])
  .service('wordParser', WordParser)
  .service('documentDataService', DocumentDataService)

  ;
