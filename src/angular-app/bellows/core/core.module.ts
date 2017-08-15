import * as angular from 'angular';
import { BytesFilter, RelativeTimeFilter } from './filters';

export const CoreModule = angular
  .module('coreModule', [])
  .filter('bytes', BytesFilter)
  .filter('relativetime', RelativeTimeFilter)

  ;
