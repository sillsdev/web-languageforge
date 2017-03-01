'use strict';

angular.module('translate.editor', ['ui.router', 'ui.bootstrap', 'bellows.services', 'ngQuill',
  'translate.suggest', 'realTime', 'palaso.ui.showOverflow'])
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
    $scope.project = $scope.project || {};
    $scope.project.config = $scope.project.config || {};
    $scope.project.config.documentSets = $scope.project.config.documentSets || {};
    $scope.confidenceThreshold = 0.2;
    $scope.selectedDocumentSetIndex = 0;
    $scope.documentSets = [];
    var currentDocIds = [];
    var previousSegmentIndex = -1;
    var editors = {};
    var onSelectionChanges = {};
    var source = {
      docType: 'source',
      label: 'Source'
    };
    var target = {
      docType: 'target',
      label: 'Target'
    };

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

        $scope.editorCreated(editors.left, $scope.left.docType, 'left');
        $scope.editorCreated(editors.right, $scope.right.docType, 'right');
      }
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

    $scope.selectDocumentSet = function selectDocumentSet(index) {
      if ($scope.selectedDocumentSetIndex != index) {
        $scope.selectedDocumentSetIndex = index;
        setTimeout(function () {
          $scope.contentChanged(editors.left, null, null, $scope.left.docType, 'left');
          $scope.contentChanged(editors.right, null, null, $scope.right.docType, 'right');
        }, 1);
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
              ((index == currentIndex) ? ' (current)' : ''));
          });

          $scope.move = function move() {
            $modalInstance.close(Number($scope.newIndex));
          };
        }]
      });

      modalInstance.result.then(function (newIndex) {
        if (newIndex == currentIndex) return;

        $scope.documentSets.splice(currentIndex, 1);
        $scope.documentSets.splice(newIndex, 0, documentSet);

        var selectedIndex = angular.copy($scope.selectedDocumentSetIndex);
        if (currentIndex == selectedIndex) {
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
        $scope.project.config.documentSets.idsOrdered = _.map($scope.documentSets, 'id');
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

    $scope.contentChanged =
      function contentChanged(editor, html, text, docType, side) {
        if (!docId(docType)) return;

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
      if (!docId(docType)) return;

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
      if (!($scope.selectedDocumentSetIndex in $scope.documentSets)) return false;

      return $scope.documentSets[$scope.selectedDocumentSetIndex].id + ':' + docKey;
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
     * @param {string} text
     * @returns {string}
     */
    function removeTrailingCarriageReturn(text) {
      return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
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
