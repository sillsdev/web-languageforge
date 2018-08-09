import * as angular from 'angular';

import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {InternationalTelephoneInputModule} from './international-telephone-input.directive';
import {UserProfileAppComponent} from './user-profile-app.component';

export const UserProfileAppModule = angular
  .module('userprofile', [
    'ui.bootstrap',
    BreadcrumbModule,
    CoreModule,
    NoticeModule,
    InternationalTelephoneInputModule
  ])
  .component('userProfileApp', UserProfileAppComponent)
  .name;
