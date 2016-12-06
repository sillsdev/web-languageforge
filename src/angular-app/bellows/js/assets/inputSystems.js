'use strict';

// input systems common functions
var InputSystems = {
  'languages': function (dataType) {
    var unlisted = {
      'name': 'Unlisted Language',
      'code': {
        'three': 'qaa'
      },
      'country': ['?'],
      'altNames': []
    };

    var languages = [];
    switch (dataType) {
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

    if (!unlistedExists) {
      languages.push(unlisted);
    }

    return languages;
  },

  'scripts': function () {
    return _inputSystems_scripts;
  },

  'regions': function () {
    return _inputSystems_regions;
  },

  'isRightToLeft': function (code) {
    // TODO. Enhance. find a source for this list; manually update for now. IJH 2014-04
    var rtlCodes = ['fa', 'fas'];
    return (rtlCodes.indexOf(code) >= 0);
  }

};
