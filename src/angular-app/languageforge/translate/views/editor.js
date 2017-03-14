'use strict';

angular.module('translate.editor', ['ui.router', 'ui.bootstrap', 'bellows.services', 'ngQuill',
  'translate.quill', 'realTime', 'palaso.ui.showOverflow'])
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
  .controller('EditorCtrl', ['$scope', 'silNoticeService', 'translateAssistant',
    'translateProjectApi', 'translateDocumentApi', 'wordParser', 'realTime', 'modalService',
  function ($scope, notice, assistant,
            projectApi, documentApi, wordParser, realTime, modal) {
    var currentDocIds = [];
    var selectedSegmentIndex = -1;
    var onSelectionChanges = {};
    var source = {
      docType: 'source',
      label: 'Source'
    };
    var target = {
      docType: 'target',
      label: 'Target',
      currentSegmentStatus: 0
    };
    var modulesConfig = {
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
      },

      more: {
        container: '.ql-more'
      }
    };
    source.modulesConfig = angular.copy(modulesConfig);
    target.modulesConfig = angular.copy(modulesConfig);
    $scope.source = source;
    $scope.target = target;
    $scope.right = source;
    $scope.left = target;
    $scope.project = $scope.project || {};
    $scope.project.config = $scope.project.config || {};
    $scope.project.config.documentSets = $scope.project.config.documentSets || {};
    $scope.project.config.userPreferences = $scope.project.config.userPreferences || {};
    $scope.confidenceThreshold = 0.2;
    $scope.selectedDocumentSetIndex = 0;
    $scope.documentSets = [];
    $scope.statusOptions = [
      { key: 0, name: 'none' },
      { key: 1, name: 'draft' },
      { key: 2, name: 'approved' }
    ];
    var approvalStatusOptionKey = 2;
    var approvalStatusOptionKeyIndex = findKeyValueIndex($scope.statusOptions, 'key',
      approvalStatusOptionKey);

    documentApi.listDocumentSetsDto(function (result) {
      if (result.ok) {
        angular.merge($scope.project, result.data.project);
        source.inputSystem = $scope.project.config.source.inputSystem;
        target.inputSystem = $scope.project.config.target.inputSystem;
        assistant.initialise(source.inputSystem.tag, target.inputSystem.tag, $scope.project.slug);

        if (angular.isDefined($scope.project.config.documentSets.idsOrdered) &&
          $scope.project.config.documentSets.idsOrdered.length > 0
        ) {
          angular.forEach($scope.project.config.documentSets.idsOrdered, function (id) {
            $scope.documentSets.push(result.data.documentSetList[id]);
          });
        } else {
          angular.forEach(result.data.documentSetList, function (documentSet) {
            $scope.documentSets.push(documentSet);
          });
        }

        if (angular.isDefined($scope.project.config.userPreferences.selectedDocumentSetId)) {
          angular.forEach($scope.documentSets, function (documentSet, index) {
            if (documentSet.id === $scope.project.config.userPreferences.selectedDocumentSetId) {
              $scope.selectedDocumentSetIndex = index;
            }
          });
        }

        if (angular.isDefined($scope.project.config.userPreferences
            .isDocumentOrientationTargetRight) &&
          $scope.project.config.userPreferences.isDocumentOrientationTargetRight
        ) {
          $scope.swapEditors(true);
        } else {
          $scope.editorCreated($scope.left.editor, $scope.left.docType);
          $scope.editorCreated($scope.right.editor, $scope.right.docType);
        }
      }
    });

    $scope.selectDocumentSet = function selectDocumentSet(index) {
      if ($scope.selectedDocumentSetIndex !== index) {
        $scope.selectedDocumentSetIndex = index;
        setTimeout(function () {
          $scope.contentChanged($scope.left.editor, $scope.left.docType);
          $scope.contentChanged($scope.right.editor, $scope.right.docType);
        }, 1);

        if (($scope.selectedDocumentSetIndex in $scope.documentSets)) {
          $scope.project.config.userPreferences.selectedDocumentSetId =
            $scope.documentSets[$scope.selectedDocumentSetIndex].id;
          projectApi.updateUserPreferences($scope.project.config.userPreferences);
        }
      }
    };

    $scope.modalDeleteDocumentSet = function modalDeleteDocumentSet(index) {
      var documentSet = $scope.documentSets[index];
      var deleteMessage = 'This will delete both source and target documents.<br /><br />' +
        'Are you sure you want to delete the document set <b>' +
        documentSet.name + '</b>?';
      modal.showModalSimple('Delete Document Set?', deleteMessage, 'Cancel', 'Delete Document Set')
        .then(function () {
          documentApi.removeDocumentSet(documentSet.id, function (result) {
            if (result.ok) {
              var noticeMessage = 'Document \'' + documentSet.name + '\' was successfully removed.';
              $scope.documentSets.splice(index, 1);
              if ($scope.selectedDocumentSetIndex >= index) {
                $scope.selectDocumentSet($scope.selectedDocumentSetIndex - 1);
              }

              notice.push(notice.SUCCESS, noticeMessage);
            } else {
              notice.push(notice.ERROR, 'Sorry, there was a problem removing the document.');
            }
          });
        });
    };

    $scope.modalUpdateDocumentSet = function modalUpdateDocumentSet(index) {
      var isCreate = true;
      var documentSet = { name: '' };
      if (angular.isDefined(index) && (index in $scope.documentSets)) {
        isCreate = false;
        documentSet = $scope.documentSets[index];
      }

      var modalInstance = modal.open({
        scope: $scope,
        templateUrl: '/angular-app/languageforge/translate/views/modal-document-set-update.html',
        controller: ['$scope', '$uibModalInstance', function ($scope, $modalInstance) {
          $scope.titleLabel = (isCreate) ? 'Create a new Document Set' : 'Update Document Set';
          $scope.buttonLabel = (isCreate) ? 'Add' : 'Update';
          $scope.documentSet = documentSet;

          $scope.update = function update() {
            $modalInstance.close($scope.documentSet);
          };
        }]
      });

      modalInstance.result.then(function (documentSet) {
        documentApi.updateDocumentSet(documentSet, function (result) {
          if (result.ok) {
            angular.merge(documentSet, result.data);

            var noticeMessage = 'Document \'' + documentSet.name + '\' successfully ';
            if (isCreate) {
              $scope.documentSets.push(documentSet);
              $scope.selectDocumentSet($scope.documentSets.length - 1);
              noticeMessage = noticeMessage + 'added.';
            } else {
              $scope.documentSets[index] = documentSet;
              noticeMessage = noticeMessage + 'updated.';
            }

            notice.push(notice.SUCCESS, noticeMessage);
          } else {
            notice.push(notice.ERROR, 'Sorry, there was a problem saving your changes.');
          }
        });
      });
    };

    $scope.modalMoveDocumentSet = function modalMoveDocumentSet(currentIndex) {
      var documentSet = $scope.documentSets[currentIndex];
      var modalInstance = modal.open({
        scope: $scope,
        templateUrl: '/angular-app/languageforge/translate/views/modal-document-set-move.html',
        controller: ['$scope', '$uibModalInstance', function ($scope, $modalInstance) {
          $scope.documentSet = documentSet;
          $scope.newIndex = currentIndex.toString();
          $scope.positionOptions = [];
          angular.forEach($scope.documentSets, function (documentSet, index) {
            $scope.positionOptions.push((index + 1) +
              ((index === currentIndex) ? ' (current)' : ''));
          });

          $scope.move = function move() {
            $modalInstance.close(Number($scope.newIndex));
          };
        }]
      });

      modalInstance.result.then(function (newIndex) {
        if (newIndex === currentIndex) return;

        $scope.documentSets.splice(currentIndex, 1);
        $scope.documentSets.splice(newIndex, 0, documentSet);

        var selectedIndex = angular.copy($scope.selectedDocumentSetIndex);
        if (currentIndex === selectedIndex) {
          selectedIndex = newIndex;
        } else {
          if (currentIndex < selectedIndex) {
            selectedIndex -= 1;
          }

          if (newIndex <= selectedIndex) {
            selectedIndex += 1;
          }
        }

        $scope.selectDocumentSet(selectedIndex);
        $scope.project.config.documentSets.idsOrdered = $scope.documentSets.map(
          function (documentSet) {
            return documentSet.id;
          }
        );

        projectApi.updateConfig($scope.project.config, function (result) {
          if (result.ok) {
            notice.push(notice.SUCCESS,
              'Document \'' + documentSet.name + '\' successfully moved.');
          } else {
            notice.push(notice.ERROR, 'Sorry, there was a problem saving your changes.');
          }
        });
      });
    };

    $scope.hasDocumentSets = function hasDocumentSets() {
      return angular.isDefined($scope.selectedDocumentSetIndex) &&
        angular.isDefined($scope.documentSets) &&
        $scope.selectedDocumentSetIndex >= 0 &&
        $scope.selectedDocumentSetIndex < $scope.documentSets.length;
    };

    $scope.getLabel = function getLabel(label, languageTag) {
      var docName = '';
      if ($scope.documentSets.length > 0 &&
        ($scope.selectedDocumentSetIndex in $scope.documentSets)
      ) {
        docName = $scope.documentSets[$scope.selectedDocumentSetIndex].name + ' ';
      }

      return docName + label + ((languageTag) ? ' (' + languageTag + ')' : '');
    };

    $scope.contentChanged = function contentChanged(editor, docType) {
      if (!docId(docType)) return;

      if (currentDocIds[docType] !== docId(docType)) {
        realTime.disconnectRichTextDoc(currentDocIds[docType], editor);
        delete currentDocIds[docType];
        $scope.editorCreated(editor, docType);
      } else {
        updateContent(editor, docType);
      }
    };

    $scope.editorCreated = function editorCreated(editor, docType) {
      if (docType in onSelectionChanges) {
        $scope[docType].editor.off(Quill.events.SELECTION_CHANGE, onSelectionChanges[docType]);
      }

      $scope[docType].editor = editor;
      if (!docId(docType)) return;

      currentDocIds[docType] = docId(docType);
      realTime.createAndSubscribeRichTextDoc($scope.project.slug, docId(docType), editor);

      updateContent(editor, docType);

      onSelectionChanges[docType] = function () {
        if (docType === target.docType) {
          $scope.contentChanged(editor, docType);
        } else {
          editor.theme.suggestTooltip.hide();
        }
      };

      editor.on(Quill.events.SELECTION_CHANGE, onSelectionChanges[docType]);
    };

    $scope.swapEditors = function swapEditors(isNotWritePreference) {
      var leftEditor = $scope.left.editor;
      var rightEditor = $scope.right.editor;
      leftEditor.off(Quill.events.SELECTION_CHANGE, onSelectionChanges[$scope.left.docType]);
      rightEditor.off(Quill.events.SELECTION_CHANGE, onSelectionChanges[$scope.right.docType]);
      realTime.disconnectRichTextDoc(currentDocIds[$scope.left.docType], leftEditor);
      realTime.disconnectRichTextDoc(currentDocIds[$scope.right.docType], rightEditor);
      currentDocIds = [];

      var newLeft = $scope.right;
      var newRight = $scope.left;
      delete $scope.right;
      delete $scope.left;
      $scope.right = newRight;
      $scope.left = newLeft;
      $scope.editorCreated(leftEditor, newLeft.docType);
      $scope.editorCreated(rightEditor, newRight.docType);

      if (!isNotWritePreference) {
        $scope.project.config.userPreferences.isDocumentOrientationTargetRight =
          ($scope.right.docType === target.docType);
        projectApi.updateUserPreferences($scope.project.config.userPreferences);
      }
    };

    $scope.insertSuggestion = function insertSuggestion(docType, text) {
      var editor = $scope[docType].editor;
      var range = editor.selection.lastRange;
      var currentText = removeTrailingCarriageReturn(editor.getText());
      var words = wordParser.wordBreak(currentText);
      if (hasNoSelectionAtCursor(range)) {
        var index = range.index;
        var wordStartIndex = wordParser.startIndexOfWordAt(index, words);
        var wordLength = wordParser.lengthOfWordAt(index, words);
        setTimeout(function () {
          if (index < currentText.length ||
            (index === currentText.length && !wordParser.isWordComplete(currentText[index - 1]))
          ) {
            editor.deleteText(wordStartIndex, wordLength + 1, Quill.sources.USER);
            index = wordStartIndex;
          }

          editor.insertText(index, text + wordParser.charSpace(), Quill.sources.USER);
        }, 1);
      }
    };

    $scope.changeStatus = function changeStatus(docType, optionKey) {
      if (docType !== target.docType) return;

      var editor = $scope[docType].editor;
      var range = editor.selection.lastRange;
      if (hasNoSelectionAtCursor(range)) {
        var line = 0;
        var block = editor.getLine(range.index);
        var blockStartIndex = editor.getIndex(block[line]);
        setTimeout(function () {
          editor.formatLine(blockStartIndex, 1, { state: { status: optionKey } },
            Quill.sources.USER);
        }, 1);
      }
    };

    function updateContent(editor, docType) {
      var newSourceSegmentText;
      if (docType === target.docType) {
        showAndPositionTooltip(editor.theme.moreTooltip, editor.getSelection(), editor);
        updateSegmentStatus(docType, editor);
        if (!isTextEmpty(source.editor.getText()) && !isTextEmpty(editor.getText())) {
          var newSegmentIndex = getCurrentSegmentIndex(editor.getText(), editor.getSelection());
          newSourceSegmentText = currentSegment(source.editor.getText(), newSegmentIndex);
          if (newSegmentIndex !== selectedSegmentIndex ||
            newSourceSegmentText !== source.segmentText
          ) {
            selectedSegmentIndex = newSegmentIndex;
            source.segmentText = newSourceSegmentText;
            assistant.translateInteractively(source.segmentText, $scope.confidenceThreshold,
              function () {
                updatePrefix(editor, selectedSegmentIndex);
              }
            );
          } else {
            setTimeout(function () {
              updatePrefix(editor, selectedSegmentIndex);
            }, 1);
          }
        }
      } else {
        editor.theme.moreTooltip.hide();
        editor.theme.suggestTooltip.hide();
        if (docType === source.docType && !isTextEmpty(editor.getText())) {
          newSourceSegmentText = currentSegment(editor.getText(), selectedSegmentIndex);
          if (newSourceSegmentText !== source.segmentText) {
            source.segmentText = newSourceSegmentText;
            assistant.translateInteractively(source.segmentText, $scope.confidenceThreshold);
          }
        }
      }
    }

    function docId(docKey) {
      if (!($scope.selectedDocumentSetIndex in $scope.documentSets)) return false;

      return $scope.documentSets[$scope.selectedDocumentSetIndex].id + ':' + docKey;
    }

    function updatePrefix(editor, segmentIndex) {
      $scope.$apply(function () {
        target.suggestions = assistant.updatePrefix(currentSegment(editor.getText(), segmentIndex));
        setTimeout(function () {
          showAndPositionTooltip(editor.theme.suggestTooltip, editor.getSelection(), editor,
            hasSuggestion());
        }, 1);
      });
    }

    function learnSegment() {
      var segmentIndex = -1;
      var range = target.editor.selection.lastRange;
      if (hasNoSelectionAtCursor(range)) {
        segmentIndex = getCurrentSegmentIndex(target.editor.getText(), range);
      }

      if (segmentIndex === selectedSegmentIndex) {
        assistant.approveSegment(segmentLearnt);
      } else if (segmentIndex >= 0) {
        var sourceSegmentText = currentSegment(source.editor.getText(), segmentIndex);
        assistant.translateInteractively(sourceSegmentText, $scope.confidenceThreshold,
          function () {
            assistant.updatePrefix(currentSegment(target.editor.getText(), segmentIndex));
            assistant.approveSegment(segmentLearnt);
            assistant.translateInteractively(source.segmentText, $scope.confidenceThreshold);
          }
        );
      }
    }

    function segmentLearnt() {
      notice.push(notice.SUCCESS, 'Segment was successfully incorporated.');
    }

    function updateSegmentStatus(docType, editor) {
      if (hasNoSelectionAtCursor(editor.getSelection())) {
        var formats = editor.getFormat();
        if (angular.isDefined(formats.state)) {
          if (angular.isUndefined(formats.state.status)) {
            formats.state.status = 0;
          }

          $scope[docType].currentSegmentStatus = Number(formats.state.status);
        }
      }
    }

    function showAndPositionTooltip(tooltip, range, editor, hasCondition) {
      hasCondition = angular.isDefined(hasCondition) ? hasCondition : true;
      if (hasNoSelectionAtCursor(range) && hasCondition) {
        tooltip.show();
        tooltip.position(editor.getBounds(range));
      } else {
        tooltip.hide();
      }
    }

    function hasNoSelectionAtCursor(range) {
      return range && range.length === 0;
    }

    function hasSuggestion() {
      return target.suggestions && target.suggestions.length > 0;
    }

    /**
     * @param {string} text
     * @param {number} index
     * @returns {string}
     */
    function currentSegment(text, index) {
      if (!text) return '';

      if (index > getLastSegmentIndex(text)) {
        index = getLastSegmentIndex(text);
      }

      return getSegments(text)[index];
    }

    /**
     * @param {string} text
     * @returns {number}
     */
    function getLastSegmentIndex(text) {
      return getNumberOfSegments(text) - 1;
    }

    /**
     * @param {string} text
     * @returns {number}
     */
    function getNumberOfSegments(text) {
      return getSegments(text).length;
    }

    /**
     * @param {string} text
     * @param {Range} range
     * @returns {number}
     */
    function getCurrentSegmentIndex(text, range) {
      if (hasNoSelectionAtCursor(range)) {
        var segmentIndex = 0;
        var nextSegmentIndex = 0;
        angular.forEach(getSegments(text), function (segment) {
          nextSegmentIndex += segment.length + '\n'.length;
          if (range.index < nextSegmentIndex) return;

          segmentIndex++;
        });

        return segmentIndex;
      } else {
        return getLastSegmentIndex(text);
      }
    }

    /**
     * @param {string} text
     * @returns {Array|*}
     */
    function getSegments(text) {
      return removeTrailingCarriageReturn(text).split('\n');
    }

    /**
     * @param {string} text
     * @returns {boolean}
     */
    function isTextEmpty(text) {
      return !removeTrailingCarriageReturn(text);
    }

    /**
     * @param {string} text
     * @returns {string}
     */
    function removeTrailingCarriageReturn(text) {
      return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
    }

    /**
     * @param {Array} array
     * @param {string} property
     * @param {*} value
     * @returns {*|number}
     */
    function findKeyValueIndex(array, property, value) {
      return array.findIndex(function (object) {
          return object[property] === value;
        }
      );
    }
  }])

  ;
