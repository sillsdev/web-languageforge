import * as angular from 'angular';
import { MachineService } from './machine.service';

export const TranslateCoreModule = angular
  .module('translateCoreModule', [])
  .service('machineService', MachineService)
  .value('realTime', require('../../../../node/client.js').realTime)

  ;
