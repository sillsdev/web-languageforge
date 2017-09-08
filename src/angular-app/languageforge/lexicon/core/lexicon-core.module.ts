import * as angular from 'angular';

import { LexiconUtilityService } from './lexicon-utility.service';

export const LexiconCoreModule = angular
  .module('lexiconCoreModule', [])
  .service('lexUtils', LexiconUtilityService)
  .name;
