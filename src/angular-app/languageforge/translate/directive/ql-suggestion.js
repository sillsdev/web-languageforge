'use strict';

angular.module('translate.suggest', [])
  .component('qlSuggestion', {
    templateUrl: '/angular-app/languageforge/translate/directive/ql-suggestion.html',
    bindings: {
      qlSuggestions: '<',
      qlInsertSuggestion: '&'
    },
    controller: ['wordParser', function (wordParser) {
      this.wordCombine = wordParser.wordCombine;

      this.wordWidthStyle = function (word, isLast) {
        var words = this.wordCombine(this.qlSuggestions);
        if (words.length <= 0) return;

        var space = (isLast) ? 0 : 1;
        return { width: Math.floor((word.length + space) * 100 / words.length) + '%' };
      };

      this.selectAll = function () {
        var text = this.wordCombine(this.qlSuggestions);
        (this.qlInsertSuggestion || angular.noop)({ text: text });
      };

      this.selectWord = function (index) {
        var text = this.qlSuggestions[index];
        (this.qlInsertSuggestion || angular.noop)({ text: text });
      };
    }]
  })

  ;
