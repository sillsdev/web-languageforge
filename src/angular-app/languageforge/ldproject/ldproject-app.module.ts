import * as angular from 'angular';
import 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import './new-project/lexicon-new-project.module';

import {ApiService} from '../../bellows/core/api/api.service';
import {SiteWideNoticeModule} from '../../bellows/core/site-wide-notice-service';
import {CoreModule} from '../../bellows/core/core.module';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorModule} from './editor/editor.module';
import {LexiconAppComponent} from './lexicon-app.component';
import {LexiconSettingsModule} from './settings/settings.module';
import { ShareWithOthersModule } from './shared/share-with-others/share-with-others.module';

export const LexiconAppModule = angular
  .module('ldproject', [
    'ui.bootstrap',
    'ngTable',
    uiRouter,
    'ngSanitize',
    CoreModule,
    SiteWideNoticeModule,
    ShareWithOthersModule
  ])
  .component('ldprojectApp', LexiconAppComponent)
  .config(['$urlRouterProvider',
           'apiServiceProvider',
    ($urlRouterProvider: angular.ui.IUrlRouterProvider,
     apiService: ApiService) => {
      // $urlRouterProvider.otherwise('/');
    }
  ])
  .name;
