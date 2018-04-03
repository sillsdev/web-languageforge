import * as angular from 'angular';

import {MockUploadComponent} from './mock-upload.component';

export const MockModule = angular
  .module('mockModule', [])
  .component('puiMockUpload', MockUploadComponent)
  .name;
