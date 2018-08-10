import * as angular from 'angular';

import { MachineService } from './machine.service';
import { ParatextService } from './paratext.service';
import { SecondsToTimeFilter } from './seconds-to-time.filter';
import { TranslateProjectService } from './translate-project.service';
import { TranslateRightsService } from './translate-rights.service';
import { TranslateSendReceiveApiService } from './translate-send-receive-api.service';
import { TranslateSendReceiveService } from './translate-send-receive.service';

export const TranslateCoreModule = angular
  .module('translateCoreModule', [])
  .service('translateProjectApi', TranslateProjectService)
  .service('translateRightsService', TranslateRightsService)
  .service('machineService', MachineService)
  .service('translateSendReceiveApiService', TranslateSendReceiveApiService)
  .service('translateSendReceiveService', TranslateSendReceiveService)
  .service('paratextService', ParatextService)
  .filter('secondsToTime', SecondsToTimeFilter)
  .name;
