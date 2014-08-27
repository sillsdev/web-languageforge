'use strict';

// Utility functions for parsing dc-* directives (dc-multitext, etc)
//var util = require('../../bellows/pages/util');  // TODO: Remove if not used once page implemented

var dbeUtil = function() {
	var self = this; // For use inside nested anonymous functions where the value "this" can get lost
	this.dcMultitextToArray = function(elem) {
		// Return the multitext's values as [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
		// NOTE: Returns a promise. Use .then() to access the actual data.
		var inputSystemDivs = elem.all(by.repeater('tag in config.inputSystems'));
		return inputSystemDivs.map(function(div) {
			var wsidSpan = div.$('.controls span.wsid');
			var wordElem = div.$('.controls input');
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
	this.dcMultitextToObject = function(elem) {
		// Return the multitext's values as [{en: 'word', de: 'Wort'}]
		// NOTE: Returns a promise. Use .then() to access the actual data.
		return self.dcMultitextToArray(elem).then(function(values) {
			var result = {};
			for (var i=0,l=values.length; i<l; i++) {
				result[values[i].wsid] = values[i].value;
			}
			return result;
		});
	};
	this.dcMultitextToValue = function(elem) {
		// Returns the value of the multitext's first writing system, no matter what writing system is first
		// NOTE: Returns a promise. Use .then() to access the actual data.
		return self.dcMultitextToArray(elem).then(function(values) {
			return values[0].value;
		});
	};
	
	this.dcOptionListToValue = function(elem) {
		var select = elem.$('.controls select');
		return select.$('option:checked').getText().then(function(text) {
			return text;
		});
	};
	
	this.dcMultiOptionListToValue = function(elem) {
		// At the moment these are identical to dc-optionlist directives.
		// When they change, this function will need to be rewritten
		return self.dcOptionListToValue(elem);
	};
	
	this.dcParsingFuncs = {
		'multitext': {
			'as_object': self.dcMultitextToObject,
			'as_value':  self.dcMultitextToValue,
			'as_array':  self.dcMultitextToArray,
			'default_strategy': 'as_object',
		},
		'optionlist': self.dcOptionListToValue,
		'multioptionlist': self.dcMultiOptionListToValue,
	};
	
	this.getParser = function(elem, multitext_strategy) {
		multitext_strategy = multitext_strategy || self.dcParsingFuncs.multitext.default_strategy;
		var switchDiv = elem.$('[data-on="config.fields[fieldName].type"] > div');
		return switchDiv.getAttribute('data-ng-switch-when').then(function(fieldType) {
			var parser;
			if (fieldType == 'multitext') {
				parser = self.dcParsingFuncs[fieldType][multitext_strategy];
			} else {
				parser = self.dcParsingFuncs[fieldType];
			}
			return parser;
		});
	};
	this.dcParse = function(elem, multitext_strategy) { 
		return self.getParser(elem, multitext_strategy).then(function(parser) {
			return parser(elem);
		});
	};
}
module.exports = new dbeUtil();
