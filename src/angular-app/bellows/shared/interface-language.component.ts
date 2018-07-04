import * as angular from 'angular';

import {TransifexLanguage, TransifexLive} from '../../../../typings/transifex';
import {InputSystemsService} from '../core/input-systems/input-systems.service';
import {InterfaceConfig} from './model/interface-config.model';

interface WindowService extends angular.IWindowService {
  Transifex?: {
    live: TransifexLive
  };
}

export class InterfaceLanguageController implements angular.IController {
  puiInterfaceConfig: InterfaceConfig;
  puiOnUpdate: (params: { $event: { interfaceConfig: InterfaceConfig } }) => void;

  private transifexLanguageCodes: string[] = [];
  private interfaceConfig: InterfaceConfig;

  static $inject = ['$window'];
  constructor(private readonly $window: WindowService) { }

  $onChanges(changes: any): void {
    const interfaceConfigChange = changes.puiInterfaceConfig as angular.IChangesObject<InterfaceConfig>;
    if (interfaceConfigChange != null && interfaceConfigChange.currentValue != null) {
      this.interfaceConfig = this.puiInterfaceConfig;
      this.changeInterfaceLanguage(this.interfaceConfig.languageCode);
      if (this.$window.Transifex != null) {
        this.$window.Transifex.live.onFetchLanguages(this.onFetchTransifexLanguages);
      }
    }
  }

  onCodeChange(languageCode: string) {
    if (this.interfaceConfig.languageCode !== languageCode) {
      this.changeInterfaceLanguage(languageCode);
    }
  }

  private changeInterfaceLanguage(code: string): void {
    this.interfaceConfig.languageCode = code;
    if (InputSystemsService.isRightToLeft(code)) {
      this.interfaceConfig.direction = 'rtl';
      this.interfaceConfig.pullToSide = 'float-left';
      this.interfaceConfig.pullNormal = 'float-right';
      this.interfaceConfig.placementToSide = 'right';
      this.interfaceConfig.placementNormal = 'left';
    } else {
      this.interfaceConfig.direction = 'ltr';
      this.interfaceConfig.pullToSide = 'float-right';
      this.interfaceConfig.pullNormal = 'float-left';
      this.interfaceConfig.placementToSide = 'left';
      this.interfaceConfig.placementNormal = 'right';
    }

    if (this.$window.Transifex != null && this.transifexLanguageCodes.includes(code)) {
      this.$window.Transifex.live.translateTo(code);
    }

    this.puiOnUpdate({ $event: { interfaceConfig: this.interfaceConfig } });
  }

  private onFetchTransifexLanguages = (languages: TransifexLanguage[]) => {
    this.transifexLanguageCodes = [];
    for (const language of languages) {
      if (!(language.code in this.interfaceConfig.selectLanguages.options)) {
        this.interfaceConfig.selectLanguages.optionsOrder.push(language.code);
      }

      this.interfaceConfig.selectLanguages.options[language.code].name = language.name;
      this.interfaceConfig.selectLanguages.options[language.code].option = language.name;
      this.transifexLanguageCodes.push(language.code);
    }

    this.changeInterfaceLanguage(this.interfaceConfig.languageCode);
  }

}

export const InterfaceLanguageComponent: angular.IComponentOptions = {
  bindings: {
    puiInterfaceConfig: '<',
    puiOnUpdate: '&'
  },
  controller: InterfaceLanguageController,
  templateUrl: '/angular-app/bellows/shared/interface-language.component.html'
};

export const InterfaceLanguageModule = angular
  .module('interfaceLanguageModule', [])
  .component('puiInterfaceLanguage', InterfaceLanguageComponent)
  .name;
