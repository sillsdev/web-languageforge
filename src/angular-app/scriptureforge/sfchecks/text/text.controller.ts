import * as angular from 'angular';

import {JsonRpcResult} from '../../../bellows/core/api/json-rpc.service';
import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {Session, SessionService} from '../../../bellows/core/session.service';
import {UtilityService} from '../../../bellows/core/utility.service';
import {ListViewModule} from '../../../bellows/shared/list-view.component';
import {UploadFile, UploadResponse} from '../../../bellows/shared/model/upload.model';
import {SoundModule} from '../../../bellows/shared/sound.module';
import {TypeAheadModule} from '../../../bellows/shared/type-ahead.module';
import {SfChecksCoreModule} from '../core/sf-checks-core.module';
import {Question, QuestionTemplate, Text} from '../shared/model/text.model';
import {TextDropModule} from '../shared/textdrop.directive';

export const SfChecksTextModule = angular
  .module('sfchecks.questions', [
    'ngFileUpload',
    CoreModule,
    BreadcrumbModule,
    SoundModule,
    ListViewModule,
    TextDropModule,
    TypeAheadModule,
    NoticeModule,
    SfChecksCoreModule
  ])
  .controller('TextCtrl', ['$scope', '$q', 'questionService', 'questionTemplateService',
    '$routeParams', 'sessionService', 'linkService', 'breadcrumbService',
    'listviewSortingService', 'silNoticeService', 'modalService',
  ($scope, $q, questionService, qts,
   $routeParams, sessionService: SessionService, linkService, breadcrumbService,
   sorting, notice, modalService) => {

    const Q_TITLE_LIMIT = 70;
    const textId = $routeParams.textId;
    $scope.textId = textId;

    // Rights
    $scope.rights = {};
    $scope.rights.archive = false;
    $scope.rights.create = false;
    $scope.rights.createTemplate = false;
    // $scope.rights.editOther =
    //    sessionService.hasSiteRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
    $scope.rights.editOther = false;
    $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create || $scope.rights.createTemplate ||
      $scope.rights.editOther;

    // Question templates
    $scope.emptyTemplate = {
      title: '(Select a template)',
      description: undefined
    } as QuestionTemplate;
    $scope.templates = [$scope.emptyTemplate];

    $scope.queryTemplates = function queryTemplates(): void {
      qts.list((result: JsonRpcResult) => {
        if (result.ok) {
          $scope.templates = result.data.entries;

          // Add "(Select a template)" as default value
          $scope.templates.unshift($scope.emptyTemplate);
          if ($scope.template == null) {
            $scope.template = $scope.emptyTemplate;
          }
        }
      });
    };

    $scope.$watch('template', (template: QuestionTemplate) => {
      if (template && template.description != null) {
        $scope.questionTitle = template.title;
        $scope.questionDescription = template.description;
      }
    });

    // Listview Selection
    $scope.newQuestionCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function updateSelection(event: Event, question: Question): void {
      const selectedIndex = $scope.selected.indexOf(question);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(question);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function isSelected(question: Question): boolean {
      if (question == null) {
        return false;
      }

      let i = $scope.selected.length;
      while (i--) {
        if ($scope.selected[i].id === question.id) {
          return true;
        }
      }

      return false;
    };

    // Listview Sorting

    $scope.sortdata = { sortColumn: '', direction: '' };

    $scope.sortIconClass = function sortIconClass(columnName: string): string {
      return sorting.sortIconClass($scope.sortdata, columnName);
    };

    $scope.setSortColumn = function setSortColumn(columnName: string): void {
      sorting.setSortColumn($scope.sortdata, columnName);
    };

    $scope.doSort = function doSort(): void {
      sorting.sortDataByColumn($scope.questions, $scope.sortdata.sortColumn,
        $scope.sortdata.direction);
    };

    $scope.doSortByColumn = function doSortByColumn(columnName: string): void {
      $scope.setSortColumn(columnName);
      $scope.doSort();
    };

    // Listview Data
    $scope.questions = [] as Question[];
    $scope.queryQuestions = function queryQuestions(): void {
      $q.all([sessionService.getSession(), questionService.list(textId)]).then((data: any[]) => {
        const session = data[0] as Session;
        const result = data[1] as JsonRpcResult;
        $scope.selected = [];
        $scope.questions = result.data.entries;
        $scope.questionsCount = result.data.count;

        $scope.enhanceDto($scope.questions);
        $scope.project = result.data.project;
        $scope.text = result.data.text;
        if ($scope.text.audioFileName !== '') {
          $scope.audioPlayUrl = '/assets/sfchecks/' + $scope.project.slug + '/' + $scope.text.id +
            '_' + $scope.text.audioFileName;
          $scope.audioDownloadUrl = '/download' + $scope.audioPlayUrl;
        }

        $scope.text.url = linkService.text(textId);

        breadcrumbService.set('top', [
          { href: '/app/projects', label: 'My Projects' },
          { href: linkService.project(), label: $scope.project.name },
          { href: linkService.text($routeParams.textId), label: $scope.text.title }
        ]);

        const rights = result.data.rights;
        $scope.rights.archive =
          session.hasRight(rights, sessionService.domain.QUESTIONS, sessionService.operation.ARCHIVE) &&
          !session.project().isArchived;
        $scope.rights.create =
          session.hasRight(rights, sessionService.domain.QUESTIONS, sessionService.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.createTemplate =
          session.hasRight(rights, sessionService.domain.TEMPLATES, sessionService.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.editOther =
          session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.EDIT) &&
          !session.project().isArchived;
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create || $scope.rights.createTemplate ||
          $scope.rights.editOther;
        if ($scope.rights.create) {
          $scope.queryTemplates();
        }

        $scope.finishedLoading = true;
      });
    };

    // Archive questions
    $scope.archiveQuestions = function archiveQuestions(): void {
      const questionIds: string[] = [];
      let message = '';
      for (const selectedQuestion of $scope.selected) {
        questionIds.push(selectedQuestion.id);
      }

      if (questionIds.length === 1) {
        message = 'Are you sure you want to archive the selected question?';
      } else {
        message = 'Are you sure you want to archive the ' + questionIds.length +
          ' selected questions?';
      }

      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Questions?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(() => {
        questionService.archive(questionIds).then((result: JsonRpcResult) => {
          if (result.ok) {
            $scope.selected = []; // Reset the selection
            $scope.queryQuestions();
            if (questionIds.length === 1) {
              notice.push(notice.SUCCESS, 'The question was archived successfully');
            } else {
              notice.push(notice.SUCCESS, 'The questions were archived successfully');
            }
          }
        });
      }, () => {});
    };

    // Add question
    $scope.addQuestion = function addQuestion(): void {
      const question: Question = {
        id: '',
        textRef: textId,
        title: $scope.questionTitle,
        description: $scope.questionDescription
      } as Question;
      questionService.update(question).then((questionUpdateResult: JsonRpcResult) => {
        if (questionUpdateResult.ok) {
          $scope.queryQuestions();
          notice.push(notice.SUCCESS,
            '\'' + questionService.util.calculateTitle(question.title, question.description, Q_TITLE_LIMIT) +
            '\' was added successfully');
          if ($scope.saveAsTemplate) {
            qts.update(question).then((templateUpdateResult: JsonRpcResult) => {
              if (templateUpdateResult.ok) {
                notice.push(notice.SUCCESS, '\'' + question.title + '\' was added as a template question');
              }
            });
          }

          $scope.questionTitle = '';
          $scope.questionDescription = '';
          $scope.saveAsTemplate = false;
          $scope.newQuestionCollapsed = true;
        }

        $scope.queryTemplates();
      });
    };

    $scope.makeQuestionIntoTemplate = function makeQuestionIntoTemplate(): void {
      // Expects one, and only one, question to be selected (checked)
      if ($scope.selected.length !== 1) {
        return;
      }

      const questionTemplate: QuestionTemplate = {
        id: '',
        title: $scope.selected[0].title,
        description: $scope.selected[0].description
      } as QuestionTemplate;
      qts.update(questionTemplate).then((result: JsonRpcResult) => {
        if (result.ok) {
          $scope.queryTemplates();
          notice.push(notice.SUCCESS, '\'' + questionTemplate.title + '\' was added as a template question');
          $scope.selected = [];
        }
      });
    };

    $scope.enhanceDto = function enhanceDto(questions: Question[]): void {
      for (const question of questions) {
        question.url = linkService.question(textId, question.id);
        question.calculatedTitle =
          questionService.util.calculateTitle(question.title, question.description, Q_TITLE_LIMIT);
      }
    };

  }])
  .controller('TextSettingsCtrl', ['$filter', '$scope', '$q', 'Upload', 'sessionService', '$routeParams',
    'breadcrumbService', 'silNoticeService', 'textService', 'questionService', 'utilService',
    'linkService', 'modalService',
  ($filter, $scope, $q, Upload, sessionService: SessionService, $routeParams,
   breadcrumbService, notice, textService, questionService, util: UtilityService,
   linkService, modalService) => {

    const Q_TITLE_LIMIT = 50;
    const textId = $routeParams.textId;
    $scope.textId = textId;
    $scope.editedText = {
      id: textId
    };
    $scope.rangeSelectorCollapsed = true;
    $scope.settings = {};
    $scope.settings.archivedQuestions = [];

    $scope.progress = 0;
    $scope.file = null;
    $scope.uploadResult = '';

    $scope.queryTextSettings = function queryTextSettings() {
      $q.all([sessionService.getSession(), textService.settingsDto($scope.textId)]).then((data: any[]) => {
        const session = data[0] as Session;
        const result = data[1] as JsonRpcResult;
        $scope.dto = result.data;
        $scope.textTitle = $scope.dto.text.title;
        $scope.editedText.title = $scope.dto.text.title;
        $scope.editedText.fontfamily = $scope.dto.text.fontfamily;
        $scope.settings.archivedQuestions = result.data.archivedQuestions;
        for (const archivedQuestion of $scope.settings.archivedQuestions) {
          archivedQuestion.url = linkService.question($scope.textId, archivedQuestion.id);
          archivedQuestion.calculatedTitle = questionService.util.calculateTitle(archivedQuestion.title,
              archivedQuestion.description, Q_TITLE_LIMIT);
          archivedQuestion.dateModified = new Date(archivedQuestion.dateModified);
        }

        // Rights
        const rights = result.data.rights;
        $scope.rights = {};
        $scope.rights.archive =
          session.hasRight(rights, sessionService.domain.QUESTIONS, sessionService.operation.ARCHIVE);
        $scope.rights.editOther = session.hasRight(rights, sessionService.domain.TEXTS, sessionService.operation.EDIT);
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.editOther;

        breadcrumbService.set('top', [
          { href: '/app/projects', label: 'My Projects' },
          { href: linkService.project(), label: $scope.dto.bcs.project.crumb },
          { href: linkService.text($routeParams.textId), label: $scope.dto.text.title },
          { href: linkService.text($routeParams.textId) + '/Settings', label: 'Settings' }
        ]);
      });
    };

    $scope.updateText = function updateText(newText: Text): void {
      if (!newText.content) {
        delete newText.content;
      }

      textService.update(newText).then((result: JsonRpcResult) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, newText.title + ' settings successfully updated');
          $scope.textTitle = newText.title;
        }
      });
    };

    $scope.toggleRangeSelector = function toggleRangeSelector(): void {
      $scope.rangeSelectorCollapsed = !$scope.rangeSelectorCollapsed;
    };

    $scope.editPreviousText = function editPreviousText(): void {
      let msg = 'Caution: Editing the USX text can be dangerous. You can easily mess up your text with a typo. ' +
        'Are you really sure you want to do this?';
      const editModalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Edit',
        headerText: 'Edit USX text?',
        bodyText: msg
      };
      modalService.showModal({}, editModalOptions).then(() => {
        if ($scope.editedText.content && $scope.editedText.content !== $scope.dto.text.content) {
          // Wait; the user had already entered text. Pop up ANOTHER confirm box.
          msg = 'Caution: You had previous edits in the USX text box, which will be replaced if ' +
            'you proceed. Are you really sure you want to throw away your previous edits?';
          const replaceModalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'Replace',
            headerText: 'Replace previous edits?',
            bodyText: msg
          };
          modalService.showModal({}, replaceModalOptions).then(() => {
            $scope.editedText.content = $scope.dto.text.content;
          }, () => {});
        } else {
          $scope.editedText.content = $scope.dto.text.content;
        }
      }, () => {});
    };

    $scope.readUsx = function readUsx(file: UploadFile) {
      util.readUsxFile(file).then((usx: string) => {
        $scope.$applyAsync(() => {
          $scope.editedText.content = usx;
        });
      }).catch((errorMessage: string) => {
        $scope.$applyAsync(() => {
          notice.push(notice.ERROR, errorMessage);
          $scope.editedText.content = '';
        });
      });
    };

    $scope.uploadAudio = function uploadAudio(file: UploadFile) {
      if (!file || file.$error) {
        return;
      }

      sessionService.getSession().then(session => {
        if (file.size > session.fileSizeMax()) {
          notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
            $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
            $filter('bytes')(session.fileSizeMax()) + '.');
          return;
        }

        $scope.file = file;
        notice.setLoading('Uploading ' + file.name + '...');
        Upload.upload({
          url: '/upload/sf-checks/audio',
          data: {
            file,
            textId
          }
        }).then((response: UploadResponse) => {
            notice.cancelLoading();
            const isUploadSuccess = response.data.result;
            if (isUploadSuccess) {
              $scope.uploadResult = 'File uploaded successfully.';
              notice.push(notice.SUCCESS, $scope.uploadResult);
            } else {
              notice.push(notice.ERROR, response.data.data.errorMessage);
              if (response.data.data.errorType === 'UserMessage') {
                $scope.uploadResult = response.data.data.errorMessage;
              }
            }
          },

          (response: UploadResponse) => {
            notice.cancelLoading();
            let errorMessage = 'Import failed.';
            if (response.status > 0) {
              errorMessage += ' Status: ' + response.status;
              if (response.statusText) {
                errorMessage += ' ' + response.statusText;
              }

              if (response.data) {
                errorMessage += '- ' + response.data;
              }
            }

            notice.push(notice.ERROR, errorMessage);
          },

          (evt: ProgressEvent) => {
            notice.setPercentComplete(Math.floor(100.0 * evt.loaded / evt.total));
          }
        );
      });
    };

  }])
  .controller('TextSettingsArchivedQuestionsCtrl', ['$scope', 'questionService', 'silNoticeService',
  ($scope, questionService, notice) => {
    // Listview Selection
    $scope.selected = [];
    $scope.updateSelection = function updateSelection(event: Event, question: Question): void {
      const selectedIndex = $scope.selected.indexOf(question);
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(question);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function isSelected(question: Question): boolean {
      if (question == null) {
        return false;
      }

      let i = $scope.selected.length;
      while (i--) {
        if ($scope.selected[i].id === question.id) {
          return true;
        }
      }

      return false;
    };

    // Publish Questions
    $scope.publishQuestions = function publishQuestions() {
      const questionIds: string[] = [];
      for (const selectedQuestion of $scope.selected) {
        questionIds.push(selectedQuestion.id);
      }

      questionService.publish(questionIds).then((result: JsonRpcResult) => {
        if (result.ok) {
          $scope.selected = []; // Reset the selection
          $scope.queryTextSettings();
          if (questionIds.length === 1) {
            notice.push(notice.SUCCESS, 'The question was re-published successfully');
          } else {
            notice.push(notice.SUCCESS, 'The questions were re-published successfully');
          }
        }
      });
    };

  }])
  .controller('ParatextExportTextCtrl', ['$scope', 'textService', '$routeParams',
  ($scope, textService, $routeParams) => {
    $scope.exportConfig = {
      textId: $routeParams.textId,
      commentFormat: 'PT7',
      exportComments: false,
      exportFlagged: true,
      tags: []
    };

    $scope.download = {
      xml: '<no data>',
      commentCount: 0,
      answerCount: 0,
      totalCount: 0,
      complete: false,
      inprogress: false
    };

    $scope.returnTrue = function returnTrue(): boolean {
      return true;
    };

    $scope.startExport = function startExport(ptVersion: string = 'PT7'): void {
      console.log('Downloading for', ptVersion);
      $scope.exportConfig.commentFormat = ptVersion;
      $scope.download.inprogress = true;
      textService.exportComments($scope.exportConfig).then((result: JsonRpcResult) => {
        if (result.ok) {
          $scope.download = result.data;
          $scope.download.complete = true;
          if ($scope.download.totalCount > 0) {
            // for a reference on how to create a data-uri for use in downloading content see
  // http://stackoverflow.com/questions/16514509/how-do-you-serve-a-file-for-download-with-angularjs-or-javascript
            const uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.download.xml);
            const link = document.createElement('a');
            link.download = $scope.download.filename;
            link.href = uri;
            link.click();
          }
        }

        $scope.download.inprogress = false;
      });
    };

  }])
  .name;
