import * as angular from 'angular';

import { ChangePasswordAppComponent } from './change-password-app.component';
import { NoticeServiceModule } from "../../core/notice/notice.module";
import { PuiUtilityModule } from '../../shared/pui-utils.module';

export const ChangePasswordAppModule = angular
  .module('changepassword', ['ui.bootstrap', 'bellows.services', 'ui.validate',
    NoticeServiceModule, PuiUtilityModule, 'zxcvbn'
  ])
  .component('changePasswordApp', ChangePasswordAppComponent)
  .name;
