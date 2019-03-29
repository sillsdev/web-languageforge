import * as angular from 'angular';
import 'oclazyload';

export interface SemanticDomain {
  guid: string;
  key: string;
  abbr: string;
  name: string;
  description: string;
  value: string;
}

export interface SemanticDomains { [key: string]: SemanticDomain; }

interface SemanticDomainProperties {
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

interface WindowService extends angular.IWindowService, SemanticDomainProperties { }

export class SemanticDomainsService {
  private readonly semanticDomainLanguageCodes = ['bn', 'en', 'es', 'fa', 'fr', 'hi', 'id', 'km', 'ko', 'ms', 'my',
    'ne', 'pt', 'ru', 'swh', 'te', 'th', 'ur', 'zh-CN'];
  private _languageCode: string = 'en';
  private _semanticDomains: SemanticDomains;

  static $inject: string[] = ['$ocLazyLoad', '$q',
    '$window'];
  constructor(private readonly $ocLazyLoad: oc.ILazyLoad, private readonly $q: angular.IQService,
              private readonly $window: WindowService) { }

  get data(): SemanticDomains {
    if (this._semanticDomains == null && this.isSemanticDomainFileLoaded(this._languageCode)) {
      this._semanticDomains = this.$window[SemanticDomainsService.property(this._languageCode)];
    }

    return this._semanticDomains;
  }

  setLanguageCode(languageCode: string): angular.IPromise<void> {
    if (languageCode !== this._languageCode && this.semanticDomainLanguageCodes.includes(languageCode)) {
      if (this.isSemanticDomainFileLoaded(languageCode)) {
        this._semanticDomains = this.$window[SemanticDomainsService.property(languageCode)];
        this._languageCode = languageCode;
      } else {
        return this.loadSemanticDomainFile(languageCode);
      }
    }

    return this.$q.when();
  }

  private isSemanticDomainFileLoaded(languageCode: string): boolean {
    const semanticDomainProperty = SemanticDomainsService.property(languageCode);
    return this.$window.hasOwnProperty(semanticDomainProperty) && this.$window[semanticDomainProperty] != null;
  }

  private loadSemanticDomainFile(languageCode: string = 'en'): angular.IPromise<void> {
    const semanticDomainFile = '/angular-app/languageforge/core/semantic-domains/semantic-domains.' +
      languageCode + '.generated-data.js';
    return this.$ocLazyLoad.load(semanticDomainFile).then(() => {
      this._semanticDomains = this.$window[SemanticDomainsService.property(languageCode)];
      this._languageCode = languageCode;
    });
  }

  private static property(languageCode: string = 'en'): string {
    // replace all '-' with '_'
    return 'semanticDomains_' + languageCode.split('-').join('_');
  }

}

export const SemanticDomainsModule = angular
  .module('semanticDomainsModule', ['oc.lazyLoad'])
  .service('semanticDomainsService', SemanticDomainsService)
  .name;
