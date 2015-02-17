'use strict';

// Utility functions for parsing dc-* directives (dc-multitext, etc)

var dbeUtil = function() {
  
  //For use inside nested anonymous functions where the value "this" can get lost
  var _this = this; 

  // --- Parsing fields ---

  // Return the multitext's values as [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
  // NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToArray = function(elem) {
    var inputSystemDivs = elem.all(by.repeater('tag in config.inputSystems'));
    return inputSystemDivs.map(function(div) {
      var wsidSpan = div.element(by.css('.controls span.wsid')), 
        wordElem = div.element(by.css('.controls input'));
      return wsidSpan.getText().then(function(wsid) {
        return wordElem.getAttribute('value').then(function(word) {
          return {
            wsid: wsid,
            value: word,
          };
        });
      });
    });
  };
  
  // Return the multitext's values as {en: 'word', de: 'Wort'}
  // NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToObject = function(elem) {
    return _this.dcMultitextToArray(elem).then(function(values) {
      var result = {};
      for (var i = 0, l = values.length; i < l; i++) {
        result[values[i].wsid] = values[i].value;
      }
      return result;
    });
  };
  
  // Returns the value of the multitext's first writing system, no matter what writing system is first
  // NOTE: Returns a promise. Use .then() to access the actual data.
  this.dcMultitextToFirstValue = function(elem) {
    return _this.dcMultitextToArray(elem).then(function(values) {
      return values[0].value;
    });
  };

  this.dcOptionListToValue = function(elem) {
    var select = elem.element(by.css('.controls select'));
    return select.element(by.css('option:checked')).getText().then(function(text) {
      return text;
    });
  };

  // At the moment these are identical to dc-optionlist directives.
  // When they change, this function will need to be rewritten
  this.dcMultiOptionListToValue = function(elem) {
    return _this.dcOptionListToValue(elem);
  };
  
  this.dcPicturesToObject = function(elem) {
    var pictures = elem.all(by.repeater('picture in pictures'));
    return pictures.map(function(div) {
      var img = div.element(by.css('img')),
        caption = div.element(by.css('dc-multitext'));
      return img.getAttribute('src').then(function(src) {
        return {
          'fileName': src.replace(/^.*[\\\/]/, ''),
          'caption': _this.dcMultitextToObject(caption)
        };
      });
    });
  };

  this.dcParsingFuncs = {
    'multitext': {
      'multitext_as_object': _this.dcMultitextToObject,
      'multitext_as_array': _this.dcMultitextToArray,
      'multitext_as_first_value': _this.dcMultitextToFirstValue,
      'default_strategy': 'multitext_as_object'
    },
    'optionlist': _this.dcOptionListToValue,
    'multioptionlist': _this.dcMultiOptionListToValue,
    'pictures': _this.dcPicturesToObject
  };

  this.getParser = function(elem, multitext_strategy) {
    multitext_strategy = multitext_strategy || _this.dcParsingFuncs.multitext.default_strategy;
    var switchDiv = elem.element(by.css('[data-on="config.fields[fieldName].type"] > div'));
    return switchDiv.getAttribute('data-ng-switch-when').then(function(fieldType) {
      var parser;
      if (fieldType == 'multitext') {
        parser = _this.dcParsingFuncs[fieldType][multitext_strategy];
      } else {
        parser = _this.dcParsingFuncs[fieldType];
      }
      return parser;
    });
  };
  
  this.parseDcField = function(elem, multitext_strategy) {
    return _this.getParser(elem, multitext_strategy).then(function(parser) {
      return parser(elem);
    });
  };

  this.getFields = function(searchLabel, rootElem) {
    if (typeof (rootElem) === "undefined") {
      rootElem = element(by.css('dc-entry'));
    }
    return rootElem.all(by.cssContainingText('div[data-ng-repeat="fieldName in config.fieldOrder"]', searchLabel));
  };
  
  this.getFieldValues = function(searchLabel, multitext_strategy, rootElem) {
    return _this.getFields(searchLabel, rootElem).map(function(fieldElem) {
      return _this.parseDcField(fieldElem, multitext_strategy);
    });
  };
  
  this.getOneField = function(searchLabel, idx, rootElem) {
    if (typeof (idx) === "undefined") {
      idx = 0;
    }
    return _this.getFields(searchLabel, rootElem).get(idx);
  };
  
  this.getOneFieldValue = function(searchLabel, idx, multitext_strategy, rootElem) {
    return _this.getOneField(searchLabel, idx, rootElem).then(function(fieldElem) {
      return _this.parseDcField(fieldElem, multitext_strategy);
    });
  };

  // For convenience in writing test code, since the values in testConstants don't match the displayed values
  // No need to worry about localization here, since E2E tests are all run in the English-language interface
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
    v: 'Verb',
  };
  
  // Take an abbreviation for a part of speech and return the value that will
  // appear in the Part of Speech dropdown (for convenience in E2E tests).
  this.expandPartOfSpeech = function(posAbbrev) {
    return _this.partOfSpeechNames[posAbbrev] + ' (' + posAbbrev + ')';
  };
};
module.exports = new dbeUtil();
