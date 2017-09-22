import * as angular from 'angular';

import { CoreModule } from '../../core/core.module';
import { NoticeModule } from '../../core/notice/notice.module';
import { PuiUtilityModule } from '../../shared/pui-utils.module';
import { ChangePasswordAppComponent } from './change-password-app.component';

export const ChangePasswordAppModule = angular
  .module('changepassword', ['ui.bootstrap', 'ui.validate', 'zxcvbn', CoreModule,
    NoticeModule, PuiUtilityModule
  ])
  .component('changePasswordApp', ChangePasswordAppComponent)
  .name;
