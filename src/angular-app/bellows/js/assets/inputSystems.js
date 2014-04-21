'use strict';

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
