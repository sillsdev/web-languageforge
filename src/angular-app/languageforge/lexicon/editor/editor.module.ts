import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {ActivityAppModule} from '../../../bellows/apps/activity/activity-app.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';
import {EditorCommentsModule} from './comment/comment.module';
import {LexiconEditorController, LexiconEditorEntryController, LexiconEditorListController} from './editor.controller';
import {EditorFieldModule} from './field/field.module';

export const LexiconEditorModule = angular
  .module('lexiconEditorModule', [
    'ui.bootstrap',
    uiRouter,
    ActivityAppModule,
    CoreModule,
    NoticeModule,
    PuiUtilityModule,
    EditorCommentsModule,
    EditorFieldModule
  ])
  .controller('EditorCtrl', LexiconEditorController)
  .controller('EditorListCtrl', LexiconEditorListController)
  .controller('EditorEntryCtrl', LexiconEditorEntryController)
  .config(['$stateProvider', ($stateProvider: angular.ui.IStateProvider) => {

    // State machine from ui.router
    $stateProvider
      .state('editor', {
        abstract: true,
        url: '/editor',
        templateUrl: '/angular-app/languageforge/lexicon/editor/editor-abstract.html',
        controller: 'EditorCtrl',
        controllerAs: '$ctrl'
      })
      .state('editor.list', {
        url: '/list',
        templateUrl: '/angular-app/languageforge/lexicon/editor/editor-list.html',
        controller: 'EditorListCtrl'
      })
      .state('editor.entry', {
        url: '/entry/{entryId:[0-9a-z_]{6,24}}',
        templateUrl: '/angular-app/languageforge/lexicon/editor/editor-entry.html',
        controller: 'EditorEntryCtrl'
      })
    ;
  }])
  .name;
