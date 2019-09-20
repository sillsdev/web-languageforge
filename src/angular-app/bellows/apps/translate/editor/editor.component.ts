import * as angular from 'angular';
import { ProgressStatus, TrainResultCode } from 'machine';
import Quill, { DeltaStatic, RangeStatic } from 'quill';
import Worker from 'worker-loader?name=document-cache.worker.js&publicPath=/dist/!./document-cache.worker';

import { SiteWideNoticeService } from '../../../core/site-wide-notice-service';
import { ModalService } from '../../../core/modal/modal.service';
import { NoticeService } from '../../../core/notice/notice.service';
import { DocumentsOfflineCacheService } from '../../../core/offline/documents-offline-cache.service';
import { UtilityService } from '../../../core/utility.service';
import { DocType, SaveState } from '../core/constants';
import { MachineService } from '../core/machine.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { TranslateRights } from '../core/translate-rights.service';
import { TranslateSendReceiveService } from '../core/translate-send-receive.service';
import { TranslateConfigDocumentSets, TranslateUserPreferences } from '../shared/model/translate-config.model';
import { TranslateProject } from '../shared/model/translate-project.model';
import { TranslateUtilities } from '../shared/translate-utilities';
import { DocumentEditor, SourceDocumentEditor, TargetDocumentEditor } from './document-editor';
import { Metrics, MetricService } from './metric.service';
import { RealTimeService } from './realtime.service';

export class TranslateEditorController implements angular.IController {
  tecProject: TranslateProject;
  tecRights: TranslateRights;
  tecInterfaceConfig: any;
  tecOnUpdate: (params: { $event: { project: any } }) => void;

  documentSets: any[] = [];
  dropdownMenuClass: string = 'dropdown-menu-left';
  isTraining: boolean = false;
  selectedDocumentSetIndex: number = -1;
  showFormats: boolean = false;
  trainingPercent: number = 0;
  confidence: any;
  left: DocumentEditor;
  right: DocumentEditor;
  source: SourceDocumentEditor;
  target: TargetDocumentEditor;
  metrics: Metrics;

  private failedConnectionCount: number = 0;
  private currentDocType: string;
  private pendingUpdateUserPrefsCount: number;
  private readonly documentCacheWorker: Worker;

  static $inject = ['$window', '$scope',
    'siteWideNoticeService',
    '$q', 'machineService',
    'metricService', 'modalService',
    'silNoticeService', 'realTimeService',
    'translateProjectApi', 'utilService',
    'translateSendReceiveService'];
  constructor(private readonly $window: angular.IWindowService, private readonly $scope: angular.IScope,
              private readonly siteWideNoticeService: SiteWideNoticeService,
              private readonly $q: angular.IQService, private readonly machine: MachineService,
              private readonly metricService: MetricService, private readonly modal: ModalService,
              private readonly notice: NoticeService, private readonly realTime: RealTimeService,
              private readonly projectApi: TranslateProjectService, private readonly util: UtilityService,
              private readonly sendReceiveService: TranslateSendReceiveService) {
      if (DocumentsOfflineCacheService.canCache()) {
        this.documentCacheWorker = new Worker();
      }
    }

  get isScripture(): boolean {
    return this.tecProject != null && this.tecProject.config.isTranslationDataScripture;
  }

