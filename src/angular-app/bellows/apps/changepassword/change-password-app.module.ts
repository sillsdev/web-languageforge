import * as angular from 'angular';

import {BreadcrumbModule} from '../../core/breadcrumbs/breadcrumb.module';
import {BrowserCheckModule} from '../../core/browser-check.service';
import {CoreModule} from '../../core/core.module';
import {NoticeModule} from '../../core/notice/notice.module';
import {PuiUtilityModule} from '../../shared/utils/pui-utils.module';
import {ChangePasswordAppComponent} from './change-password-app.component';

export const ChangePasswordAppModule = angular
  .module('changepassword', ['ui.bootstrap', 'ui.validate', 'zxcvbn', CoreModule,
    NoticeModule, PuiUtilityModule, BreadcrumbModule, BrowserCheckModule
  ])
  .component('changePasswordApp', ChangePasswordAppComponent)
  .name;
