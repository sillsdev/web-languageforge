'use strict';

// input systems common functions
	var inputSystems = {
		'languageCodes': function() {
			return _inputSystems_languageCodes;
		},
		'code': function(tag) {
			var tokens = tag.split('-');
			return tokens[0];
		},
		'script': function(tag) {
			var tokens = tag.split('-');
			return (tokens[1]) ? tokens[1] : '';
		},
		'region': function(tag) {
			var tokens = tag.split('-');
			return (tokens[2] && tokens[2] != 'x') ? tokens[2] : '';
		},
		'privateUse': function(tag) {
			var i = tag.indexOf('-x-');
			return (i > 0) ? tag.substr(i + 3, tag.length - i + 3): '';
		},
		'name': function(code, script, region, privateUse) {
			var baseName = _inputSystems_languageCodes[code];
			var extraName = '';
			switch (script) {
				case '':
					break;
				case 'fonipa':
					extraName = 'IPA';
					if (privateUse == 'etic') {
						extraName += '-etic';
					}
					if (privateUse == 'emic') {
						extraName += '-emic';
					}
					break;
				case 'Zxxx':
					if (privateUse == 'audio') {
						extraName = 'Voice';
					}
					break;
				default:
					extraName = script + '-' + region;
			}
			return baseName + ((extraName) ? ' (' + extraName + ')' : '');
		},
	};
	
	var _inputSystems_languageCodes = {
		'en': 'English',
		'qaa': 'Language not listed',
		'th': 'Thai',
		'mi': 'Maori'
	};
	
