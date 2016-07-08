'use strict';

angular.module('lexicon.services')

  .service('lexUtils', [function () {

    function getFirstField(config, node, fieldName) {
      var result = '';
      var ws;
      var field;
      if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
          config.fields[fieldName].inputSystems) {
        for (var i = 0; i < config.fields[fieldName].inputSystems.length; i++) {
          ws = config.fields[fieldName].inputSystems[i];
          field = node[fieldName][ws];
          if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
            result = field.value;
            break;
          }
        }
      }

      return result;
    }

    function getFields(config, node, fieldName, delimiter) {
      var result = '';
      if (typeof (delimiter) === 'undefined') delimiter = ' ';
      if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
        config.fields[fieldName].inputSystems) {
        angular.forEach(config.fields[fieldName].inputSystems, function (inputSystem) {
          var field = node[fieldName][inputSystem];
          if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
            if (result) {
              result += delimiter + field.value;
            } else {
              result = field.value;
            }
          }
        });
      }

      return result;
    }

    /**
     *
     * @param config - entry config obj
     * @param entry
     * @returns {string}
     */
    this.getLexeme = function getLexeme(config, entry) {
      return getFirstField(config, entry, 'lexeme');
    };

    this.getWords = function getWords(config, entry) {
      return getFields(config, entry, 'lexeme');
    };

    this.getCitationForms = function (config, entry) {
      if (!angular.isDefined(entry.lexeme)) {
        return '';
      }
      var citation = '';
      var citationFormByInputSystem = {};
      if (angular.isDefined(config.fields.citationForm)) {
        angular.forEach(config.fields.citationForm.inputSystems, function (inputSystem) {
          if (angular.isDefined(entry.citationForm)) {
            var field = entry.citationForm[inputSystem];
            if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
              citationFormByInputSystem[inputSystem] = field.value;
            }
          }
        });
      }

      angular.forEach(config.fields.lexeme.inputSystems, function (inputSystem) {
        var field = entry.lexeme[inputSystem];
        var valueToAppend = '';
        if (angular.isDefined(citationFormByInputSystem[inputSystem])) {
          valueToAppend = citationFormByInputSystem[inputSystem];
        } else if (angular.isDefined(field) && angular.isDefined(field.value)) {
          valueToAppend = field.value;
        }

        if (valueToAppend) {
          if (citation) {
            citation += ' ' + valueToAppend;
          } else {
            citation += valueToAppend;
          }
        }
      });

      return citation;
    };

    this.getDefinition = function getDefinition(config, sense) {
      return getFirstField(config, sense, 'definition');
    };

    this.getGloss = function getGloss(config, sense) {
      return getFirstField(config, sense, 'gloss');
    };

    this.getMeaning = function getMeaning(config, sense) {
      var meaning = this.getDefinition(config, sense);
      if (!meaning) {
        meaning = this.getGloss(config, sense);
      }

      return meaning;
    };

    this.getMeanings = function getMeanings(config, sense) {
      var meaning = getFields(config, sense, 'definition');
      if (!meaning) {
        meaning = getFields(config, sense, 'gloss');
      }

      return meaning;
    };

    this.getExampleSentence = function getExampleSentence(config, example) {
      return getFields(config, example, 'sentence');
    };

    this.getPartOfSpeechAbbreviation = function getPartOfSpeechAbbreviation(posModel, optionlists) {
      if (posModel) {
        if (optionlists) {
          var abbreviation = '';
          angular.forEach(optionlists, function (optionlist) {
            if (optionlist.code == 'partOfSpeech' || optionlist.code == 'grammatical-info') {
              angular.forEach(optionlist.items, function (item) {
                if (item.key == posModel.value) {
                  abbreviation = item.abbreviation;
                }
              });
            }
          });

          if (abbreviation)
            return abbreviation;
        }

        // capture text inside parentheses
        var myRegexp = /\((.*)\)/;
        var match = myRegexp.exec(posModel.value);
        if (match && match.length > 1) {
          return match[1];
        } else if (!posModel.value) {
          return '';
        } else {
          return posModel.value.toLowerCase().substring(0, 5);
        }
      }

      return '';
    };

  }]);
