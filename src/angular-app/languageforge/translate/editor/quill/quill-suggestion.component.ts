import * as angular from 'angular';

export class QuillSuggestionController implements angular.IController {
  qlSuggestions: string[];
  qlInsertSuggestion: (params: { suggestionIndex: number }) => void;

  showSuggestionHelp: boolean = false;

  wordCombine(words: string[]): string {
    words = words || [];
    return words.join(' ');
  }

  selectAll(): void {
    if (this.qlInsertSuggestion != null) {
      this.qlInsertSuggestion({ suggestionIndex: -1 });
    }
  }

}

export const QuillSuggestionComponent: angular.IComponentOptions = {
  bindings: {
    qlSuggestions: '<',
    qlInsertSuggestion: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/quill/quill-suggestion.component.html',
  controller: QuillSuggestionController
};
