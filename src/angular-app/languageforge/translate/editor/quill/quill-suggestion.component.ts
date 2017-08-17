import * as angular from 'angular';
import { QuillSuggestionController } from './quill-suggestion.controller';

export const QuillSuggestionComponent: angular.IComponentOptions = {
  bindings: {
    qlSuggestions: '<',
    qlInsertSuggestion: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/quill/quill-suggestion.component.html',
  controller: QuillSuggestionController
};
