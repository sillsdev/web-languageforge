import * as angular from 'angular';
import { _inputSystems_languages } from './inputSystems_languages'
import { _inputSystems_languagesSmall } from './inputSystems_languagesSmall'
import { _inputSystems_regions } from './inputSystems_regions'
import { _inputSystems_scripts } from './inputSystems_scripts'

// input systems common functions
angular.module('language.inputSystems', [])
  .value('inputSystems', {
    languages(dataType: string = '') {
      let unlisted = {
        name: 'Unlisted Language',
        code: {
          three: 'qaa'
        },
        country: ['?'],
        altNames: <string[]>[]
      };

      let languages = [];
      switch (dataType) {
        case 'debug':
          languages = _inputSystems_languagesSmall;
          break;
        default:
          languages = _inputSystems_languages;
      }

      let unlistedExists = false;
      for (let language of languages) {
        if (language.code.three === unlisted.code.three){
          unlistedExists = true;
          break;
        }
      }

      if (!unlistedExists) {
        languages.push(unlisted);
      }

      return languages;
    },

    scripts() {
      return _inputSystems_scripts;
    },

    regions() {
      return _inputSystems_regions;
    },

    isRightToLeft(code: string) {
      // TODO. Enhance. find a source for this list; manually update for now. IJH 2014-04
      const rtlCodes = ['fa', 'fas'];
      return (rtlCodes.indexOf(code) >= 0);
    }

  });
