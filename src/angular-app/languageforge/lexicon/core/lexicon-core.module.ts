import * as angular from 'angular';

import { LexiconSendReceiveApiService } from './lexicon-send-receive-api.service';
import { LexiconSendReceiveService } from './lexicon-send-receive.service';
import { LexiconUtilityService } from './lexicon-utility.service';

export const LexiconCoreModule = angular
  .module('lexiconCoreModule', [])
  .service('lexSendReceiveApi', LexiconSendReceiveApiService)
  .service('lexSendReceive', LexiconSendReceiveService)
  .service('lexUtils', LexiconUtilityService)
  .name;
