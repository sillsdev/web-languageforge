'use strict';

angular.module('translate.editor', ['ui.router', 'ui.bootstrap', 'bellows.services', 'ngQuill'])
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
  .controller('EditorCtrl', ['$scope', function ($scope) {
    var currentDocIds = [];
    var editors = {};
    var source = {
      key: 'source',
      label: 'Source'
    };
    var target = {
      key: 'target',
      label: 'Target'
    };

    $scope.left = source;
    $scope.right = target;

    function docId(key) {
      return $scope.project.id + ':' + key;
    }

    $scope.editorChanged = function editorChanged(editor, key, side) {
      if (currentDocIds[key] != docId(key)) {
        window.realTime.disconnectRichTextDoc(currentDocIds[key]);
        delete currentDocIds[key];
        $scope.editorCreated(editor, key, side);
      }
    };

    $scope.editorCreated = function editorCreated(editor, key, side) {
      editors[side] = editor;
      currentDocIds[key] = docId(key);
      window.realTime.createAndSubscribeRichTextDoc($scope.project.slug, docId(key), editor);
    };

    $scope.swapEditors = function swapEditors() {
      window.realTime.disconnectRichTextDoc(currentDocIds[$scope.left.key]);
      window.realTime.disconnectRichTextDoc(currentDocIds[$scope.right.key]);
      currentDocIds = [];

      var newLeft = $scope.right;
      var newRight = $scope.left;
      delete $scope.right;
      delete $scope.left;
      $scope.right = newRight;
      $scope.left = newLeft;
      $scope.editorCreated(editors.left, newLeft.key, 'left');
      $scope.editorCreated(editors.right, newRight.key, 'right');
    };

  }])

  ;