  $onInit(): void {
    this.siteWideNoticeService.displayNotices();
    this.source = new SourceDocumentEditor(this.$q, this.machine, this.realTime);
    this.target = new TargetDocumentEditor(this.$q, this.machine, this.realTime, this.metricService, this.$window);
    // noinspection JSUnusedLocalSymbols
    const modulesConfig: any = {
      toolbar: '#toolbar',

      dragAndDrop: {
        onDrop: (file: File, quill: Quill, event: DragEvent) => {
          return this.onDrop(file, quill, event);
        }
      },

      keyboard: {
        bindings: {
          disableBackspace: {
            key: 'backspace',
            handler: (range: RangeStatic, context: any) => this.focusedEditor.isBackspaceAllowed(range, context)
          },
          disableDelete: {
            key: 'delete',
            handler: (range: RangeStatic, context: any) => this.focusedEditor.isDeleteAllowed(range, context)
          },
          disableEnter: {
            key: 'enter',
            handler: (range: RangeStatic, context: any) => this.focusedEditor.isEnterAllowed(range, context)
          },
          hideSuggestions: {
            key: 'escape',
            handler: (range: RangeStatic, context: any) => {
              if (this.target.hasFocus) {
                this.target.hideSuggestions();
                return false;
              }
              return true;
            }
          }
        }
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
    this.target.modulesConfig.suggestions = {
      container: '.ql-suggestions'
    };
    this.right = this.target;
    this.left = this.source;

    this.$window.addEventListener('resize', this.onWindowResize);
    this.updateDropdownMenuClass();

    this.$window.addEventListener('beforeunload', this.onBeforeUnload);

    this.$window.document.addEventListener('selectionchange', this.onNativeSelectionChanged);

    this.sendReceiveService.addSyncCompleteListener(this.onSendReceiveCompleted);
  }

  $onChanges(changes: any): void {
    const projectChange = changes.tecProject as angular.IChangesObject<TranslateProject>;
    if (projectChange.isFirstChange()) {
      // noinspection JSUnusedGlobalSymbols
      this.confidence = {
        value: undefined,
        options: {
          floor: 0,
          ceil: 1,
          step: 0.01,
          precision: 2,
          showSelectionBar: true,
          getSelectionBarColor: (value: number) => {
            return TranslateUtilities.sliderColor(value);
          },
          onEnd: () => {
            this.updateConfidence();
          },
          translate: (value: number) => {
            switch (value) {
              case 0:
                return 'more suggestions';
              case 1:
                return 'better suggestions';
              default:
                return Math.round(value * 100) + '%';
            }
          }
        }
      };
    }

    if (projectChange != null && projectChange.previousValue !== projectChange.currentValue &&
      projectChange.currentValue != null
    ) {
      this.projectApi.listDocumentSetsDto(result => {
        if (result.ok) {
          angular.merge(this.tecProject, result.data.project);
          this.tecProject.config.documentSets = this.tecProject.config.documentSets ||
            new TranslateConfigDocumentSets();
          this.tecProject.config.userPreferences = this.tecProject.config.userPreferences ||
            new TranslateUserPreferences();
          this.source.inputSystem = this.tecProject.config.source.inputSystem;
          this.target.inputSystem = this.tecProject.config.target.inputSystem;
          this.machine.initialise(this.tecProject.id);
          this.showFormats =  this.tecProject.config.userPreferences.isFormattingOptionsShown;

          this.source.isScripture = this.tecProject.config.isTranslationDataScripture;
          this.target.isScripture = this.tecProject.config.isTranslationDataScripture;

          if (this.tecProject.config.documentSets.idsOrdered == null) {
            this.tecProject.config.documentSets.idsOrdered = [];
          }
          this.resetDocumentSets(result.data.documentSetList);

          if (DocumentsOfflineCacheService.canCache()) {
            this.documentCacheWorker.postMessage({
              projectId: this.tecProject.id,
              slug: this.tecProject.slug,
              docSetIds: this.documentSets.map(ds => ds.id)
            });
          }

          this.machine.confidenceThreshold = this.tecProject.config.confidenceThreshold;
          const userPreferences = this.tecProject.config.userPreferences;
          if (userPreferences.confidenceThreshold == null || !userPreferences.hasConfidenceOverride ||
            !(isFinite(userPreferences.confidenceThreshold) && angular.isNumber(userPreferences.confidenceThreshold))
          ) {
            userPreferences.confidenceThreshold = this.tecProject.config.confidenceThreshold;
          }
          this.confidence.value = userPreferences.confidenceThreshold;

          if (userPreferences.confidenceThreshold != null && userPreferences.hasConfidenceOverride != null &&
            userPreferences.hasConfidenceOverride
          ) {
            this.machine.confidenceThreshold = userPreferences.confidenceThreshold;
          }

          if (userPreferences.selectedDocumentSetId == null || userPreferences.selectedDocumentSetId === '') {
            if (this.documentSets.length > 0) {
              this.selectedDocumentSetIndex = 0;
            }
            userPreferences.selectedDocumentSetId = this.selectedDocumentSetId;
          } else {
            this.selectedDocumentSetIndex = this.getDocumentSetIndexById(userPreferences.selectedDocumentSetId);
          }

          if (userPreferences.selectedSegmentRef != null && userPreferences.selectedSegmentRef !== '') {
            this.target.setInitialSegment(userPreferences.selectedSegmentRef, userPreferences.selectedSegmentChecksum);
          }

          this.$q.all([this.source.created, this.target.created]).then(() => {
            if (userPreferences.isDocumentOrientationTargetRight != null &&
              !userPreferences.isDocumentOrientationTargetRight
            ) {
              this.swapEditors(false);
            }
            this.onQuillCreated(this.source.quill, this.source);
            this.onQuillCreated(this.target.quill, this.target);

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

      this.machine.initialise(this.tecProject.id);

      if (this.source != null) {
        this.source.isScripture = this.tecProject.config.isTranslationDataScripture;
      }
      if (this.target != null) {
        this.target.isScripture = this.tecProject.config.isTranslationDataScripture;
      }

      this.listenForTrainingStatus();
    }
  }

  $onDestroy(): void {
    this.source.quill.root.removeEventListener('keydown', this.metricService.onKeyDown);
    this.target.quill.root.removeEventListener('keydown', this.metricService.onKeyDown);
    this.source.quill.root.removeEventListener('keypress', this.metricService.onKeyPress);
    this.target.quill.root.removeEventListener('keypress', this.metricService.onKeyPress);
    this.$window.document.removeEventListener('mousedown', this.metricService.onMouseDown);
    this.$window.removeEventListener('resize', this.onWindowResize);
    this.$window.removeEventListener('beforeunload', this.onBeforeUnload);
    this.$window.document.removeEventListener('selectionchange', this.onNativeSelectionChanged);
    this.sendReceiveService.removeSyncCompleteListener(this.onSendReceiveCompleted);
    this.saveMetrics();
    this.source.closeDocumentSet();
    this.target.closeDocumentSet();
    this.machine.close();
    if (DocumentsOfflineCacheService.canCache()) {
      this.documentCacheWorker.terminate();
    }
  }

  selectDocumentSet(index: number): void {
    if (this.selectedDocumentSetIndex !== index) {
      this.selectedDocumentSetIndex = index;
      const userPreferences = this.tecProject.config.userPreferences;
      if (userPreferences.selectedDocumentSetId === this.selectedDocumentSetId &&
        userPreferences.selectedSegmentRef != null && userPreferences.selectedSegmentRef !== ''
      ) {
        // the user switched back from another document without selecting anything, so set the initial segment
        this.target.setInitialSegment(userPreferences.selectedSegmentRef, userPreferences.selectedSegmentChecksum);
      }
      this.switchCurrentDocumentSet(this.source);
      this.switchCurrentDocumentSet(this.target);
    }
  }

  showDocumentSetMore(index: number): boolean {
    return this.tecRights.canEditProject() && (this.selectedDocumentSetIndex === index);
  }

  modalDeleteDocumentSet(index: number): void {
    const documentSet = this.documentSets[index];
    const deleteMessage = 'This will delete both source and target documents.<br><br>' +
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
              this.selectDocumentSet(this.selectedDocumentSetIndex - 1);
            }
            this.tecProject.config.userPreferences.selectedSegmentRef = '';
            this.tecProject.config.userPreferences.selectedSegmentChecksum = 0;
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
      templateUrl: '/angular-app/bellows/apps/translate/editor/document-set-update.modal.html',
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
            this.selectDocumentSet(this.documentSets.length - 1);
            this.tecProject.config.userPreferences.selectedSegmentRef = '';
            this.tecProject.config.userPreferences.selectedSegmentChecksum = 0;
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
      templateUrl: '/angular-app/bellows/apps/translate/editor/document-set-move.modal.html'
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
      this.selectDocumentSet(selectedIndex);
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

  train(): void {
    const modalMessage = 'This will train the translation engine using all existing documents. ' +
      'This can take several minutes and will operate in the background.<br><br>' +
      'Are you sure you want to train the translation engine?';
    this.modal.showModalSimple('Train Translation Engine?', modalMessage, 'Cancel', 'Train')
      .then(() => {
        this.trainingPercent = 0;
        this.isTraining = true;
        this.machine.startTraining();
      })
      .catch(() => { });
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

  onContentChanged(editor: DocumentEditor, delta: DeltaStatic): void {
    this.updateEditor(editor, delta);
  }

  onSelectionChanged(editor: DocumentEditor): void {
    this.target.hideSuggestions();
    if (this.hasEditorChanged(editor) && editor.hasFocus) {
      if (this.currentDocType === DocType.TARGET) {
        this.metricService.sendMetrics(true, this.target.currentSegmentDocumentSetId);
      } else {
        // don't record metrics in source editor
        this.metricService.reset();
      }
    }
    this.updateEditor(editor);
  }

  onQuillCreated(quill: Quill, editor: DocumentEditor): void {
    editor.quill = quill;
    this.switchCurrentDocumentSet(editor);
  }

  get saveMessage(): string {
    switch (this.saveState) {
      case SaveState.Unsaved:
        return 'Unsaved changes';
      case SaveState.Saving:
        return 'Saving...';
      case SaveState.Saved:
        return 'All changes saved';
      case SaveState.Unedited:
        return '';
    }
  }

  toggleFormattingOptions(): void {
    this.showFormats = !this.showFormats;
    this.tecProject.config.userPreferences.isFormattingOptionsShown = this.showFormats;
    this.updateUserPreferences();
  }

  resetConfidence(): void {
    this.tecProject.config.userPreferences.hasConfidenceOverride = false;
    this.tecProject.config.userPreferences.confidenceThreshold = this.tecProject.config.confidenceThreshold;
    this.confidence.value = this.tecProject.config.confidenceThreshold;
    this.updateConfidence();
  }

  get engineConfidence(): string {
    return (this.machine.engineConfidence * 100).toFixed(2);
  }

  get engineRating(): string {
    const rescaledConfidence = Math.min(1.0, this.machine.engineConfidence / 0.6);
    const rating = rescaledConfidence * 3;
    return (Math.round(rating * 2) / 2).toFixed(1);
  }

  swapEditors(writePreferences: boolean = true): void {
    const focusedEditor = this.focusedEditor;
    const leftEditorElem = this.left.quill.container.parentElement.parentElement;
    const leftParentElem = leftEditorElem.parentElement;
    const rightEditorElem = this.right.quill.container.parentElement.parentElement;
    const rightParentElem = rightEditorElem.parentElement;
    leftParentElem.appendChild(rightEditorElem);
    rightParentElem.appendChild(leftEditorElem);
    const temp = this.left;
    this.left = this.right;
    this.right = temp;

    if (focusedEditor != null) {
      focusedEditor.quill.focus();
    }

    if (writePreferences) {
      const userPreferences = this.tecProject.config.userPreferences;
      userPreferences.isDocumentOrientationTargetRight = this.right.docType === this.target.docType;
      this.updateUserPreferences();
    }
  }

  private get selectedDocumentSetId(): string {
    if (this.selectedDocumentSetIndex in this.documentSets) {
      return this.documentSets[this.selectedDocumentSetIndex].id;
    }
    return '';
  }

  private get focusedEditor(): DocumentEditor {
    let focusedEditor: DocumentEditor;
    if (this.source.hasFocus) {
      focusedEditor = this.source;
    } else if (this.target.hasFocus) {
      focusedEditor = this.target;
    } else {
      switch (this.currentDocType) {
        case DocType.SOURCE:
          focusedEditor = this.source;
          break;
        case DocType.TARGET:
          focusedEditor = this.target;
          break;
      }
    }
    return focusedEditor;
  }

  private onSendReceiveCompleted = (): void => {
    this.projectApi.listDocumentSetsDto(result => {
      if (result.ok) {
        this.resetDocumentSets(result.data.documentSetList);
      }
    });
  }

  private resetDocumentSets(documentSetList: any): void {
    this.documentSets = [];
    for (const id of this.tecProject.config.documentSets.idsOrdered) {
      if (documentSetList[id] != null) {
        this.documentSets.push(documentSetList[id]);
        delete documentSetList[id];
      }
    }
    for (const documentSetId in documentSetList) {
      if (documentSetList.hasOwnProperty(documentSetId)) {
        const documentSet = documentSetList[documentSetId];
        if (documentSet != null) {
          this.documentSets.push(documentSet);
          this.tecProject.config.documentSets.idsOrdered.push(documentSet.id);
        }
      }
    }
  }

  private onNativeSelectionChanged = (): void => {
    // workaround for bug where Quill allows a selection inside of an embed
    const sel = this.$window.document.getSelection();
    if (sel.rangeCount === 0) {
      return;
    }
    const text = sel.getRangeAt(0).commonAncestorContainer.textContent;
    if (sel.isCollapsed && text === '\ufeff') {
      const editor = this.focusedEditor;
      if (editor != null) {
        editor.quill.setSelection(editor.quill.getSelection(), Quill.sources.SILENT);
      }
    }
  }

  private listenForTrainingStatus(): void {
    if (!this.machine.isInitialised) {
      return;
    }

    this.machine.listenForTrainingStatus(progress => this.onTrainStatusUpdate(progress))
      .then(() => this.onTrainSuccess())
      .catch((resultCode: TrainResultCode) => this.onTrainError(resultCode))
      .finally(() => this.onTrainFinished());
  }

  private onTrainStatusUpdate(progress: ProgressStatus): void {
    this.failedConnectionCount = 0;
    this.isTraining = true;
    this.trainingPercent = Math.round(progress.percentCompleted * 100);
  }

  private onTrainSuccess(): void {
    this.failedConnectionCount = 0;

    this.target.onStartTranslating();
    this.source.translateCurrentSegment()
      .finally(() => this.target.onFinishTranslating());
    this.notice.push(this.notice.SUCCESS, 'Finished training the translation engine');
  }

  private onTrainError(resultCode: TrainResultCode): void {
    if (resultCode === TrainResultCode.httpError) {
      this.failedConnectionCount++;
    } else {
      this.notice.push(this.notice.ERROR, 'Error occurred while training the translation engine');
    }
  }

  private onTrainFinished(): void {
    this.isTraining = false;
    this.trainingPercent = 0;
    if (this.failedConnectionCount >= 3) {
      this.notice.push(this.notice.ERROR, 'Unable to connect to translation engine');
    } else {
      setTimeout(() => this.listenForTrainingStatus(), 0);
    }
  }

  private onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (this.saveState < SaveState.Saved) {
      const message = 'There are unsaved changes.';
      event.returnValue = message;
      return message;
    }
  }

  private saveMetrics(): angular.IPromise<any> {
    // if nothing has happened in either editor then don't send metrics
    if (!this.currentDocType) {
      return this.$q.resolve();
    }

    return this.metricService.sendMetrics(true);
  }

  private get saveState(): SaveState {
    let updateUserPrefsSaveState: SaveState;
    if (this.pendingUpdateUserPrefsCount == null) {
      updateUserPrefsSaveState = SaveState.Unedited;
    } else if (this.pendingUpdateUserPrefsCount > 0) {
      updateUserPrefsSaveState = SaveState.Saving;
    } else {
      updateUserPrefsSaveState = SaveState.Saved;
    }
    return Math.min(this.source.saveState, this.target.saveState, updateUserPrefsSaveState);
  }

  private updateDropdownMenuClass(): void {
    const width = this.$window.innerWidth || this.$window.document.documentElement.clientWidth ||
      this.$window.document.body.clientWidth;
    this.dropdownMenuClass = width < 576 ? 'dropdown-menu-right' : 'dropdown-menu-left';
  }

  private onWindowResize = () => {
    this.$scope.$apply(() => {
      this.updateDropdownMenuClass();
    });
  }

  private switchCurrentDocumentSet(editor: DocumentEditor): void {
    editor.closeDocumentSet();
    if (this.selectedDocumentSetId !== '') {
      editor.openDocumentSet(this.tecProject.slug, this.selectedDocumentSetId);
    }
  }

  private updateEditor(editor: DocumentEditor, delta?: DeltaStatic): void {
    const previousSegment = editor.currentSegment;
    const segmentChanged = editor.update(delta != null);
    switch (editor.docType) {
      case DocType.TARGET:
        if (this.target.hasFocus) {
          this.metricService.productiveCharacterCount = this.target.productiveCharacterCount;
        }

        if (segmentChanged) {
          // select the corresponding source segment
          this.source.isCurrentSegmentHighlighted = false;
          this.source.switchCurrentSegment(this.target.currentSegmentRef);

          if (this.currentDocType) {
            this.metricService.sendMetrics(true, this.target.currentSegmentDocumentSetId);
          } else if (this.selectedDocumentSetId !== '') {
            this.metricService.currentDocumentSetId = this.selectedDocumentSetId;
          }

          const userPreferences = this.tecProject.config.userPreferences;
          if (userPreferences.selectedDocumentSetId !== this.target.currentSegmentDocumentSetId ||
            userPreferences.selectedSegmentRef !== this.target.currentSegmentRef
          ) {
            userPreferences.selectedDocumentSetId = this.target.currentSegmentDocumentSetId;
            userPreferences.selectedSegmentRef = this.target.currentSegmentRef;
            userPreferences.selectedSegmentChecksum = this.target.currentSegmentChecksum;
            this.updateUserPreferences();
          }

          // update suggestions for new segment
          this.target.onStartTranslating();
          this.target.trainSegment(previousSegment)
            .then(() => this.source.translateCurrentSegment())
            .catch(() => { })
            .finally(() => this.target.onFinishTranslating());
        }

        if (this.target.hasFocus) {
          this.source.isCurrentSegmentHighlighted = true;
        } else {
          this.source.isCurrentSegmentHighlighted = false;
        }

        this.source.syncScroll(this.target);
        break;

      case DocType.SOURCE:
        if (segmentChanged) {
          this.target.switchCurrentSegment(this.source.currentSegmentRef);

          if (!this.currentDocType && this.selectedDocumentSetId !== '') {
            this.metricService.currentDocumentSetId = this.selectedDocumentSetId;
          }
        }
        break;
    }

    if (editor.hasFocus) {
      this.currentDocType = editor.docType;
      editor.adjustSelection();
    }
  }

  private updateUserPreferences(): void {
    if (this.pendingUpdateUserPrefsCount == null) {
      this.pendingUpdateUserPrefsCount = 0;
    }
    this.pendingUpdateUserPrefsCount++;
    this.projectApi.updateUserPreferences(this.tecProject.config.userPreferences,
      () => this.pendingUpdateUserPrefsCount--);
    this.tecOnUpdate({ $event: { project: this.tecProject } });
  }

  private getDocumentSetIndexById(documentSetId: string): number {
    return this.documentSets.findIndex(documentSet => documentSet.id === documentSetId);
  }

  private hasEditorChanged(editor: DocumentEditor): boolean {
    return editor.docType !== this.currentDocType;
  }

  private updateConfigConfidenceValues(): void {
    this.tecProject.config.userPreferences.confidenceThreshold = this.confidence.value;
    this.tecProject.config.userPreferences.hasConfidenceOverride =
      (this.tecProject.config.userPreferences.confidenceThreshold !== this.tecProject.config.confidenceThreshold);

    this.machine.confidenceThreshold = this.confidence.value;
    this.target.updateSuggestions();
  }

  private updateConfidence(): void {
    if (this.tecRights.canEditEntry()) {
      this.updateConfigConfidenceValues();
      this.updateUserPreferences();
    }
  }

  private onDrop(file: File, quill: Quill, event: DragEvent): void {
    if (this.isScripture) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.notice.push(this.notice.ERROR, 'Drag a text file (*.txt).');
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    if (file.name.toLowerCase().endsWith('.txt')) {
      this.notice.setLoading('Reading text file "' + file.name + '"...');
      this.util.readTextFile(file).then((text: string) => {
        const html = '<p>' + text.replace(/\n/g, '</p><p>') + '</p>';
        this.insertHtml(quill, html, false);
        this.notice.cancelLoading();
      }).catch((errorMessage: string) => {
        this.notice.cancelLoading();
        this.notice.push(this.notice.ERROR, errorMessage);
      });
    }
  }

  private insertHtml(quill: Quill, html: string, isBlankLastLineRequired = true): void {
    // ensure blank line at end - allows to complete the last segment
    if (isBlankLastLineRequired && !html.endsWith('<p><br></p>')) {
      html += '<p><br></p>';
    }

    this.$scope.$applyAsync(() => {
      let index = quill.getSelection(true).index || quill.getLength();
      if (DocumentEditor.isTextEmpty(quill.getText())) {
        index = 0;
      }

      quill.clipboard.dangerouslyPasteHTML(index, html, Quill.sources.USER);
    });
  }

}

export const TranslateEditorComponent: angular.IComponentOptions = {
  bindings: {
    tecInterfaceConfig: '<',
    tecOnUpdate: '&',
    tecProject: '<',
    tecRights: '<'
  },
  templateUrl: '/angular-app/bellows/apps/translate/editor/editor.component.html',
  controller: TranslateEditorController
};
