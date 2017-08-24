import * as angular from 'angular';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { MachineService } from '../core/machine.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { DocumentDataService } from './document-data.service';
import { DocumentData } from './document-data';
import { WordParser } from './word-parser.service';
import { ModalService } from '../../../bellows/core/modal/modal.service';
import { Quill, Tooltip } from './quill/quill.customization';
import { RealTimeService } from '../core/realtime.service';

export class EditorController implements angular.IController {
  private currentDocIds: string[] = [];
  private selectedSegmentIndex: number = -1;
  private confidenceThreshold: number = 0.2;
  source: DocumentData;
  target: DocumentData;
  right: DocumentData;
  left: DocumentData;
  selectedDocumentSetIndex: number = 0;
  documentSets: any[] = [];
  readonly statusOptions: { key: number, name: string }[] = [
    { key: 0, name: 'none' },
    { key: 1, name: 'draft' },
    { key: 2, name: 'approved' }
  ];
  ecProject: any;
  ecInterfaceConfig: any;
  ecOnUpdate: ($event: any) => void;

  static $inject = ['$scope', '$q', 'silNoticeService', 'machineService',
    'translateProjectApi', 'documentDataService', 'wordParser', 'realTimeService', 'modalService'];
  constructor (private $scope: angular.IScope, private $q: angular.IQService, private notice: NoticeService,
               private machineService: MachineService, private projectApi: TranslateProjectService,
               private documentDataService: DocumentDataService, private wordParser: WordParser,
               private realTime: RealTimeService, private modal: ModalService) {}

