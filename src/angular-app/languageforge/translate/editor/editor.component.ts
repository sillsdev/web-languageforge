import * as angular from 'angular';
import Quill, { StringMap } from 'quill';

import { ModalService } from '../../../bellows/core/modal/modal.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { UtilityService } from '../../../bellows/core/utility.service';
import { DocType } from '../core/constants';
import { MachineService } from '../core/machine.service';
import { RealTimeService } from '../core/realtime.service';
import { TranslateProjectService } from '../core/translate-project.service';
import {
  TranslateConfigDocumentSets, TranslateProject, TranslateUserPreferences
} from '../shared/model/translate-project.model';
import { DocumentEditor, SourceDocumentEditor, TargetDocumentEditor } from './document-editor';
import { Metrics, MetricService } from './metric.service';
import { Segment } from './segment';

export class TranslateEditorController implements angular.IController {
  tecProject: TranslateProject;
  tecInterfaceConfig: any;
  tecOnUpdate: (params: { $event: { project: any } }) => void;

  source: SourceDocumentEditor;
  target: TargetDocumentEditor;
  right: DocumentEditor;
  left: DocumentEditor;
  selectedDocumentSetIndex: number = 0;
  documentSets: any[] = [];
  metrics: Metrics;
  dropdownMenuClass: string = 'dropdown-menu-left';

  private currentDocIds: string[] = [];
  private onWindowResize = () => {
    this.$scope.$apply(() => {
      this.updateDropdowMenuClass();
    });
  }

  static $inject = ['$window', '$scope', '$q',
    'machineService', 'metricService',
    'modalService', 'silNoticeService',
    'realTimeService', 'translateProjectApi',
    'utilService'];
  constructor(private $window: Window, private $scope: angular.IScope, private $q: angular.IQService,
              private machineService: MachineService, private metricService: MetricService,
              private modal: ModalService, private notice: NoticeService,
              private realTime: RealTimeService, private projectApi: TranslateProjectService,
              private util: UtilityService) { }

  $onInit(): void {
    this.source = new SourceDocumentEditor(this.$q, this.machineService);
    this.target = new TargetDocumentEditor(this.$q, this.machineService, this.metricService, this.$window);
    const modulesConfig: any = {
      toolbar: {
        container: '#toolbar',
        handlers: {
          clean(value: any) {
            // clean should not remove the segment formatting
            const quill = this.quill as Quill;
            const format = quill.getFormat() as StringMap;
            for (const name in format) {
              if (name === 'segment') {
                delete format[name];
              } else {
                format[name] = false;
              }
            }

            const range = quill.getSelection();
            quill.formatText(range.index, range.length, format, Quill.sources.USER);
          }
        }
      },

      suggestions: {
        container: '.ql-suggestions'
      },

      dragAndDrop: {
        onDrop: (file: File, quill: Quill, event: DragEvent) => {
          return this.onDrop(file, quill, event);
        // },
        // onPaste: (item: DataTransferItem, quill: Quill, event: ClipboardEvent) => {
        //   return this.onPaste(item, quill, event);
        }
      },

      keyboard: {
        bindings: { }
      }
    };

    for (let i = -1; i < 9; i++) {
      const numKey = (i + 1).toString();
      modulesConfig.keyboard.bindings['insertSuggestion' + numKey] = {
        key: numKey,
        shortKey: true,
        handler: () => this.target.insertSuggestion(i)
      };
    }

    this.source.modulesConfig = angular.copy(modulesConfig);
    this.target.modulesConfig = angular.copy(modulesConfig);
    this.right = this.source;
    this.left = this.target;

    this.$window.addEventListener('resize', this.onWindowResize);
    this.updateDropdowMenuClass();

    this.projectApi.listDocumentSetsDto(result => {
      if (result.ok) {
        angular.merge(this.tecProject, result.data.project);
        this.tecProject.config.documentSets = this.tecProject.config.documentSets ||
          new TranslateConfigDocumentSets();
        this.tecProject.config.userPreferences = this.tecProject.config.userPreferences ||
          new TranslateUserPreferences();
        this.source.inputSystem = this.tecProject.config.source.inputSystem;
        this.target.inputSystem = this.tecProject.config.target.inputSystem;
        this.machineService.initialise(this.tecProject.slug, this.tecProject.config.isTranslationDataScripture);

        if (this.tecProject.config.documentSets.idsOrdered != null &&
          this.tecProject.config.documentSets.idsOrdered.length > 0
        ) {
          for (const id of this.tecProject.config.documentSets.idsOrdered) {
            if (result.data.documentSetList[id] != null) {
              this.documentSets.push(result.data.documentSetList[id]);
            }
          }
        } else {
          this.tecProject.config.documentSets.idsOrdered = [];
          angular.forEach(result.data.documentSetList, documentSet => {
            if (angular.isDefined(documentSet)) {
              this.documentSets.push(documentSet);
              this.tecProject.config.documentSets.idsOrdered.push(documentSet.id);
            }
          });
        }

        this.source.confidenceThreshold = this.tecProject.config.confidenceThreshold;
        const userPreferences = this.tecProject.config.userPreferences;
        if (userPreferences.confidenceThreshold != null &&
          userPreferences.hasConfidenceOverride != null &&
          userPreferences.hasConfidenceOverride
        ) {
          this.source.confidenceThreshold = userPreferences.confidenceThreshold;
        }

        if (userPreferences.selectedDocumentSetId != null) {
          this.selectedDocumentSetIndex = this.getDocumentSetIndexById(userPreferences.selectedDocumentSetId);
        }

        this.$q.all([this.source.created, this.target.created]).then(() => {
          if (userPreferences.isDocumentOrientationTargetRight != null &&
            userPreferences.isDocumentOrientationTargetRight
          ) {
            this.swapEditors(false);
          } else {
            this.onQuillCreated(this.left.quill, this.left);
            this.onQuillCreated(this.right.quill, this.right);
          }

          this.metricService.setTimeouts(this.tecProject.config.metrics.activeEditTimeout,
            this.tecProject.config.metrics.editingTimeout);
          this.metrics = this.metricService.metrics;
          this.source.quill.root.addEventListener('keydown', this.metricService.onKeyDown);
          this.target.quill.root.addEventListener('keydown', this.metricService.onKeyDown);
          this.source.quill.root.addEventListener('keypress', this.metricService.onKeyPress);
          this.target.quill.root.addEventListener('keypress', this.metricService.onKeyPress);
          this.$window.document.addEventListener('mousedown', this.metricService.onMouseDown);
        });
      }
    });

  }

