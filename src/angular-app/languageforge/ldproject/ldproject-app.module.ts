import * as angular from 'angular';
import 'angular-sanitize';
import uiRouter from 'angular-ui-router';
// import './new-project/lexicon-new-project.module';

import {ApiService} from '../../bellows/core/api/api.service';
import {SiteWideNoticeModule} from '../../bellows/core/site-wide-notice-service';
import {CoreModule} from '../../bellows/core/core.module';
import {LdProjectAppComponent} from './ldproject-app.component';
import {LdProjectMembersComponent} from './ldproject-members.component';
import { ShareWithOthersModule } from '../lexicon/shared/share-with-others/share-with-others.module';

export const LdProjectAppModule = angular
  .module('ldproject', [
    'ui.bootstrap',
    'palaso.ui.typeahead',
    'ngTable',
    uiRouter,
    'ngSanitize',
    CoreModule,
    SiteWideNoticeModule,
    ShareWithOthersModule
  ])
  .component('ldprojectApp', LdProjectAppComponent)
  .component('ldprojectMembers', LdProjectMembersComponent)
  .config(['$urlRouterProvider',
           '$locationProvider',
           'apiServiceProvider',
           'rolesServiceProvider',
    ($urlRouterProvider: angular.ui.IUrlRouterProvider,
     $locationProvider: any, //angular.LocationProvider,
     apiService: ApiService,
     rolesServiceProvider: any) => {
      // $urlRouterProvider.otherwise('/');
      $locationProvider.html5Mode({enabled: true, requireBase: false});
    }
  ])
  .name;
