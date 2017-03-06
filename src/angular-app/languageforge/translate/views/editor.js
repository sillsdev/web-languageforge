'use strict';

angular.module('translate.editor', ['ui.router', 'ui.bootstrap', 'bellows.services', 'ngQuill',
  'translate.suggest', 'realTime'])
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
  .controller('EditorCtrl', ['$scope', 'translateAssistant', 'translateProjectService',
    'wordParser', 'realTime',
  function ($scope, assistant, projectService,
            wordParser, realTime) {
    $scope.project = $scope.project || {};
    $scope.project.config = $scope.project.config || {};
    var currentDocIds = [];
    var previousSegmentIndex = -1;
    var editors = {};
    var onSelectionChanges = {};
    var source = {
      docType: 'source',
      label: 'Source',
      inputSystem: {
        tag: 'es'
      }
    };
    var target = {
      docType: 'target',
      label: 'Target',
      inputSystem: {
        tag: 'en'
      },
      confidenceThreshold: 0.2
    };

    projectService.readProject(function (result) {
      if (result.ok) {
        angular.merge($scope.project, result.data.project);
        source.inputSystem = $scope.project.config.source.inputSystem;
        target.inputSystem = $scope.project.config.target.inputSystem;
      }

      assistant.initialise(source.inputSystem.tag, target.inputSystem.tag, $scope.project.slug);
    });

    $scope.left = source;
    $scope.right = target;
    $scope.modulesConfig = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],      // toggled buttons
        [{ script: 'sub' }, { script: 'super' }],       // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }],           // outdent/indent
        [{ align: [] }],

        [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ font: [] }],
        [{ color: [] }, { background: [] }],            // dropdown with defaults from theme
        [{ direction: 'rtl' }],                         // text direction
        ['clean']                                       // remove formatting button
      ],

      suggestions: {
        container: '.ql-suggestions'
      }
    };

    $scope.getLabel = function getLabel(label, languageTag) {
      return label + ((languageTag) ? ' (' + languageTag + ')' : '');
    };

    $scope.contentChanged =
      function contentChanged(editor, html, text, docType, side) {
        if (currentDocIds[docType] != docId(docType)) {
          realTime.disconnectRichTextDoc(currentDocIds[docType], editor);
          delete currentDocIds[docType];
          $scope.editorCreated(editor, docType, side);
        } else {
          getSuggestions(editor, docType);
        }
      };

    $scope.editorCreated = function editorCreated(editor, docType, side) {
      editors[side] = editor;
      currentDocIds[docType] = docId(docType);
      realTime.createAndSubscribeRichTextDoc($scope.project.slug, docId(docType), editor);
      getSuggestions(editor, docType);
      onSelectionChanges[side] = function () {
        if (docType == 'target') {
          $scope.contentChanged(editor, null, null, docType, side);
        } else {
          editor.theme.suggestTooltip.hide();
        }
      };

      editor.on('selection-change', onSelectionChanges[side]);
    };

    $scope.swapEditors = function swapEditors() {
      editors.left.off('selection-change', onSelectionChanges.left);
      editors.right.off('selection-change', onSelectionChanges.right);
      realTime.disconnectRichTextDoc(currentDocIds[$scope.left.docType], editors.left);
      realTime.disconnectRichTextDoc(currentDocIds[$scope.right.docType], editors.right);
      currentDocIds = [];

      var newLeft = $scope.right;
      var newRight = $scope.left;
      delete $scope.right;
      delete $scope.left;
      $scope.right = newRight;
      $scope.left = newLeft;
      $scope.editorCreated(editors.left, newLeft.docType, 'left');
      $scope.editorCreated(editors.right, newRight.docType, 'right');
    };

    $scope.insertSuggestion = function insertSuggestion(side, text) {
      var editor = editors[side];
      var range = editor.selection.lastRange;
      var currentText = removeTrailingCarriageReturn(editor.getText());
      var words = wordParser.wordBreak(currentText);
      if (hasNoSelectionAtCursor(range)) {
        var index = range.index;
        var wordStartIndex = wordParser.startIndexOfWordAt(index, words);
        var wordLength = wordParser.lengthOfWordAt(index, words);
        setTimeout(function () {
          if (index < (currentText.length) ||
            (index == (currentText.length) && !wordParser.isWordComplete(currentText[index - 1]))
          ) {
            editor.deleteText(wordStartIndex, wordLength + 1, 'user');
            index = wordStartIndex;
          }

          editor.insertText(index, text + wordParser.charSpace(), 'user');
        }, 1);
      }
    };

    function docId(docKey) {
      return $scope.project.id + ':' + docKey;
    }

    /**
     * @param {string} text
     * @returns {string}
     */
    function removeTrailingCarriageReturn(text) {
      return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
    }

    function updatePrefix(editor, segmentIndex) {
      assistant.updatePrefix(currentSegment(target.data, segmentIndex), function (suggestions) {
        $scope.$apply(function () {
          target.suggestions = suggestions;
          setTimeout(function () {
            showAndPositionTooltip(editor.theme.suggestTooltip, editor.getSelection(), editor);
          }, 1);
        });
      });
    }

    function getSuggestions(editor, docType) {
      if (docType == 'target' && source.data && target.data) {
        var segmentIndex = getCurrentSegmentIndex(target.data, editor.getSelection());
        if (segmentIndex != previousSegmentIndex) {
          assistant.translateInteractively(currentSegment(source.data, segmentIndex),
            target.confidenceThreshold,
            function () {
              previousSegmentIndex = segmentIndex;
              updatePrefix(editor, segmentIndex);
            }
          );
        } else {
          setTimeout(function () {
            updatePrefix(editor, segmentIndex);
          }, 1);
        }
      } else {
        editor.theme.suggestTooltip.hide();
      }
    }

    function showAndPositionTooltip(tooltip, range, editor) {
      if (hasNoSelectionAtCursor(range) && hasSuggestion()) {
        tooltip.show();
        tooltip.position(editor.getBounds(range));
      } else {
        tooltip.hide();
      }
    }

    function hasNoSelectionAtCursor(range) {
      return range && range.length == 0;
    }

    function hasSuggestion() {
      return target.suggestions && target.suggestions.length > 0;
    }

    /**
     * @param {string} data
     * @param {number} index
     * @returns {string}
     */
    function currentSegment(data, index) {
      if (index > getLastSegmentIndex(data)) {
        index = getLastSegmentIndex(data);
      }

      return getSegments(data)[index];
    }

    /**
     * @param {string} data
     * @returns {number}
     */
    function getLastSegmentIndex(data) {
      return getSegments(data).length - 1;
    }

    /**
     * @param {string} data
     * @param {Range} range
     * @returns {number}
     */
    function getCurrentSegmentIndex(data, range) {
      if (hasNoSelectionAtCursor(range)) {
        var segmentIndex = 0;
        var nextSegmentIndex = 0;
        angular.forEach(getSegments(data), function (segment) {
          nextSegmentIndex += segment.length + '\n'.length;
          if (range.index < nextSegmentIndex) return;

          segmentIndex++;
        });

        return segmentIndex;
      } else {
        return getLastSegmentIndex(data);
      }
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

  }])

  ;
