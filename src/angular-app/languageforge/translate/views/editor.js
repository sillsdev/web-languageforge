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
    var currentFieldIds = [];
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

    $scope.getFieldId = function getFieldId(key) {
      return $scope.project.id + ':' + key;
    };

    $scope.editorChanged = function editorChanged(editor, key, side) {
      if (currentFieldIds[key] != $scope.getFieldId(key)) {
        window.realTime.disconnectRichTextDoc(currentFieldIds[key]);
        delete currentFieldIds[key];
        $scope.editorCreated(editor, key, side);
      }
    };

    $scope.editorCreated = function editorCreated(editor, key, side) {
      editors[side] = editor;
      var fieldId = $scope.getFieldId(key);
      currentFieldIds[key] = fieldId;
      window.realTime.createAndSubscribeRichTextDoc(fieldId, editor);
    };

    $scope.swapEditors = function swapEditors() {
      window.realTime.disconnectRichTextDoc(currentFieldIds[$scope.left.key]);
      window.realTime.disconnectRichTextDoc(currentFieldIds[$scope.right.key]);
      currentFieldIds = [];

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
