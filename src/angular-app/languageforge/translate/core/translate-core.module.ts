import * as angular from 'angular';

import { MachineService } from './machine.service';
import { TranslateProjectService } from './translate-project.service';

export const TranslateCoreModule = angular
  .module('translateCoreModule', [])
  .service('translateProjectApi', TranslateProjectService)
  .service('machineService', MachineService)
  .value('realTime', require('../../../../node/client.js').realTime)
  .name;
