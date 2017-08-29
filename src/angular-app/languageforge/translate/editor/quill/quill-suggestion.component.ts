import * as angular from 'angular';

export class QuillSuggestionController implements angular.IController {
  qlSuggestions: string[];
  qlInsertSuggestion: (params: { suggestionIndex: number }) => void;

  wordCombine(words: string[]): string {
    words = words || [];
    return words.join(' ');
  }

  wordWidthStyle(word: string, isLast: boolean): any {
    const words = this.wordCombine(this.qlSuggestions);
    if (words.length <= 0) {
      return;
    }

    const space = (isLast) ? 0 : 1;
    return { width: Math.floor((word.length + space) * 100 / words.length) + '%' };
  }

  selectAll(): void {
    if (this.qlInsertSuggestion != null) {
      this.qlInsertSuggestion({ suggestionIndex: -1 });
    }
  }

  selectWord(index: number): void {
    if (this.qlInsertSuggestion != null) {
      this.qlInsertSuggestion({ suggestionIndex: index });
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
