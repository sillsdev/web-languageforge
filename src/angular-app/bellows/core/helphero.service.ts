import * as angular from 'angular';
import initHelpHero from 'helphero';
import * as helphero from '../../../../typings/help-hero';

export class HelpHeroService {
  static $inject: string[] = [];
  helpHeroClient: helphero.HelpHero;
  constructor() {
    this.helpHeroClient = initHelpHero('9yZMlWWMsDS');
  }
  setIdentity(id: string): void {
    this.helpHeroClient.identify(id);
  }
  setProperty(jObj: any): void {
    this.helpHeroClient.update(jObj);
  }
}

// export const HelpHeroModule = angular
//   .module('helpHeroModule', [])
//   .service('helphero', HelpHeroService)
//   .name;
