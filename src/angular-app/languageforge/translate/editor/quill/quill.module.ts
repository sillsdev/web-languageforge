import * as angular from 'angular';
import { QuillMoreComponent } from './quill-more.component';
import { QuillSuggestionComponent } from './quill-suggestion.component';

export const QuillModule = angular
  .module('translate.quill', [])
  .component('qlMore', QuillMoreComponent)
  .component('qlSuggestion', QuillSuggestionComponent)
  .name;
