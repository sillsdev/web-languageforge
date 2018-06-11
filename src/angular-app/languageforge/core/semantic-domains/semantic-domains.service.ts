import * as angular from 'angular';

export class SemanticDomain {
  guid: string;
  key: string;
  abbr: string;
  name: string;
  description: string;
  value: string;
}

export interface SemanticDomains { [key: string]: SemanticDomain; }

interface WindowService extends angular.IWindowService {
  semanticDomains_bn?: SemanticDomains;
  semanticDomains_en?: SemanticDomains;
  semanticDomains_es?: SemanticDomains;
  semanticDomains_fa?: SemanticDomains;
  semanticDomains_fr?: SemanticDomains;
  semanticDomains_hi?: SemanticDomains;
  semanticDomains_id?: SemanticDomains;
  semanticDomains_km?: SemanticDomains;
  semanticDomains_ko?: SemanticDomains;
  semanticDomains_ms?: SemanticDomains;
  semanticDomains_my?: SemanticDomains;
  semanticDomains_ne?: SemanticDomains;
  semanticDomains_pt?: SemanticDomains;
  semanticDomains_ru?: SemanticDomains;
  semanticDomains_swh?: SemanticDomains;
  semanticDomains_te?: SemanticDomains;
  semanticDomains_th?: SemanticDomains;
  semanticDomains_ur?: SemanticDomains;
  semanticDomains_zh_CN?: SemanticDomains;
}

export class SemanticDomainsService {
  private requestedLanguageCode: string = 'en';
  private _languageCode: string;
  private _semanticDomains: SemanticDomains;

  static $inject: string[] = ['$window'];
  constructor(private readonly $window: WindowService) { }

  get data(): SemanticDomains {
    if (this._semanticDomains == null ||
      (this.requestedLanguageCode != null && this.requestedLanguageCode !== this._languageCode)
    ) {
      const semanticDomainProperty = 'semanticDomains_' +
        SemanticDomainsService.propertyCode(this.requestedLanguageCode);
      if (this.$window.hasOwnProperty(semanticDomainProperty) && this.$window[semanticDomainProperty] != null) {
        this._semanticDomains = this.$window[semanticDomainProperty];
        this._languageCode = this.requestedLanguageCode;
      } else {
        this._semanticDomains = this.$window.semanticDomains_en;
        this._languageCode = 'en';
      }
    }

    return this._semanticDomains;
  }

  set languageCode(languageCode: string) {
    if (languageCode !== this._languageCode) {
      this.requestedLanguageCode = languageCode;
    }
  }

  private static propertyCode(languageCode: string = ''): string {
    // replace all '-' with '_'
    return languageCode.split('-').join('_');
  }

}

export const SemanticDomainsModule = angular
  .module('semanticDomainsModule', [])
  .service('semanticDomainsService', SemanticDomainsService)
  .name;
