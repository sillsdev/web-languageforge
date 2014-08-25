'use strict';

// Package to interpret IETF language tag based on BCP 47
// TODO: This is currently only a partial implementation.  2014-08 DDW
// How do we handle private usage x- or grandfathered tags i- ?
// References: http://en.wikipedia.org/wiki/IETF_language_tag
//             http://www.rfc-editor.org/bcp/bcp47.txt

// input systems common functions
var InputSystems = {
	'languages': function(dataType) {
		var unlisted = {
			'name': 'Unlisted Language',
			'code': {
				'three': 'qaa'
			},
			'country': ['?'],
			'altNames': []
		};
		
		var languages = [];
		switch(dataType) {
			case 'debug':
				languages = _inputSystems_languagesSmall;
				break;
			default:
				languages = _inputSystems_languages;
		}
		
		var unlistedExists = false;
		angular.forEach(languages, function (language){
			if (language.code.three == unlisted.code.three){
				unlistedExists = true;
				return;
			}
		});
		if (! unlistedExists) {
			languages.push(unlisted);
		}
		
		return languages;
	},
	'scripts': function() {
		return _inputSystems_scripts;
	},
	'regions': function() {
		return _inputSystems_regions;
	},
	'isRightToLeft': function(code) {
		var rtlCodes = ['fa', 'fas'];	// TODO. Enhance. find a source for this list; manually update for now. IJH 2014-04
		return (rtlCodes.indexOf(code) >= 0);
	},
	// Parse for the primary language subtag
	'getCode': function(tag) {
		var tokens = tag.split('-');
		return tokens[0];
	},
	// Parse for the 4-letter script code
	// RFC 5646 2.2.3 Script Subtag
	'getScript': function(tag) {
		var tokens = tag.split('-');
		for (var i=1, l=tokens.length; i<l; i++) {
			if ((/^[a-zA-Z]{4}$/.test(tokens[i])) &&
				(tokens[i] in _inputSystems_scripts)) {
				return tokens[i];
			}
		}
		return '';
	},
	// Parse for the 2 letter or 3 digit region code
	// RFC 5646 2.2.4 Region Subtag
	'getRegion': function(tag) {
		var tokens = tag.split('-');
		for (var i=1, l=tokens.length; i<l; i++) {
			if ((/^[a-zA-Z]{2}$/.test(tokens[i]) ||
				 /^[0-9]{3}$/.test(tokens[i])) &&
				(tokens[i] in _inputSystems_regions)) {
				return tokens[i];
			}
		}
		return '';
	},
	// Parse for the variant subtag
	// Deviation from RFC 5646 2.2.5 Variant Subtag
	// Since SIL treats variant field as unregistered private use.
	'getVariant': function(tag) {
		var tokens = tag.split('-');
		for (var i= 1, l=tokens.length; i<l; i++) {
			if ((tokens[i] == 'x') && (i+1 < l) ) {
				console.log('variant: ' + tokens[i+1]);
				return tokens[i+1];
			}
		}
	},
	'getPrivateUse': function(tag) {
		var i = tag.indexOf('-x-');
		if (i > 0) {
			console.log(tag);
		}
		return (i > 0) ? tag.substr(i + 3, tag.length - i + 3): '';
	},
	'getName': function(languageName, tag) {
		var script = this.getScript(tag);
		var region = this.getRegion(tag);
		var privateUse = this.getPrivateUse(tag);
		var extraName = '';
		switch (script) {
			case '':
				break;
			case 'fonipa':
				extraName = 'IPA' + ((privateUse) ? '-' + privateUse : '');
				break;
			case 'Zxxx':
				if (privateUse == 'audio') {
					extraName = 'Voice';
					break;
				}
			default:
				extraName = script + ((region) ? '-' + region : '');
		}
		return languageName + ((extraName) ? ' (' + extraName + ')' : '');
	}
};
