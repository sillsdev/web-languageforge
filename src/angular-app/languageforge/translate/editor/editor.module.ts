import * as angular from 'angular';
import { WordParser } from './word-parser.service';

export const EditorModule = angular
  .module('editorModule', [])
  .service('wordParser', WordParser)

  ;
