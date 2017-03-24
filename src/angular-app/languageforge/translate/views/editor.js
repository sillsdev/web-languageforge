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
    'translateProjectApi', 'translateDocumentApi', 'translateDocumentService', 'wordParser',
    'realTime', 'modalService',
  function ($scope, notice, assistant,
            projectApi, documentApi, Document, wordParser, realTime, modal) {
    var currentDocIds = [];
    var selectedSegmentIndex = -1;
    var onSelectionChanges = {};
    var source = new Document.Data('source', 'Source');
    var target = new Document.Data('target', 'Target');
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
          $scope.selectedDocumentSetIndex =  getDocumentSetIndexById($scope.documentSets,
            $scope.project.config.userPreferences.selectedDocumentSetId);
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
      }

      updateContent(editor, docType);
    };

    $scope.editorCreated = function editorCreated(editor, docType) {
      if (docType in onSelectionChanges) {
        $scope[docType].editor.off(Quill.events.SELECTION_CHANGE, onSelectionChanges[docType]);
      }

      $scope[docType].editor = editor;
      if (!docId(docType)) return;

      currentDocIds[docType] = docId(docType);
      realTime.createAndSubscribeRichTextDoc($scope.project.slug, docId(docType), editor);

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
      var currentText = Quill.removeTrailingCarriageReturn(editor.getText());
      var words = wordParser.wordBreak(currentText);
      if (Quill.hasNoSelectionAtCursor(range)) {
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

      target.formatSegmentStateStatus(optionKey, target.editor.selection.lastRange);
    };

    function docId(docKey, documentSetId) {
      if (!($scope.selectedDocumentSetIndex in $scope.documentSets)) return false;

      if (angular.isUndefined(documentSetId)) {
        documentSetId = $scope.documentSets[$scope.selectedDocumentSetIndex].id;
      }

      return documentSetId + ':' + docKey;
    }

    function updateContent(editor, docType) {
      if (docType === target.docType) {
        showAndPositionTooltip(target.editor.theme.moreTooltip, target.editor);
        var newSegmentIndex = target.getSegmentIndex();
        learnSegment(newSegmentIndex);
        getSuggestions(newSegmentIndex);
        selectedSegmentIndex = newSegmentIndex;
      } else {
        editor.theme.moreTooltip.hide();
        editor.theme.suggestTooltip.hide();
        if (docType === source.docType && !editor.isTextEmpty()) {
          var newSourceSegmentText = source.getSegment(selectedSegmentIndex);
          if (newSourceSegmentText !== source.segment.text) {
            source.segment.text = newSourceSegmentText;
            assistant.translateInteractively(source.segment.text, $scope.confidenceThreshold);
          }
        }
      }
    }

    function learnSegment(newSegmentIndex) {
      if (selectedSegmentIndex >= 0 && !target.editor.hasNoSelectionAtCursor()) return;

      var targetSegmentText = target.getSegment(selectedSegmentIndex);
      var selectedDocumentSetId = $scope.documentSets[$scope.selectedDocumentSetIndex].id;
      if (selectedSegmentIndex < 0) {
        target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
      } else if (newSegmentIndex !== selectedSegmentIndex
        || selectedDocumentSetId !== target.segment.learnt.documentSetId
      ) {
        if (selectedDocumentSetId !== target.segment.learnt.documentSetId) {
          targetSegmentText = target.segment.text;
        }

        if (!Quill.isTextEmpty(targetSegmentText) &&
          Quill.hasNoSelectionAtCursor(target.segment.learnt.previousRange) &&
          !target.segment.hasLearntText(targetSegmentText)
        ) {
          assistant.learnSegment(function () {
            if (selectedDocumentSetId === target.segment.learnt.documentSetId) {
              notice.push(notice.SUCCESS, 'The line was successfully learnt.');
              target.formatSegmentStateMachineHasLearnt(true, target.segment.learnt.previousRange);
            } else {
              var documentSetIndex = getDocumentSetIndexById($scope.documentSets,
                target.segment.learnt.documentSetId);
              var documentSetName = $scope.documentSets[documentSetIndex].name;
              notice.push(notice.SUCCESS, 'The modified line from the \'' + documentSetName +
                '\' document set was successfully learnt.');
              var formatDelta = target.createDeltaSegmentStateMachineHasLearnt(true,
                target.segment.blockEndIndex, target.segment.state);
              realTime.updateRichTextDoc($scope.project.slug,
                docId(target.docType, target.segment.learnt.documentSetId), formatDelta,
                Quill.sources.USER);
            }

            target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
          });
        } else {
          target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
        }
      } else {
        var machineHasLearnt = target.segment.hasLearntText(targetSegmentText);
        target.segment.text = targetSegmentText;
        target.updateSegmentState();
        target.updateSegmentBlockEndIndex();
        if (target.segment.state.machineHasLearnt !== machineHasLearnt) {
          target.formatSegmentStateMachineHasLearnt(machineHasLearnt);
        }
      }
    }

    function updatePrefix(segmentIndex) {
      $scope.$apply(function () {
        target.suggestions = assistant.updatePrefix(target.getSegment(segmentIndex));
        setTimeout(function () {
          showAndPositionTooltip(target.editor.theme.suggestTooltip, target.editor,
            target.hasSuggestion());
        }, 1);
      });
    }

    function getSuggestions(newSegmentIndex) {
      if (!source.editor.isTextEmpty() && !target.editor.isTextEmpty()) {
        var newSourceSegmentText = source.getSegment(newSegmentIndex);
        if (newSegmentIndex !== selectedSegmentIndex || newSourceSegmentText !== source.segment.text
        ) {
          source.segment.text = newSourceSegmentText;
          assistant.translateInteractively(source.segment.text, $scope.confidenceThreshold,
            function () {
              updatePrefix(newSegmentIndex);
            }
          );
        } else {
          setTimeout(function () {
            updatePrefix(newSegmentIndex);
          }, 1);
        }
      }
    }

    function showAndPositionTooltip(tooltip, editor, hasCondition) {
      hasCondition = angular.isDefined(hasCondition) ? hasCondition : true;
      if (editor.hasNoSelectionAtCursor() && hasCondition) {
        tooltip.show();
        tooltip.position(editor.getBounds(editor.getSelection()));
      } else {
        tooltip.hide();
      }
    }

    function getDocumentSetIndexById(documentSets, documentSetId) {
      var documentSetIndex = -1;
      angular.forEach(documentSets, function (documentSet, index) {
        if (documentSet.id === documentSetId) {
          documentSetIndex = index;
        }
      });

      return documentSetIndex;
    }

  }])

  ;