  $onInit(): void {
    this.source = this.documentDataService.createDocumentData('source', 'Source');
    this.target = this.documentDataService.createDocumentData('target', 'Target');
    let modulesConfig: any = {
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
    this.source.modulesConfig = angular.copy(modulesConfig);
    this.target.modulesConfig = angular.copy(modulesConfig);
    this.right = this.source;
    this.left = this.target;

    this.projectApi.listDocumentSetsDto(result => {
      if (result.ok) {
        angular.merge(this.ecProject, result.data.project);
        this.ecProject.config.documentSets = this.ecProject.config.documentSets || {};
        this.ecProject.config.userPreferences = this.ecProject.config.userPreferences || {};
        this.source.inputSystem = this.ecProject.config.source.inputSystem;
        this.target.inputSystem = this.ecProject.config.target.inputSystem;
        this.machineService.initialise(this.ecProject.slug);

        this.confidenceThreshold = this.ecProject.config.confidenceThreshold;
        let userPreferences = this.ecProject.config.userPreferences;
        if (userPreferences.confidenceThreshold != null &&
          userPreferences.hasConfidenceOverride != null &&
          userPreferences.hasConfidenceOverride
        ) {
          this.confidenceThreshold = userPreferences.confidenceThreshold;
        }

        if (this.ecProject.config.documentSets.idsOrdered != null &&
          this.ecProject.config.documentSets.idsOrdered.length > 0
        ) {
          for (let id of this.ecProject.config.documentSets.idsOrdered) {
            if (result.data.documentSetList[id] != null) {
              this.documentSets.push(result.data.documentSetList[id]);
            }
          }
        } else {
          angular.forEach(result.data.documentSetList, documentSet => {
            if (angular.isDefined(documentSet)) {
              this.documentSets.push(documentSet);
            }
          });
        }

        if (userPreferences.selectedDocumentSetId != null) {
          this.selectedDocumentSetIndex = this.getDocumentSetIndexById(userPreferences.selectedDocumentSetId);
        }

        this.$q.all([this.source.editorIsCreated.promise, this.target.editorIsCreated.promise]).then(() => {
          if (userPreferences.isDocumentOrientationTargetRight != null &&
            userPreferences.isDocumentOrientationTargetRight
          ) {
            this.swapEditors(false);
          } else {
            this.editorCreated(this.left.editor, this.left.docType);
            this.editorCreated(this.right.editor, this.right.docType);
          }
        });
      }
    });
  }

  selectDocumentSet(index: number): void {
    if (this.selectedDocumentSetIndex !== index) {
      this.selectedDocumentSetIndex = index;
      this.contentChanged(this.left.editor, this.left.docType);
      this.contentChanged(this.right.editor, this.right.docType);

      if (this.selectedDocumentSetIndex in this.documentSets) {
        let userPreferences = this.ecProject.config.userPreferences;
        userPreferences.selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
        this.projectApi.updateUserPreferences(userPreferences);
      }
    }
  }

  modalDeleteDocumentSet(index: number): void {
    let documentSet = this.documentSets[index];
    const deleteMessage = 'This will delete both source and target documents.<br /><br />' +
      'Are you sure you want to delete the document set <b>' +
      documentSet.name + '</b>?';
    this.modal.showModalSimple('Delete Document Set?', deleteMessage, 'Cancel', 'Delete Document Set')
      .then(() => {
        this.projectApi.removeDocumentSet(documentSet.id, result => {
          if (result.ok) {
            const noticeMessage = 'Document \'' + documentSet.name + '\' was successfully removed.';
            this.documentSets.splice(index, 1);
            this.ecProject.config.documentSets.idsOrdered.splice(index, 1);
            if (this.selectedDocumentSetIndex >= index) {
              this.selectDocumentSet(this.selectedDocumentSetIndex - 1);
            }
            this.ecOnUpdate({ project: this.ecProject });
            this.notice.push(this.notice.SUCCESS, noticeMessage);
          } else {
            this.notice.push(this.notice.ERROR, 'Sorry, there was a problem removing the document.');
          }
        });
      }, () => {});
  }

  modalUpdateDocumentSet(index?: number): void {
    let isCreate = true;
    let documentSet = { name: '' };
    if (index != null && index in this.documentSets) {
      isCreate = false;
      documentSet = angular.copy(this.documentSets[index]);
    }

    let modalInstance = this.modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/translate/editor/document-set-update.modal.html',
      controller: ['$scope', '$uibModalInstance', ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
        $scope.titleLabel = (isCreate) ? 'Create a new Document Set' : 'Update Document Set';
        $scope.buttonLabel = (isCreate) ? 'Add' : 'Update';
        $scope.documentSet = documentSet;

        $scope.update = () => $modalInstance.close($scope.documentSet);
      }]
    });

    modalInstance.result.then(documentSet => {
      this.projectApi.updateDocumentSet(documentSet, result => {
        if (result.ok) {
          angular.merge(documentSet, result.data);

          let noticeMessage = 'Document \'' + documentSet.name + '\' successfully ';
          if (isCreate) {
            this.documentSets.push(documentSet);
            this.selectDocumentSet(this.documentSets.length - 1);
            noticeMessage = noticeMessage + 'added.';
          } else {
            this.documentSets[index] = documentSet;
            noticeMessage = noticeMessage + 'updated.';
          }
          this.ecOnUpdate({ project: this.ecProject });
          this.notice.push(this.notice.SUCCESS, noticeMessage);
        } else {
          this.notice.push(this.notice.ERROR, 'Sorry, there was a problem saving your changes.');
        }
      });
    }, () => {});
  }

  modalMoveDocumentSet(currentIndex: number): void {
    let documentSet = this.documentSets[currentIndex];
    let modalInstance = this.modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/translate/editor/document-set-move.modal.html',
      controller: ['$scope', '$uibModalInstance', ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
        $scope.documentSet = documentSet;
        $scope.newIndex = currentIndex.toString();
        $scope.positionOptions = [];
        for (let index = 0; index < this.documentSets.length; index++) {
          $scope.positionOptions.push((index + 1) +
            ((index === currentIndex) ? ' (current)' : ''));
        }

        $scope.move = () => $modalInstance.close(Number($scope.newIndex));
      }]
    });

    modalInstance.result.then(newIndex => {
      if (newIndex === currentIndex) return;

      this.documentSets.splice(currentIndex, 1);
      this.documentSets.splice(newIndex, 0, documentSet);

      let selectedIndex = angular.copy(this.selectedDocumentSetIndex);
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

      this.selectDocumentSet(selectedIndex);
      this.ecProject.config.documentSets.idsOrdered = this.documentSets.map(documentSet => documentSet.id);

      this.projectApi.updateConfig(this.ecProject.config, result => {
        if (result.ok) {
          this.notice.push(this.notice.SUCCESS,
            'Document \'' + documentSet.name + '\' successfully moved.');
        } else {
          this.notice.push(this.notice.ERROR, 'Sorry, there was a problem saving your changes.');
        }
        this.ecOnUpdate({ project: this.ecProject });
      });
    }, () => {});
  }

  hasDocumentSets(): boolean {
    return this.selectedDocumentSetIndex != null &&
      this.documentSets != null &&
      this.selectedDocumentSetIndex >= 0 &&
      this.selectedDocumentSetIndex < this.documentSets.length;
  }

  getLabel(label: string, languageTag: string): string {
    let docName = '';
    if (this.documentSets.length > 0 && this.selectedDocumentSetIndex in this.documentSets) {
      docName = this.documentSets[this.selectedDocumentSetIndex].name + ' ';
    }

    return docName + label + ((languageTag) ? ' (' + languageTag + ')' : '');
  }

  contentChanged(editor: Quill, docType: string): void {
    if (!this.docId(docType)) return;

    if (this.currentDocIds[docType] !== this.docId(docType)) {
      this.realTime.disconnectRichTextDoc(this.currentDocIds[docType], editor);
      delete this.currentDocIds[docType];
      this.editorCreated(editor, docType);
    }

    this.updateContent(editor, docType);
  }

  selectionChanged(editor: Quill, docType: string): void {
    editor.theme.suggestTooltip.hide();
    if (docType === this.target.docType) {
      this.contentChanged(editor, docType);
    }
  }

  editorCreated(editor: Quill, docType: string): void {
    let docData = this.getDocumentData(docType);

    docData.editor = editor;
    docData.editorIsCreated.resolve(true);
    if (!this.docId(docType)) return;

    this.currentDocIds[docType] = this.docId(docType);
    this.realTime.createAndSubscribeRichTextDoc(this.ecProject.slug, this.docId(docType), editor);
  }

  swapEditors(writePreferences: boolean = true): void {
    let leftEditor = this.left.editor;
    let rightEditor = this.right.editor;
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.left.docType], leftEditor);
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.right.docType], rightEditor);
    this.currentDocIds = [];

    let newLeft = this.right;
    let newRight = this.left;
    delete this.right;
    delete this.left;
    this.right = newRight;
    this.left = newLeft;
    this.editorCreated(leftEditor, newLeft.docType);
    this.editorCreated(rightEditor, newRight.docType);

    if (writePreferences) {
      let userPreferences = this.ecProject.config.userPreferences;
      userPreferences.isDocumentOrientationTargetRight = this.right.docType === this.target.docType;
      this.projectApi.updateUserPreferences(userPreferences);
      this.ecOnUpdate({ project: this.ecProject });
    }
  }

  insertSuggestion(docType: string, text: string): void {
    let editor = this.getDocumentData(docType).editor;
    let range = editor.selection.lastRange;
    let currentText = this.documentDataService.removeTrailingCarriageReturn(editor.getText());
    let words = this.wordParser.wordBreak(currentText);
    if (this.documentDataService.hasNoSelectionAtCursor(range)) {
      let index = range.index;
      let wordStartIndex = this.wordParser.startIndexOfWordAt(index, words);
      let wordLength = this.wordParser.lengthOfWordAt(index, words);
      if (index < currentText.length ||
        (index === currentText.length && !this.wordParser.isWordComplete(currentText[index - 1]))
      ) {
        editor.deleteText(wordStartIndex, wordLength + 1, 'user');
        index = wordStartIndex;
      }

      editor.insertText(index, text + this.wordParser.charSpace(), 'user');
    }
  }

  changeStatus(docType: string, optionKey: number): void {
    if (docType !== this.target.docType) return;

    this.target.formatSegmentStateStatus(optionKey, this.target.editor.selection.lastRange);
  }

  private getDocumentData(docType: string): DocumentData {
    switch (docType) {
      case 'source':
        return this.source;
      case 'target':
        return this.target;
    }
  }

  private docId(docKey: string, documentSetId?: string): string {
    if (!(this.selectedDocumentSetIndex in this.documentSets)) return '';

    if (documentSetId == null) {
      documentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
    }

    return documentSetId + ':' + docKey;
  }

  private updateContent(editor: Quill, docType: string): void {
    if (docType === this.target.docType) {
      this.showAndPositionTooltip(this.target.editor.theme.moreTooltip, this.target.editor);
      let newSegmentIndex = this.target.getSegmentIndex();
      this.learnSegment(newSegmentIndex);
      this.getSuggestions(newSegmentIndex);
      this.selectedSegmentIndex = newSegmentIndex;
    } else {
      editor.theme.moreTooltip.hide();
      editor.theme.suggestTooltip.hide();
      if (docType === this.source.docType && !this.documentDataService.isTextEmpty(editor.getText())) {
        let newSourceSegmentText = this.source.getSegment(this.selectedSegmentIndex);
        if (newSourceSegmentText !== this.source.segment.text) {
          this.source.segment.text = newSourceSegmentText;
          this.machineService.translateInteractively(this.source.segment.text, this.confidenceThreshold);
        }
      }
    }
  }

  private learnSegment(newSegmentIndex: number): void {
    if (this.selectedSegmentIndex >= 0 &&
      !this.documentDataService.hasNoSelectionAtCursor(this.target.editor.getSelection())
    ) {
      return;
    }

    let targetSegmentText = this.target.getSegment(this.selectedSegmentIndex);
    let selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
    if (this.selectedSegmentIndex < 0) {
      this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
    } else if (newSegmentIndex !== this.selectedSegmentIndex
      || selectedDocumentSetId !== this.target.segment.learnt.documentSetId
    ) {
      if (selectedDocumentSetId !== this.target.segment.learnt.documentSetId) {
        targetSegmentText = this.target.segment.text;
      }

      if (!this.documentDataService.isTextEmpty(targetSegmentText) &&
        this.documentDataService.hasNoSelectionAtCursor(this.target.segment.learnt.previousRange) &&
        !this.target.segment.hasLearntText(targetSegmentText)
      ) {
        this.machineService.learnSegment(() => {
          if (selectedDocumentSetId === this.target.segment.learnt.documentSetId) {
            this.notice.push(this.notice.SUCCESS, 'The modified line was successfully learnt.');
            this.target.formatSegmentStateMachineHasLearnt(true, this.target.segment.learnt.previousRange);
          } else {
            let documentSetIndex = this.getDocumentSetIndexById(this.target.segment.learnt.documentSetId);
            let documentSetName = this.documentSets[documentSetIndex].name;
            this.notice.push(this.notice.SUCCESS, 'The modified line from the \'' + documentSetName +
              '\' document set was successfully learnt.');
            let formatDelta = this.target.createDeltaSegmentStateMachineHasLearnt(true,
              this.target.segment.blockEndIndex, this.target.segment);
            this.realTime.updateRichTextDoc(this.ecProject.slug,
              this.docId(this.target.docType, this.target.segment.learnt.documentSetId), formatDelta,
              'user');
          }

          this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
        });
      } else {
        this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
      }
    } else {
      let machineHasLearnt = this.target.segment.hasLearntText(targetSegmentText);
      this.target.segment.text = targetSegmentText;
      this.target.updateSegmentState(newSegmentIndex);
      this.target.updateSegmentBlockEndIndex();
      if (this.target.segment.state.machineHasLearnt !== machineHasLearnt) {
        this.target.formatSegmentStateMachineHasLearnt(machineHasLearnt);
      }
    }
  }

  private getSuggestions(newSegmentIndex: number): void {
    if (!this.documentDataService.isTextEmpty(this.source.editor.getText()) &&
      !this.documentDataService.isTextEmpty(this.target.editor.getText())
    ) {
      let newSourceSegmentText = this.source.getSegment(newSegmentIndex);
      if (newSegmentIndex !== this.selectedSegmentIndex || newSourceSegmentText !== this.source.segment.text) {
        this.source.segment.text = newSourceSegmentText;
        this.machineService.translateInteractively(this.source.segment.text, this.confidenceThreshold,
          () => this.updatePrefix(newSegmentIndex));
      } else {
        this.updatePrefix(newSegmentIndex);
      }
    }
  }

  private updatePrefix(segmentIndex: number): void {
    this.$scope.$applyAsync(() => {
      this.target.suggestions = this.machineService.updatePrefix(this.target.getSegment(segmentIndex));
      setTimeout(() => {
        this.showAndPositionTooltip(this.target.editor.theme.suggestTooltip, this.target.editor,
          this.target.hasSuggestion());
      }, 0);
    });
  }

  private showAndPositionTooltip(tooltip: Tooltip, editor: Quill, hasCondition: boolean = true): void {
    if (this.documentDataService.hasNoSelectionAtCursor(editor.getSelection()) && hasCondition) {
      tooltip.show();
      let range = editor.getSelection();
      tooltip.position(editor.getBounds(range.index, range.length));
    } else {
      tooltip.hide();
    }
  }

  private getDocumentSetIndexById(documentSetId: string): number {
    return this.documentSets.findIndex(docSet => docSet.id === documentSetId);
  }
}

export const EditorComponent: angular.IComponentOptions = {
  bindings: {
    ecProject: '<',
    ecInterfaceConfig: '<',
    ecOnUpdate: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/editor.html',
  controller: EditorController
};
