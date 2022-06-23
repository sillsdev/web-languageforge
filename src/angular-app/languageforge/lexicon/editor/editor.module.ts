import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {TypeAheadModule} from '../../../bellows/shared/type-ahead.module';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';
import {LexiconCoreModule} from '../core/lexicon-core.module';
import {EditorCommentsModule} from './comment/comment.module';
import {LexiconEditorComponent, LexiconEditorEntryController, LexiconEditorListController} from './editor.component';
import {EditorFieldModule} from './field/field.module';

export const LexiconEditorModule = angular
  .module('lexiconEditorModule', [
    'ui.bootstrap',
    uiRouter,
    CoreModule,
    NoticeModule,
    PuiUtilityModule,
    TypeAheadModule,
    LexiconCoreModule,
    EditorCommentsModule,
    EditorFieldModule
  ])
  .component('lexiconEditor', LexiconEditorComponent)
  .controller('EditorListCtrl', LexiconEditorListController)
  .controller('EditorEntryCtrl', LexiconEditorEntryController)
  .config(['$stateProvider', ($stateProvider: angular.ui.IStateProvider) => {

    // State machine from ui.router
    $stateProvider
      .state('editor', {
        abstract: true,
        url: '/editor',
        template: `
            <lexicon-editor lec-config="$ctrl.editorConfig"
                            lec-interface-config="$ctrl.interfaceConfig"
                            lec-finished-loading="$ctrl.finishedLoading"
                            lec-project="$ctrl.project"
                            lec-option-lists="$ctrl.optionLists"
                            lec-rights="$ctrl.rights"></lexicon-editor>`
      })
      .state('editor.list', {
        url: '/list?sortBy&filterText&sortReverse&wholeWord&matchDiacritic&filterType&filterBy',
        templateUrl: '/angular-app/languageforge/lexicon/editor/editor-list.view.html',
        controller: 'EditorListCtrl'
      })
      .state('editor.entry', {
        url: '/entry/{entryId:[0-9a-z_]{6,24}}?sortBy&filterText&sortReverse&wholeWord&matchDiacritic&filterType&filterBy',
        templateUrl: '/angular-app/languageforge/lexicon/editor/editor-entry.view.html',
        controller: 'EditorEntryCtrl'
      })
    ;
  }])
  .name;
