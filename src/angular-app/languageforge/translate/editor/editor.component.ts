import * as angular from 'angular';
import Quill, { Tooltip } from 'quill';

import { ModalService } from '../../../bellows/core/modal/modal.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { UtilityService } from '../../../bellows/core/utility.service';
import { MachineService } from '../core/machine.service';
import { RealTimeService } from '../core/realtime.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { DocumentData } from './document-data';
import { SuggestionsTheme } from './quill/suggestions-theme';

export class EditorController implements angular.IController {
  source: DocumentData;
  target: DocumentData;
  right: DocumentData;
  left: DocumentData;
  selectedDocumentSetIndex: number = 0;
  documentSets: any[] = [];

  // noinspection JSUnusedGlobalSymbols
  readonly statusOptions: Array<{ key: number, name: string }> = [
    { key: 0, name: 'none' },
    { key: 1, name: 'draft' },
    { key: 2, name: 'approved' }
  ];
  ecProject: any;
  ecInterfaceConfig: any;
  ecOnUpdate: (params: { $event: { project: any } }) => void;

  private currentDocIds: string[] = [];
  private selectedSegmentIndex: number = -1;
  private confidenceThreshold: number = 0.2;

  static $inject = ['$scope', '$q', 'silNoticeService',
    'machineService', 'translateProjectApi', 'realTimeService', 'modalService', 'utilService'];
  constructor(private $scope: angular.IScope, private $q: angular.IQService, private notice: NoticeService,
              private machineService: MachineService, private projectApi: TranslateProjectService,
              private realTime: RealTimeService, private modal: ModalService, private util: UtilityService) { }

