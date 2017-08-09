import * as angular from 'angular';

export const QuillSuggestionComponent = {
  bindings: {
    qlSuggestions: '<',
    qlInsertSuggestion: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/quill/quill-suggestion.component.html',
  controller: ['wordParser', function (wordParser: any) {
    this.wordCombine = wordParser.wordCombine;

    this.wordWidthStyle = function (word: string, isLast: boolean) {
      let words = this.wordCombine(this.qlSuggestions);
      if (words.length <= 0) return;

      let space = (isLast) ? 0 : 1;
      return { width: Math.floor((word.length + space) * 100 / words.length) + '%' };
    };

    this.selectAll = function () {
      let text = this.wordCombine(this.qlSuggestions);
      (this.qlInsertSuggestion || angular.noop)({ text: text });
    };

    this.selectWord = function (index: number) {
      let text = this.qlSuggestions[index];
      (this.qlInsertSuggestion || angular.noop)({ text: text });
    };
  }]
};
