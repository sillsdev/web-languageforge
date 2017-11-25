import * as angular from 'angular';

import { inputSystemsLanguages } from './input-systems.languages';
import { inputSystemsLanguagesSmall } from './input-systems.languages-small';
import { inputSystemsRegions } from './input-systems.regions';
import { inputSystemsScripts } from './input-systems.scripts';

export class InputSystemsService {
  languages(dataType: string = '') {
    const unlisted = {
      name: 'Unlisted Language',
      code: {
        three: 'qaa'
      },
      country: ['?'],
      altNames: [] as string[]
    };

    let languages = [];
    switch (dataType) {
      case 'debug':
        languages = inputSystemsLanguagesSmall;
        break;
      default:
        languages = inputSystemsLanguages;
    }

    let unlistedExists = false;
    for (const language of languages) {
      if (language.code.three === unlisted.code.three){
        unlistedExists = true;
        break;
      }
    }

    if (!unlistedExists) {
      languages.push(unlisted);
    }

    return languages;
  }

  scripts() {
    return inputSystemsScripts;
  }

  regions() {
    return inputSystemsRegions;
  }

  isRightToLeft(code: string) {
    // TODO. Enhance. find a source for this list; manually update for now. IJH 2014-04
    const rtlCodes = ['fa', 'fas'];
    return (rtlCodes.indexOf(code) >= 0);
  }

}

export const InputSystemsModule = angular
  .module('language.inputSystems', [])
  .service('inputSystems', InputSystemsService)
  .name;
