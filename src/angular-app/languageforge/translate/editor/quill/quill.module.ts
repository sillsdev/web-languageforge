import * as angular from 'angular';
import { QuillMoreComponent } from './quill-more.component';
import { QuillSuggestionComponent } from './quill-suggestion.component';
import { registerSuggestionsTheme } from './suggestions-theme';
import 'quill';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';
import 'ng-quill';

export const QuillModule = angular
  .module('quillModule', ['ngQuill'])
  .run(registerSuggestionsTheme)
  .component('qlMore', QuillMoreComponent)
  .component('qlSuggestion', QuillSuggestionComponent)
  .name;
