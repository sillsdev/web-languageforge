'use strict';

angular.module('translate.services')
  .service('wordParser', [
  function () {
    this.wordCombine = function (words) {
      words = words || [];
      return words.join(this.charSpace());
    }.bind(this);

    this.wordBreak = function wordBreak(text) {
      return text.split(this.charSpace());
    };

    this.isWordComplete = function isWordComplete(word) {
      word = word || '';
      return word.endsWith(this.charSpace()) || word.endsWith('.') || word.endsWith(',');
    };

    this.startIndexOfWordAt = function startIndexOfWordAt(index, words) {
      var startIndex = 0;
      var nextStartIndex = 0;
      angular.forEach(words, function (word) {
        nextStartIndex += word.length + 1;
        if (index < nextStartIndex) return;

        startIndex = nextStartIndex;
      });

      return startIndex;
    };

    this.lengthOfWordAt = function lengthOfWordAt(index, words) {
      var wordLength = words[0].length;
      var startIndex = 0;
      angular.forEach(words, function (word, wordIndex) {
        startIndex += word.length + 1;
        if (index < startIndex) return;

        wordLength = (words[wordIndex + 1]) ? words[wordIndex + 1].length : 0;
      });

      return wordLength;
    };

    this.charSpace = function charSpace() {
      return ' ';
    };

  }])

  ;
