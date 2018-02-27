import * as angular from 'angular';

import { TranslateUtilities } from '../../shared/translate-utilities';

export class QuillSuggestionController implements angular.IController {
  qlSuggestions: string[];
  qlConfidence: number;
  qlInsertSuggestion: (params: { suggestionIndex: number }) => void;

  showSuggestionHelp: boolean = false;

  get isLoading(): boolean {
    return this.qlSuggestions == null || this.qlSuggestions.length === 0;
  }

  wordCombine(words: string[]): string {
    words = words || [];
    return words.join(' ');
  }

  selectAll(): void {
    if (this.qlInsertSuggestion != null) {
      this.qlInsertSuggestion({ suggestionIndex: -1 });
    }
  }

  get confidencePercent(): number {
    return Math.round(this.qlConfidence * 100);
  }

  get suggestionStyle() {
    return TranslateUtilities.suggestionStyle(this.qlConfidence);
  }
}

export const QuillSuggestionComponent: angular.IComponentOptions = {
  bindings: {
    qlSuggestions: '<',
    qlConfidence: '<',
    qlInsertSuggestion: '&'
  },
  templateUrl: '/angular-app/bellows/apps/translate/editor/quill/quill-suggestion.component.html',
  controller: QuillSuggestionController
};
