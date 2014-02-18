'use strict';

// input systems common functions
	var inputSystems = {
		'languageCodes': function() {
			return _inputSystems_languageCodes;
		},
		'scripts': function() {
			return _inputSystems_scripts;
		},
		'regions': function() {
			return _inputSystems_regions;
		},
		'getCode': function(tag) {
			var tokens = tag.split('-');
			return tokens[0];
		},
		'getScript': function(tag) {
			var tokens = tag.split('-');
			return (tokens[1]) ? tokens[1] : '';
		},
		'getRegion': function(tag) {
			var tokens = tag.split('-');
			return (tokens[2] && tokens[2] != 'x') ? tokens[2] : '';
		},
		'getPrivateUse': function(tag) {
			var i = tag.indexOf('-x-');
			return (i > 0) ? tag.substr(i + 3, tag.length - i + 3): '';
		},
		'getName': function(code, script, region, privateUse) {
			var baseName = _inputSystems_languageCodes[code];
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
			return baseName + ((extraName) ? ' (' + extraName + ')' : '');
		},
	};
	
	var _inputSystems_languageCodes = {
		'en': 'English',
		'qaa': 'Language not listed',
		'th': 'Thai',
		'mi': 'Maori'
	};
	
	var _inputSystems_scripts = {
		'Latn': 'Latin'
	};
	
	var _inputSystems_regions = {
		'NZ': 'New Zealand'
	};
