'use strict';

angular.module('translate.editor', ['ui.router', 'ui.bootstrap', 'bellows.services'])
  .config(['$stateProvider', function ($stateProvider) {

    // State machine from ui.router
    $stateProvider
      .state('editor', {
        url: '/editor',
        templateUrl: '/angular-app/languageforge/translate/views/editor.html',
        controller: 'EditorCtrl'
      })
    ;
  }])
  .controller('EditorCtrl', ['$scope',
    function ($scope) {

    }])

  ;