  $onInit(): void {
    this.source = new DocumentData(this.$q, 'source', 'Source');
    this.target = new DocumentData(this.$q, 'target', 'Target');
    const modulesConfig: any = {
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
      },

      dragAndDrop: {
        onDrop: (file: File, editor: Quill, event: DragEvent) => {
          return this.onDrop(file, editor, event);
        // },
        // onPaste: (item: DataTransferItem, editor: Quill, event: ClipboardEvent) => {
        //   return this.onPaste(item, editor, event);
        }
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
        const userPreferences = this.ecProject.config.userPreferences;
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
            this.editorCreated(this.left.editor, this.left);
            this.editorCreated(this.right.editor, this.right);
          }
        });
      }
    });
  }

  selectDocumentSet(index: number): void {
    if (this.selectedDocumentSetIndex !== index) {
      this.selectedDocumentSetIndex = index;
      this.contentChanged(this.left.editor, this.left);
      this.contentChanged(this.right.editor, this.right);

      if (this.selectedDocumentSetIndex in this.documentSets) {
        const userPreferences = this.ecProject.config.userPreferences;
        userPreferences.selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
        this.projectApi.updateUserPreferences(userPreferences);
      }
    }
  }

  modalDeleteDocumentSet(index: number): void {
    const documentSet = this.documentSets[index];
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
            this.ecOnUpdate({ $event: { project: this.ecProject } });
            this.notice.push(this.notice.SUCCESS, noticeMessage);
          } else {
            this.notice.push(this.notice.ERROR, 'Sorry, there was a problem removing the document.');
          }
        });
      }, () => { });
  }

  modalUpdateDocumentSet(index?: number): void {
    let isCreate = true;
    let documentSet = { name: '' };
    if (index != null && index in this.documentSets) {
      isCreate = false;
      documentSet = angular.copy(this.documentSets[index]);
    }

    const modalInstance = this.modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/translate/editor/document-set-update.modal.html',
      controller: ['$scope', '$uibModalInstance',
        ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          $scope.titleLabel = (isCreate) ? 'Create a new Document Set' : 'Update Document Set';
          $scope.buttonLabel = (isCreate) ? 'Add' : 'Update';
          $scope.documentSet = documentSet;

          $scope.update = () => $modalInstance.close($scope.documentSet);
        }
      ]
    });

    modalInstance.result.then(docSet => {
      this.projectApi.updateDocumentSet(docSet, result => {
        if (result.ok) {
          angular.merge(docSet, result.data);

          let noticeMessage = 'Document \'' + docSet.name + '\' successfully ';
          if (isCreate) {
            this.documentSets.push(docSet);
            this.selectDocumentSet(this.documentSets.length - 1);
            noticeMessage = noticeMessage + 'added.';
          } else {
            this.documentSets[index] = docSet;
            noticeMessage = noticeMessage + 'updated.';
          }
          this.ecOnUpdate({ $event: { project: this.ecProject } });
          this.notice.push(this.notice.SUCCESS, noticeMessage);
        } else {
          this.notice.push(this.notice.ERROR, 'Sorry, there was a problem saving your changes.');
        }
      });
    }, () => { });
  }

  modalMoveDocumentSet(currentIndex: number): void {
    const documentSet = this.documentSets[currentIndex];
    const modalInstance = this.modal.open({
      controller: ['$scope', '$uibModalInstance',
        ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          $scope.documentSet = documentSet;
          $scope.newIndex = currentIndex.toString();
          $scope.positionOptions = [];
          for (let index = 0; index < this.documentSets.length; index++) {
            $scope.positionOptions.push((index + 1) +
              ((index === currentIndex) ? ' (current)' : ''));
          }

          $scope.move = () => $modalInstance.close(Number($scope.newIndex));
        }
      ],
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/translate/editor/document-set-move.modal.html'
    });

    modalInstance.result.then(newIndex => {
      if (newIndex === currentIndex) {
        return;
      }

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
      this.ecProject.config.documentSets.idsOrdered = this.documentSets.map(docSet => docSet.id);

      this.projectApi.updateConfig(this.ecProject.config, result => {
        if (result.ok) {
          this.notice.push(this.notice.SUCCESS,
            'Document \'' + documentSet.name + '\' successfully moved.');
        } else {
          this.notice.push(this.notice.ERROR, 'Sorry, there was a problem saving your changes.');
        }
        this.ecOnUpdate({ $event: { project: this.ecProject } });
      });
    }, () => { });
  }

  hasDocumentSets(): boolean {
    return this.selectedDocumentSetIndex != null &&
      this.documentSets != null &&
      this.selectedDocumentSetIndex >= 0 &&
      this.selectedDocumentSetIndex < this.documentSets.length;
  }

  getEditorLabel(doc: DocumentData): string {
    let docName = '';
    if (this.documentSets.length > 0 && this.selectedDocumentSetIndex in this.documentSets) {
      docName = this.documentSets[this.selectedDocumentSetIndex].name + ' ';
    }

    return docName + doc.label + ((doc.inputSystem.tag) ? ' (' + doc.inputSystem.tag + ')' : '');
  }

  contentChanged(editor: Quill, doc: DocumentData): void {
    const docId = this.docId(doc.docType);
    if (docId === '') {
      return;
    }

    if (this.currentDocIds[doc.docType] !== docId) {
      this.realTime.disconnectRichTextDoc(this.currentDocIds[doc.docType], editor);
      delete this.currentDocIds[doc.docType];
      this.editorCreated(editor, doc);
    }

    this.updateContent(doc);
  }

  selectionChanged(editor: Quill, doc: DocumentData): void {
    (editor.theme as SuggestionsTheme).suggestTooltip.hide();
    if (doc.docType === 'target') {
      this.contentChanged(editor, doc);
    }
  }

  editorCreated(editor: Quill, doc: DocumentData): void {
    doc.editor = editor;
    doc.editorIsCreated.resolve(true);

    const docId = this.docId(doc.docType);
    if (docId !== '') {
      this.currentDocIds[doc.docType] = docId;
      this.realTime.createAndSubscribeRichTextDoc(this.ecProject.slug, docId, editor);
    }
  }

  swapEditors(writePreferences: boolean = true): void {
    const leftEditor = this.left.editor;
    const rightEditor = this.right.editor;
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.left.docType], leftEditor);
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.right.docType], rightEditor);
    this.currentDocIds = [];

    const newLeft = this.right;
    const newRight = this.left;
    delete this.right;
    delete this.left;
    this.right = newRight;
    this.left = newLeft;
    this.editorCreated(leftEditor, newLeft);
    this.editorCreated(rightEditor, newRight);

    if (writePreferences) {
      const userPreferences = this.ecProject.config.userPreferences;
      userPreferences.isDocumentOrientationTargetRight = this.right.docType === this.target.docType;
      this.projectApi.updateUserPreferences(userPreferences);
      this.ecOnUpdate({ $event: { project: this.ecProject } });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  insertSuggestion(doc: DocumentData, suggestionIndex: number): void {
    const selection = doc.editor.getSelection();
    if (selection.length > 0) {
      return;
    }

    const text = this.machineService.getSuggestionText(suggestionIndex);
    doc.editor.insertText(selection.index, text + ' ', Quill.sources.USER);
    doc.editor.setSelection(selection.index + text.length + 1, 0, Quill.sources.USER);
  }

  // noinspection JSUnusedGlobalSymbols
  changeStatus(doc: DocumentData, optionKey: number): void {
    if (doc.docType === 'target') {
      doc.formatSegmentStateStatus(optionKey, doc.editor.getSelection());
    }
  }

  private docId(docKey: string, documentSetId?: string): string {
    if (!(this.selectedDocumentSetIndex in this.documentSets)) {
      return '';
    }

    if (documentSetId == null) {
      documentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
    }

    return documentSetId + ':' + docKey;
  }

  private updateContent(doc: DocumentData): void {
    const theme = doc.editor.theme as SuggestionsTheme;
    switch (doc.docType) {
      case 'target':
        this.showAndPositionTooltip(theme.moreTooltip, doc.editor);
        const newSegmentIndex = this.target.getSegmentIndex();
        this.learnSegment(newSegmentIndex);
        this.getSuggestions(newSegmentIndex);
        this.selectedSegmentIndex = newSegmentIndex;
        break;

      case 'source':
        theme.moreTooltip.hide();
        theme.suggestTooltip.hide();
        if (!doc.isTextEmpty()) {
          const newSourceSegmentText = doc.getSegment(this.selectedSegmentIndex);
          if (newSourceSegmentText !== doc.segment.text) {
            doc.segment.text = newSourceSegmentText;
            this.machineService.translateInteractively(doc.segment.text, this.confidenceThreshold);
          }
        }
        break;
    }
  }

  private learnSegment(newSegmentIndex: number): void {
    if (this.selectedSegmentIndex >= 0 &&
      !DocumentData.isSelectionCollapsed(this.target.editor.getSelection())
    ) {
      return;
    }

    let targetSegmentText = this.target.getSegment(this.selectedSegmentIndex);
    const selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
    if (this.selectedSegmentIndex < 0) {
      this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
    } else if (newSegmentIndex !== this.selectedSegmentIndex
      || selectedDocumentSetId !== this.target.segment.learnt.documentSetId
    ) {
      if (selectedDocumentSetId !== this.target.segment.learnt.documentSetId) {
        targetSegmentText = this.target.segment.text;
      }

      if (targetSegmentText !== '' &&
        DocumentData.isSelectionCollapsed(this.target.segment.learnt.previousSelection) &&
        !this.target.segment.hasLearntText(targetSegmentText)
      ) {
        this.machineService.learnSegment(() => {
          if (selectedDocumentSetId === this.target.segment.learnt.documentSetId) {
            this.notice.push(this.notice.SUCCESS, 'The modified line was successfully learnt.');
            this.target.formatSegmentStateMachineHasLearnt(true, this.target.segment.learnt.previousSelection);
          } else {
            const documentSetIndex = this.getDocumentSetIndexById(this.target.segment.learnt.documentSetId);
            const documentSetName = this.documentSets[documentSetIndex].name;
            this.notice.push(this.notice.SUCCESS, 'The modified line from the \'' + documentSetName +
              '\' document set was successfully learnt.');
            const formatDelta = this.target.createDeltaSegmentStateMachineHasLearnt(true,
              this.target.segment.blockEndIndex, this.target.segment);
            this.realTime.updateRichTextDoc(this.ecProject.slug,
              this.docId(this.target.docType, this.target.segment.learnt.documentSetId), formatDelta,
              Quill.sources.USER);
          }

          this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
        });
      } else {
        this.target.updateSegmentLearntData(newSegmentIndex, selectedDocumentSetId);
      }
    } else {
      const machineHasLearnt = this.target.segment.hasLearntText(targetSegmentText);
      this.target.segment.text = targetSegmentText;
      this.target.updateSegmentState(newSegmentIndex);
      this.target.updateSegmentBlockEndIndex();
      if (this.target.segment.state.machineHasLearnt !== machineHasLearnt) {
        this.target.formatSegmentStateMachineHasLearnt(machineHasLearnt);
      }
    }
  }

  private getSuggestions(newSegmentIndex: number): void {
    const newSourceSegmentText = this.source.getSegment(newSegmentIndex);
    if (newSegmentIndex !== this.selectedSegmentIndex || newSourceSegmentText !== this.source.segment.text) {
      this.source.segment.text = newSourceSegmentText;
      this.machineService.translateInteractively(this.source.segment.text, this.confidenceThreshold,
        () => this.updatePrefix(newSegmentIndex));
    } else {
      this.updatePrefix(newSegmentIndex);
    }
  }

  private updatePrefix(segmentIndex: number): void {
    this.$scope.$applyAsync(() => {
      this.target.suggestions = this.machineService.updatePrefix(this.target.getSegment(segmentIndex));
      setTimeout(() => {
        this.showAndPositionTooltip((this.target.editor.theme as SuggestionsTheme).suggestTooltip, this.target.editor,
          this.target.hasSuggestion());
      }, 0);
    });
  }

  private showAndPositionTooltip(tooltip: Tooltip, editor: Quill, hasCondition: boolean = true): void {
    const selection = editor.getSelection();
    if (DocumentData.isSelectionCollapsed(selection) && hasCondition) {
      tooltip.show();
      tooltip.position(editor.getBounds(selection.index, selection.length));
    } else {
      tooltip.hide();
    }
  }

  private getDocumentSetIndexById(documentSetId: string): number {
    return this.documentSets.findIndex(docSet => docSet.id === documentSetId);
  }

  private onDrop(file: File, editor: Quill, event: DragEvent): void {
    if (!file.name.toLowerCase().endsWith('.usx') && !file.name.toLowerCase().endsWith('.txt')) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.ERROR, 'Drag a USX or text file.');
      });
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    if (file.name.toLowerCase().endsWith('.usx')) {
      this.notice.setLoading('Reading USX file "'+ file.name + '"...');
      this.util.readUsxFile(file).then((usx: string) => {
        this.notice.setLoading('Formatting USX file "'+ file.name + '" data...');
        this.projectApi.usxToHtml(usx).then((result) => {
          if (result.ok) {
            this.$scope.$applyAsync(() => {
              const index = editor.getSelection(true).index || editor.getLength();
              editor.clipboard.dangerouslyPasteHTML(index, result.data, Quill.sources.USER);
              this.notice.cancelLoading();
            });
          }
        });
      }).catch((errorMessage: string) => {
        this.$scope.$applyAsync(() => {
          this.notice.cancelLoading();
          this.notice.push(this.notice.ERROR, errorMessage);
        });
      });
    } else if (file.name.toLowerCase().endsWith('.txt')) {
      this.notice.setLoading('Reading text file "'+ file.name + '"...');
      this.util.readTextFile(file).then((text: string) => {
        text = text.replace(/\n/g, '</p><p>');
        text = '<p>' + text + '</p>';
        this.$scope.$applyAsync(() => {
          const index = editor.getSelection(true).index || editor.getLength();
          editor.clipboard.dangerouslyPasteHTML(index, text, Quill.sources.USER);
          this.notice.cancelLoading();
        });
      }).catch((errorMessage: string) => {
        this.$scope.$applyAsync(() => {
          this.notice.cancelLoading();
          this.notice.push(this.notice.ERROR, errorMessage);
        });
      });
    }
  }

  private onPaste(item: DataTransferItem, editor: Quill, event: ClipboardEvent): void {
    event.preventDefault();
    this.notice.setLoading('Reading USX file...');
    this.util.readUsxFile(item).then((usx: string) => {
      this.notice.setLoading('Formatting USX file data...');
      this.projectApi.usxToHtml(usx).then((result) => {
        if (result.ok) {
          this.$scope.$applyAsync(() => {
            const selection = editor.getSelection(true);
            editor.clipboard.dangerouslyPasteHTML(selection.index, result.data, Quill.sources.USER);
            this.notice.cancelLoading();
          });
        }
      });
    }).catch((errorMessage: string) => {
      this.$scope.$applyAsync(() => {
        this.notice.cancelLoading();
        this.notice.push(this.notice.ERROR, errorMessage);
      });
    });
  }

}

export const EditorComponent: angular.IComponentOptions = {
  bindings: {
    ecInterfaceConfig: '<',
    ecOnUpdate: '&',
    ecProject: '<'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/editor.html',
  controller: EditorController
};
