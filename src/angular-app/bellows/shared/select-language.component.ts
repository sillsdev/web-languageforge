import * as angular from 'angular';

import {InputSystemsModule, InputSystemsService} from '../core/input-systems/input-systems.service';
import {InputSystemLanguage} from './model/input-system-language.model';

export class SelectLanguageController implements angular.IController {
  puiCode: string;
  puiLanguage: InputSystemLanguage;
  puiAddDisabled: boolean;
  puiSuggestedLanguageCodes: string[];

  private readonly LANGUAGE_DOESNT_EXIST = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';

  currentCode = '';
  filterText = this.LANGUAGE_DOESNT_EXIST;
  languages: InputSystemLanguage[];
  searchText: string = '';
  showSuggestions: boolean = false;

  private allLanguages: InputSystemLanguage[] = this.inputSystems.allLanguages();

  static $inject: string[] = ['inputSystems'];
  constructor(private readonly inputSystems: InputSystemsService) { }

  $onInit(): void {
    this.languages = this.buildLanguageList();
    this.puiAddDisabled = true;
  }

  search(): void {
    this.filterText = this.searchText;
    if (this.searchText === '*') {
      this.filterText = '';
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.filterText = this.LANGUAGE_DOESNT_EXIST;
    delete this.languages;
    this.languages = this.buildLanguageList();
    this.showSuggestions = false;
  }

  selectLanguage(language: InputSystemLanguage): void {
    this.currentCode = language.code.three;
    this.puiCode = (language.code.two) ? language.code.two : language.code.three;
    this.puiLanguage = language;
    this.puiAddDisabled = false;
  }

  suggest(): void {
    delete this.languages;
    this.languages = this.buildLanguageList();
    this.filterText = '';
    this.showSuggestions = true;
  }

  // Sort languages with two-letter codes first, then three-letter codes
  private buildLanguageList(): InputSystemLanguage[] {
    const result: InputSystemLanguage[] = [];
    for (const language of this.allLanguages) {
      if (language.code.two != null) {
        result.push(language);
      }
    }

    for (const language of this.allLanguages) {
      if (language.code.two == null) {
        result.push(language);
      }
    }

    return result;
  }

}

export const SelectLanguageComponent: angular.IComponentOptions = {
  bindings: {
    puiCode: '=',
    puiLanguage: '=',
    puiAddDisabled: '=',
    puiSuggestedLanguageCodes: '<?'
  },
  controller: SelectLanguageController,
  templateUrl: '/angular-app/bellows/shared/select-language.component.html'
};

export const SelectLanguageModule = angular
  .module('palasoUILanguageModule', [InputSystemsModule])
  .component('puiSelectLanguage', SelectLanguageComponent)
  .name;
