import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {setAngularLib} from '@angular/upgrade/static';
import * as angular from 'angular';
import 'angular-route';
import 'angular-ui-bootstrap-4';
import 'angular-ui-router';
import 'angular-ui-validate';
import 'angular-zxcvbn';

import 'ng-file-upload/dist/ng-file-upload-all.js';

import {AppModule} from '../../app/app.module';

import './core/service-worker-registration.js';

import './polyfills.browser';

import './apps/activity/activity-app.module';
import './apps/changepassword/change-password-app.module';
import './apps/projects/projects-app.module';
import './apps/public/forgot_password/forgot-password-app.module';
import './apps/public/login/login-app.module';
import './apps/public/oauth-signup/oauth-signup-app.module';
import './apps/public/reset_password/reset-password-app.module';
import './apps/public/signup/signup-app.module';
import './apps/siteadmin/site-admin-app.module';
import './apps/userprofile/user-profile-app.module';

interface AppWindow extends Window {
  appName: string;
}

setAngularLib(angular);

// allow HTML to load before bootstrapping
setTimeout(() => platformBrowserDynamic().bootstrapModule(AppModule), 0);
