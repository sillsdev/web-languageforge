'use strict';

module.exports = new EditorUtil();

// Utility functions for parsing dc-* directives (dc-multitext, etc)
function EditorUtil() {
  // --- Parsing fields ---

  // Return the multitext's values as [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
  // NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToArray = function dcMultitextToArray(elem) {
    var inputSystemDivs = elem.all(by.repeater('tag in config.inputSystems'));
    return inputSystemDivs.map(function (div) {
      var wsidSpan = div.element(by.css('.input-group > span.wsid'));
      var wordInput = div.element(by.css('.input-group > .dc-formattedtext input'));
      return wsidSpan.getText().then(function (wsid) {
        return wordInput.isPresent().then(function (isWordPresent) {
          if (isWordPresent) {
            return wordInput.getAttribute('value').then(function (word) {
              return {
                wsid: wsid,
                value: word
              };
            });
          } else {
            return { wsid: wsid, value: '' };
          }
        });
      });
    });
  };

  // Return the multitext's values as {en: 'word', de: 'Wort'}
  // NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToObject = function (elem) {
    return this.dcMultitextToArray(elem).then(function (values) {
      var result = {};
      for (var i = 0, l = values.length; i < l; i++) {
        result[values[i].wsid] = values[i].value;
      }

      return result;
    });
  }.bind(this);

  // Returns the value of the multitext's first writing system, no matter what writing system is
  // first. NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToFirstValue = function dcMultitextToFirstValue(elem) {
    return this.dcMultitextToArray(elem).then(function (values) {
      return values[0].value;
    });
  };

  this.dcOptionListToValue = function dcOptionListToValue(elem) {
    var select = elem.element(by.css('.controls select'));
    return select.element(by.css('option:checked')).getText().then(function (text) {
      return text;
    });
  };

  // At the moment these are identical to dc-optionlist directives.
  // When they change, this function will need to be rewritten
  this.dcMultiOptionListToValue = this.dcOptionListToValue;

  this.dcPicturesToObject = function (elem) {
    var pictures = elem.all(by.repeater('picture in pictures'));
    return pictures.map(function (div) {
      var img = div.element(by.css('img'));
      var caption = div.element(by.css('dc-multitext'));
      return img.getAttribute('src').then(function (src) {
        return {
          fileName: src.replace(/^.*[\\\/]/, ''),
          caption: this.dcMultitextToObject(caption)
        };
      }.bind(this));
    }.bind(this));
  }.bind(this);

  this.dcParsingFuncs = {
    multitext: {
      multitext_as_object: this.dcMultitextToObject,
      multitext_as_array: this.dcMultitextToArray,
      multitext_as_first_value: this.dcMultitextToFirstValue,
      default_strategy: 'multitext_as_object'
    },
    optionlist: this.dcOptionListToValue,
    multioptionlist: this.dcMultiOptionListToValue,
    pictures: this.dcPicturesToObject
  };

  this.getParser = function getParser(elem, multitextStrategy) {
    multitextStrategy = multitextStrategy || this.dcParsingFuncs.multitext.default_strategy;
    var switchDiv = elem.element(by.css('[data-on="config.fields[fieldName].type"] > div'));
    return switchDiv.getAttribute('data-ng-switch-when').then(function (fieldType) {
      var parser;
      if (fieldType == 'multitext') {
        parser = this.dcParsingFuncs[fieldType][multitextStrategy];
      } else {
        parser = this.dcParsingFuncs[fieldType];
      }

      return parser;
    }.bind(this));
  };

  this.parseDcField = function parseDcField(elem, multitextStrategy) {
    return this.getParser(elem, multitextStrategy).then(function (parser) {
      return parser(elem);
    });
  };

  this.getFields = function getFields(searchLabel, rootElem) {
    if (typeof (rootElem) === 'undefined') {
      rootElem = element(by.className('dc-entry'));
    }

    return rootElem.all(by.cssContainingText('div[data-ng-repeat="fieldName in config.fieldOrder"]',
      searchLabel));
  };

  this.getFieldValues = function (searchLabel, multitextStrategy, rootElem) {
    return this.getFields(searchLabel, rootElem).map(function (fieldElem) {
      return this.parseDcField(fieldElem, multitextStrategy);
    }.bind(this));
  }.bind(this);

  this.getOneField = function getOneField(searchLabel, idx, rootElem) {
    if (typeof (idx) === 'undefined') {
      idx = 0;
    }

    return this.getFields(searchLabel, rootElem).get(idx);
  };

  this.getOneFieldValue = function getOneFieldValue(searchLabel, idx, multitextStrategy, rootElem) {
    var fieldElement = this.getOneField(searchLabel, idx, rootElem);
    return this.parseDcField(fieldElement, multitextStrategy);
  };

  // For convenience in writing test code, since the values in testConstants don't match the
  // displayed values. No need to worry about localization here, since E2E tests are all run in the
  // English-language interface.
  this.partOfSpeechNames = {
    adj: 'Adjective',
    adv: 'Adverb',
    cla: 'Classifier',
    n: 'Noun',
    nprop: 'Proper Noun',
    num: 'Numeral',
    p: 'Particle',
    prep: 'Preposition',
    pro: 'Pronoun',
    v: 'Verb'
  };

  // Take an abbreviation for a part of speech and return the value that will
  // appear in the Part of Speech dropdown (for convenience in E2E tests).
  this.expandPartOfSpeech = function expandPartOfSpeech(posAbbrev) {
    return this.partOfSpeechNames[posAbbrev] + ' (' + posAbbrev + ')';
  };

  // designed for use with Text-Angular controls (i.e. that don't have ordinary input or textarea)
  this.selectElement = {
    sendKeys: function sendKeys(element, keys) {
      element.click();
      browser.actions().sendKeys(keys).perform();
    },

    clear: function clear(element) {
      element.click();
      var ctrlA = protractor.Key.chord(protractor.Key.CONTROL, 'a');
      browser.actions().sendKeys(ctrlA).perform();
      browser.actions().sendKeys(protractor.Key.DELETE).perform();
    }
  };
}
