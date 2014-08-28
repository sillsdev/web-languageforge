'use strict';

// Utility functions for parsing dc-* directives (dc-multitext, etc)
//var util = require('../../bellows/pages/util');  // TODO: Remove if not used once page implemented

var dbeUtil = function() {
	var self = this; // For use inside nested anonymous functions where the value "this" can get lost
	
	// --- Parsing fields ---
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
	this.dcMultitextToFirstValue = function(elem) {
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
			'multitext_as_object': self.dcMultitextToObject,
			'multitext_as_array':  self.dcMultitextToArray,
			'multitext_as_first_value': self.dcMultitextToFirstValue,
			'default_strategy': 'multitext_as_object',
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
	this.parseDcField = function(elem, multitext_strategy) { 
		return self.getParser(elem, multitext_strategy).then(function(parser) {
			return parser(elem);
		});
	};

	// --- Parsing entries ---
	this.getVisibleFields = function(elems) {
		// Parameter elems should be an ElementArrayFinder, e.g. element.all(by.repeater('foo in bar'))
		return elems.map(function(div) {
			var label = div.$('label:not(.ng-hide)');
			return label.isPresent().then(function(present) {
				if (present) {
					return label.getText().then(function(labelText) {
						return { label: labelText, div: div };
					});
				} else {
					// Return undefined to mean "skip this field", but wrapped in a promise for API consistency
					return protractor.promise.fulfilled(undefined);
				}
			});
		}).then(function(results) {
			return results.filter(function(x) { return (typeof(x) != "undefined"); });
		});
	};
	this.getFieldsByLabel = function(elems) {
		return this.getVisibleFields(elems).then(function(fields) {
			var result = {};
			fields.forEach(function(field) {
				result[field.label] = field.div;
			});
			return result;
		});
	};
	
	this.getElemsOfDcEntry = function(elem) {
		var rootDiv = elem.$('div.dc-entry');
		// var fieldDivs = elem.all(by.repeater('fieldName in config.fieldOrder')); // NOPE. Grabs descendants too.
		var fieldDivs = elem.$$('div.dc-entry > div[data-ng-repeat="fieldName in config.fieldOrder"]');
		var sensesDiv = elem.$( 'div.dc-entry > div[ng-if="config.fields.senses.fieldOrder.length > 0"]');
		var senses = sensesDiv.all(by.repeater('sense in model.senses'));
		return this.getFieldsByLabel(fieldDivs).then(function(entryFields) {
			entryFields.senses = senses.map(function(senseDiv) {
				return self.getElemsOfDcSense(senseDiv);
			});
			return entryFields;
		});
	};
	
	this.getElemsOfDcSense = function(elem) {
		var fieldDivs   = elem.$$('div.dc-sense > div[data-ng-repeat="fieldName in config.fieldOrder"]');
		var examplesDiv = elem.$( 'div.dc-sense > div[data-ng-if="config.fields.examples.fieldOrder.length > 0"]');
		var examples = examplesDiv.all(by.repeater('example in model.examples'))
		return this.getFieldsByLabel(fieldDivs).then(function(senseFields) {
			senseFields.examples = examples.map(function(exampleDiv) {
				return self.getElemsOfDcExample(exampleDiv);
			});
			return senseFields;
		});
	};
	
	this.getElemsOfDcExample = function(elem) {
		var fieldDivs = elem.$$('div.dc-example > div[data-ng-repeat="fieldName in config.fieldOrder"]');
		return this.getFieldsByLabel(fieldDivs);
	};
	
	this.parseDcEntry = function(elem) {
		// Might want to re-write it so the calling code calls the getElems function, for consistency
		return this.getElemsOfDcEntry(elem).then(function(data) {
			for (var label in data) {
				if (label == "senses") {
					data[label] = self.parseDcSenses(data[label]);
				} else {
					data[label] = self.parseDcField(data[label]);
				}
			}
			return data;
		});
	};
	this.parseDcSenses = function(senses) {
		return senses.then(function(sensesData) {
			// Senses data will be a list of { 'Label 1': elementFinder1, 'Label 2': elementFinder2 } objects
			var result = [];
			sensesData.forEach(function(fields) {
				for (var label in fields) {
					if (label == "examples") {
						fields[label] = self.parseDcExamples(fields[label]);
					} else {
						fields[label] = self.parseDcField(fields[label]);
					}
				}
				result.push(fields);
			});
			return result;
		});
	};
	this.parseDcExamples = function(examplesData) {
		// Note that this function does NOT receive a promise, unlike parseDcSenses
		// Examples data will be a list of { 'Label 1': elementFinder1, 'Label 2': elementFinder2 } objects
		var result = [];
		examplesData.forEach(function(fields) {
			for (var label in fields) {
				var div = fields[label];
				fields[label] = self.parseDcField(div);
			}
			result.push(fields);
		});
		return result;
	};
};
module.exports = new dbeUtil();

// New parser for dc-entry elements.
// Structure returned:
//{
//	'Word': {'th': 'ว่า', 'thipa': 'wâa'},
//	// Other fields like "Import Residue" would go here if visible
//	senses: [{
//		'Meaning': {'en': 'that, as'},
//		'Part of Speech': 'prep',
//		'General Note': {'en': 'Most common usage'},
//		examples: [{'Example': {'th': 'ผมยังอดสงสัยไม่ได้ว่า'},
//		            'Translation': {'en': 'I can\'t help but think that...'}},
//		            {'Example': {'th': 'เชื่อกันมานมนานแล้วว่า'},
//		             'Translation': {'en': 'We have believed for a long time that...'}}],
//	}, {
//		'Meaning': {'en': 'say, speak'},
//		'Part of Speech': 'v',
//		'General Note': {'en': 'This meaning is almost as common'},
//		examples: [{'Example': {'th': 'คำนี้ภาษาอังกฤษว่ายังไง'},
//		            'Translation': {'en': 'How do you say this word in English?'}},
//		            {'Example': {'th': 'ว่าแต่เขา อิเหนาเป็นเอง'},
//		             'Translation': {'en': 'The pot calls the kettle black.'}}],
//	}],
//}

// Note that the "senses" array will always be present, even if empty. The "examples" array may be absent.
// IMPORTANT NOTE: The values in that structure will be PROMISES, not actual values (yet). You can use
// them in expect(foo).toBe(bar), but if trying to print them, don't forget to do "foo.then(console.log);".

