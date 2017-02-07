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
  .controller('EditorCtrl', ['$scope', 'translateAssistant', function ($scope, assistant) {
    var currentDocIds = [];
    var editors = {};
    var source = {
      key: 'source',
      label: 'Source',
      languageTag: 'es'
    };
    var target = {
      key: 'target',
      label: 'Target',
      languageTag: 'en',
      confidenceThreshold: 0.2
    };

    assistant.initialise(source.languageTag, target.languageTag);

    $scope.left = source;
    $scope.right = target;

    $scope.getLabel = function getLabel(label, languageTag) {
      return label + ((languageTag) ? ' (' + languageTag + ')' : '');
    };

    $scope.editorChanged = function editorChanged(editor, key, side) {
      if (key == 'target' && source.data && target.data) {
        var segmentIndex = getLastSegmentIndex(target.data);
        assistant.setPrefix(
          wordBreak(currentSegment(source.data, segmentIndex)),
          target.confidenceThreshold,
          wordBreak(currentSegment(target.data, segmentIndex)),
          isLastWordComplete(currentSegment(target.data, segmentIndex)),
          function (suggestions) {
            target.suggestions = suggestions;
          }
        );
      }

      if (currentDocIds[key] != docId(key)) {
        realTime.disconnectRichTextDoc(currentDocIds[key]);
        delete currentDocIds[key];
        $scope.editorCreated(editor, key, side);
      }
    };

    $scope.editorCreated = function editorCreated(editor, key, side) {
      editors[side] = editor;
      currentDocIds[key] = docId(key);
      realTime.createAndSubscribeRichTextDoc($scope.project.slug, docId(key), editor);
    };

    $scope.swapEditors = function swapEditors() {
      realTime.disconnectRichTextDoc(currentDocIds[$scope.left.key]);
      realTime.disconnectRichTextDoc(currentDocIds[$scope.right.key]);
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

    function docId(key) {
      return $scope.project.id + ':' + key;
    }

    /**
     * @param data
     * @returns {number}
     */
    function getLastSegmentIndex(data) {
      return getSegments(data).length - 1;
    }

    /**
     * @param {string} data
     * @param {number} index
     * @returns {string}
     */
    function currentSegment(data, index) {
      return getSegments(data)[index];
    }

    /**
     * Remove first opening <p> and last closing </p>, split on paragraphs to segment
     * @param {string} data
     * @returns {Array|*}
     */
    function getSegments(data) {
      data = data.replace(/^(<p>)/, '');
      data = data.replace(/(<\/p>)$/, '');
      return data.split('</p><p>');
    }

    function wordBreak(text) {
      return text.split(' ');
    }

    function isLastWordComplete(text) {
      text = text || '';
      return text.endsWith(' ') || text.endsWith('.') || text.endsWith(',');
    }

  }])

  ;