  $onDestroy(): void {
    this.source.quill.root.removeEventListener('keydown', this.metricService.onKeyDown);
    this.target.quill.root.removeEventListener('keydown', this.metricService.onKeyDown);
    this.source.quill.root.removeEventListener('keypress', this.metricService.onKeyPress);
    this.target.quill.root.removeEventListener('keypress', this.metricService.onKeyPress);
    this.$window.document.removeEventListener('mousedown', this.metricService.onMouseDown);
    this.$window.removeEventListener('resize', this.onWindowResize);
    this.target.trainSegmentIfNecessary();
  }

  selectDocumentSet(index: number, updateConfig: boolean = true): void {
    if (this.selectedDocumentSetIndex !== index) {
      this.selectedDocumentSetIndex = index;
      this.switchCurrentDocumentSet(this.left);
      this.switchCurrentDocumentSet(this.right);

      if (this.selectedDocumentSetIndex in this.documentSets) {
        const userPreferences = this.tecProject.config.userPreferences;
        userPreferences.selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
        if (updateConfig) {
          this.projectApi.updateConfig(this.tecProject.config);
        }
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
            this.tecProject.config.documentSets.idsOrdered.splice(index, 1);
            if (this.selectedDocumentSetIndex >= index) {
              this.selectDocumentSet(this.selectedDocumentSetIndex - 1, false);
            }
            this.projectApi.updateConfig(this.tecProject.config);
            this.notice.push(this.notice.SUCCESS, noticeMessage);
            this.tecOnUpdate({ $event: { project: this.tecProject } });
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
            this.tecProject.config.documentSets.idsOrdered.push(docSet.id);
            this.selectDocumentSet(this.documentSets.length - 1, false);
            this.projectApi.updateConfig(this.tecProject.config);
            noticeMessage += 'added.';
            this.notice.push(this.notice.SUCCESS, noticeMessage);
          } else {
            this.documentSets[index] = docSet;
            noticeMessage += 'updated.';
            this.notice.push(this.notice.SUCCESS, noticeMessage);
          }
          this.tecOnUpdate({ $event: { project: this.tecProject } });
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

      this.tecProject.config.documentSets.idsOrdered = this.documentSets.map(docSet => docSet.id);
      this.selectDocumentSet(selectedIndex, false);
      this.projectApi.updateConfig(this.tecProject.config, result => {
        if (result.ok) {
          this.notice.push(this.notice.SUCCESS,
            'Document \'' + documentSet.name + '\' successfully moved.');
        } else {
          this.notice.push(this.notice.ERROR, 'Sorry, there was a problem saving your changes.');
        }
        this.tecOnUpdate({ $event: { project: this.tecProject } });
      });
    }, () => { });
  }

  hasDocumentSets(): boolean {
    return this.selectedDocumentSetIndex != null &&
      this.documentSets != null &&
      this.selectedDocumentSetIndex >= 0 &&
      this.selectedDocumentSetIndex < this.documentSets.length;
  }

  getEditorLabel(editor: DocumentEditor): string {
    let docName = '';
    if (this.documentSets.length > 0 && this.selectedDocumentSetIndex in this.documentSets) {
      docName = this.documentSets[this.selectedDocumentSetIndex].name + ' ';
    }

    return docName + editor.label + ((editor.inputSystem.tag) ? ' (' + editor.inputSystem.tag + ')' : '');
  }

  onContentChanged(editor: DocumentEditor): void {
    this.updateEditor(editor);
  }

  onSelectionChanged(editor: DocumentEditor): void {
    this.target.hideSuggestions();
    this.updateEditor(editor);
  }

  onQuillCreated(quill: Quill, editor: DocumentEditor): void {
    editor.quill = quill;
    const docId = this.docId(editor.docType);
    if (docId !== '') {
      this.currentDocIds[editor.docType] = docId;
      this.realTime.createAndSubscribeRichTextDoc(this.tecProject.slug, docId, quill);
    }
  }

  swapEditors(writePreferences: boolean = true): void {
    const leftQuill = this.left.quill;
    const rightQuill = this.right.quill;
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.left.docType], leftQuill);
    this.realTime.disconnectRichTextDoc(this.currentDocIds[this.right.docType], rightQuill);
    this.currentDocIds = [];

    const newLeft = this.right;
    const newRight = this.left;
    delete this.right;
    delete this.left;
    this.right = newRight;
    this.left = newLeft;
    this.onQuillCreated(leftQuill, newLeft);
    this.onQuillCreated(rightQuill, newRight);

    if (writePreferences) {
      const userPreferences = this.tecProject.config.userPreferences;
      userPreferences.isDocumentOrientationTargetRight = this.right.docType === this.target.docType;
      this.projectApi.updateUserPreferences(userPreferences);
      this.tecOnUpdate({ $event: { project: this.tecProject } });
    }
  }

  private updateDropdowMenuClass(): void {
    const width = this.$window.innerWidth || this.$window.document.documentElement.clientWidth ||
      this.$window.document.body.clientWidth;
    this.dropdownMenuClass = width < 576 ? 'dropdown-menu-right' : 'dropdown-menu-left';
  }

  private switchCurrentDocumentSet(editor: DocumentEditor) {
    const docId = this.docId(editor.docType);
    if (docId === '') {
      return;
    }

    if (this.currentDocIds[editor.docType] !== docId) {
      this.realTime.disconnectRichTextDoc(this.currentDocIds[editor.docType], editor.quill);
      delete this.currentDocIds[editor.docType];
      this.onQuillCreated(editor.quill, editor);
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

  private updateEditor(editor: DocumentEditor): void {
    const selectedDocumentSetId = this.documentSets[this.selectedDocumentSetIndex].id;
    const segmentChanged = editor.update(selectedDocumentSetId);
    switch (editor.docType) {
      case DocType.TARGET:
        if (segmentChanged) {
          // select the corresponding source segment
          this.source.switchCurrentSegment(selectedDocumentSetId, editor.currentSegment.index);
          // update suggestions for new segment
          this.source.translateCurrentSegment().then(() => this.target.updateSuggestions());
        } else {
          if (this.target.hasFocus) {
            this.source.isCurrentSegmentHighlighted = true;
          } else if (!this.source.hasFocus) {
            this.source.isCurrentSegmentHighlighted = false;
          }
        }
        break;

      case DocType.SOURCE:
        if (segmentChanged) {
          this.target.switchCurrentSegment(selectedDocumentSetId, editor.currentSegment.index);
        }
        break;
    }
  }

  private getDocumentSetIndexById(documentSetId: string): number {
    return this.documentSets.findIndex(docSet => docSet.id === documentSetId);
  }

  private onDrop(file: File, quill: Quill, event: DragEvent): void {
    if (!file.name.toLowerCase().endsWith('.usx') && !file.name.toLowerCase().endsWith('.txt')) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.ERROR, 'Drag a USX or text file.');
      });
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    if (file.name.toLowerCase().endsWith('.usx')) {
      this.notice.setLoading('Reading USX file "' + file.name + '"...');
      this.util.readUsxFile(file).then((usx: string) => {
        this.notice.setLoading('Formatting USX file "' + file.name + '" data...');
        this.projectApi.usxToHtml(usx).then(result => {
          if (result.ok) {
            this.$scope.$applyAsync(() => {
              const index = quill.getSelection(true).index || quill.getLength();
              quill.clipboard.dangerouslyPasteHTML(index, result.data, Quill.sources.USER);
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
      this.notice.setLoading('Reading text file "' + file.name + '"...');
      this.util.readTextFile(file).then((text: string) => {
        text = text.replace(/\n/g, '</p><p>');
        text = '<p>' + text + '</p>';
        this.$scope.$applyAsync(() => {
          const index = quill.getSelection(true).index || quill.getLength();
          quill.clipboard.dangerouslyPasteHTML(index, text, Quill.sources.USER);
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

  private onPaste(item: DataTransferItem, quill: Quill, event: ClipboardEvent): void {
    event.preventDefault();
    this.notice.setLoading('Reading USX file...');
    this.util.readUsxFile(item).then((usx: string) => {
      this.notice.setLoading('Formatting USX file data...');
      this.projectApi.usxToHtml(usx).then(result => {
        if (result.ok) {
          this.$scope.$applyAsync(() => {
            const selection = quill.getSelection(true);
            quill.clipboard.dangerouslyPasteHTML(selection.index, result.data, Quill.sources.USER);
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

export const TranslateEditorComponent: angular.IComponentOptions = {
  bindings: {
    tecInterfaceConfig: '<',
    tecOnUpdate: '&',
    tecProject: '<'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/editor.component.html',
  controller: TranslateEditorController
};
