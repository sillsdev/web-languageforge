'use strict';

// Package to interpret IETF language tag based on BCP 47
// TODO: This is currently only a partial implementation.  2014-08 DDW
// Nomenclature
// Code:   2-3 letter language code
// Script: 4-letter script code (RFC 5646 2.2.3 Script Subtag)
// Region: 2-letter or 3-number region code (RFC 5646 2.2.4 Region Subtag)
// Variant: 5-8 letter variant code (currently using 'fonipa')
//          Deviation from RFC 5646 2.2.5 Variant Subtag
// Private Use: Private usage of variant field, prefix of 'x-'.
//              Traditionally used by linguists to name their language group.
//              x-etic : raw phonetic transcription
//              x-emic : uses the phonology of the language
//              x-audio is also used for audio transcript
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
	// Parse the tag and populate the inputSystem fields based on subtags.
	'parseTag': function(inputSystem, tag) {
		var tokens = tag.split('-');
		var lookForPrivateUsage = false;
		inputSystem.privateUsage = '';

		// Assumption we will never have an entire tag that is private
		// usage or grandfathered (entire tag starts with x- or i-)

		// Language code
		inputSystem.code = tokens[0];

		// Parse the rest of the language tag
		for (var i= 1, l=tokens.length; i<l; i++) {

			if (!lookForPrivateUsage) {
				// Script
				if ((/^[a-zA-Z]{4}$/.test(tokens[i])) &&
					(tokens[i] in _inputSystems_scripts)) {
					inputSystem.script = tokens[i];
					continue;
				}

				// Region
				if ((/^[a-zA-Z]{2}$/.test(tokens[i]) ||
					/^[0-9]{3}$/.test(tokens[i])) &&
					(tokens[i] in _inputSystems_regions)) {
					inputSystem.region = tokens[i];
					continue;
				}

				// IPA variant
				// TODO regex for registered variants 5-8 letters or 4 digits?  2014-08 DDW
				if (tokens[i] == 'fonipa') {
					console.log('variant IPA');
					inputSystem.variant = tokens[i];
					continue;
				}

				// Special marker for private usage
				if (tokens[i] == 'x') {
					lookForPrivateUsage = true;
					continue;
				}

			// Parse for the rest of the private usage tags
			} else {
				// Special purpose
				if ((tokens[i] == 'audio') ||
					(tokens[i] == 'etic') ||
					(tokens[i] == 'emic')) {
					console.log('purpose: ' + tokens[i]);
					inputSystem.purpose = tokens[i];
					continue;
				}

				// Private Usage
				console.log('concat priv: ' + tokens[i]);
				inputSystem.privateUsage += tokens[i];
				// Concatenate if there's more private use tags
				if (i + 1 < l) {
					inputSystem.privateUsage += '-';
				}
				continue;
			}
		}
	}
};
