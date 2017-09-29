import * as angular from 'angular';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService } from './breadcrumb.service';

export const BreadcrumbModule = angular
  .module('sgw.ui.breadcrumb', [])
  .component('breadcrumbs', BreadcrumbComponent)
  .service('breadcrumbService', BreadcrumbService)
  .name;
