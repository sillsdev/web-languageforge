import * as angular from 'angular';

import {InputSystemLanguage} from '../../shared/model/input-system-language.model';
import {inputSystemsLanguagesSmall} from './input-systems-languages-small.generated-data';
import {inputSystemsLanguages} from './input-systems-languages.generated-data';
import {inputSystemsRegions} from './input-systems-regions.generated-data';
import {inputSystemsScripts} from './input-systems-scripts.generated-data';

export class InputSystemsService {
  private languages: InputSystemLanguage[];
  private dataType: string;

  allLanguages(dataType?: string): InputSystemLanguage[] {
    if (this.languages == null || dataType !== this.dataType) {
      this.languages = InputSystemsService.getLanguages(dataType);
      this.dataType = dataType;
    }

    return this.languages;
  }

  private static getLanguages(dataType: string = ''): InputSystemLanguage[] {
    const unlisted: InputSystemLanguage = {
      name: 'Unlisted Language',
      code: {
        three: 'qaa'
      },
      country: ['?'],
      altNames: [] as string[]
    };

    let languages: InputSystemLanguage[] = [];
    switch (dataType) {
      case 'debug':
        languages = inputSystemsLanguagesSmall;
        break;
      default:
        languages = inputSystemsLanguages;
    }

    let unlistedExists = false;
    for (const language of languages) {
      if (language.code.three === unlisted.code.three) {
        unlistedExists = true;
        break;
      }
    }

    if (!unlistedExists) {
      languages.push(unlisted);
    }

    return languages;
  }

  static scripts(): InputSystemsScripts {
    return inputSystemsScripts;
  }

  static regions(): InputSystemsRegions {
    return inputSystemsRegions;
  }

  static isRightToLeft(code: string) {
    // TODO. Enhance. find a source for this list; manually update for now. IJH 2014-04
    const rtlCodes = ['fa', 'fas'];
    return (rtlCodes.includes(code));
  }

}

export type InputSystemsScript = string[];
export type InputSystemsRegion = string;

interface InputSystemsScripts { [scriptCode: string]: InputSystemsScript; }
interface InputSystemsRegions { [regionCode: string]: InputSystemsRegion; }

export const InputSystemsModule = angular
  .module('inputSystemsModule', [])
  .service('inputSystems', InputSystemsService)
  .name;
