'use strict';

angular.module('sfchecks.questions', ['ui.bootstrap', 'bellows.services', 'sgw.ui.breadcrumb',
  'sfchecks.services', 'ngFileUpload', 'ngSanitize', 'ngRoute', 'sgw.soundmanager',
  'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.notice'])
  .controller('QuestionsCtrl', ['$scope', 'questionService', 'questionTemplateService',
    '$routeParams', 'sessionService', 'sfchecksLinkService', 'breadcrumbService',
    'silNoticeService', 'modalService', '$q',
  function ($scope, questionService, qts,
            $routeParams, ss, sfchecksLinkService, breadcrumbService,
            notice, modalService, $q) {
    var Q_TITLE_LIMIT = 70;
    var textId = $routeParams.textId;
    $scope.textId = textId;

    $scope.audioReady = false;
    soundManager.setup({
      url: 'vendor_bower/SoundManager2/swf/',
      flashVersion: 9, // optional: shiny features (default = 8)
      // optional: ignore Flash where possible, use 100% HTML5 mode
      //preferFlash : false,
      onready: function () {
        $scope.audioReady = true;
      }
    });

    $scope.audioIcon = function () {
      var map = {
        stop: 'fa fa-volume-up',
        play: 'fa fa-pause',
        pause: 'fa fa-play'
      };
      return map[$scope.state];
    };

    // Rights
    $scope.rights = {};
    $scope.rights.archive = false;
    $scope.rights.create = false;
    $scope.rights.createTemplate = false;
    $scope.rights.editOther = false; //ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create ||
      $scope.rights.createTemplate || $scope.rights.editOther;

    // Question templates
    $scope.emptyTemplate = {
      title: '(Select a template)',
      description: undefined
    };
    $scope.templates = [$scope.emptyTemplate];
    $scope.queryTemplates = function () {
      qts.list(function (result) {
        if (result.ok) {
          $scope.templates = result.data.entries;

          // Add "(Select a template)" as default value
          $scope.templates.unshift($scope.emptyTemplate);
          if (angular.isUndefined($scope.template)) {
            $scope.template = $scope.emptyTemplate;
          }
        }
      });
    };

    $scope.$watch('template', function (template) {
      if (template && !angular.isUndefined(template.description)) {
        $scope.questionTitle = template.title;
        $scope.questionDescription = template.description;
      }
    });

    // Listview Selection
    $scope.newQuestionCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      if (item == null) {
        return false;
      }

      var i = $scope.selected.length;
      while (i--) {
        if ($scope.selected[i].id === item.id) {
          return true;
        }
      }

      return false;
    };

    // Listview Data
    $scope.questions = [];
    $scope.queryQuestions = function () {
      //console.log("queryQuestions()");
      $q.all([ss.getSession(), questionService.list(textId)]).then(function(data) {
        var session = data[0], result = data[1];
        $scope.selected = [];
        $scope.questions = result.data.entries;
        $scope.questionsCount = result.data.count;

        $scope.enhanceDto($scope.questions);
        $scope.project = result.data.project;
        $scope.text = result.data.text;
        if ($scope.text.audioFileName != '') {
          $scope.audioPlayUrl = '/assets/sfchecks/' + $scope.project.slug + '/' + $scope.text.id +
            '_' + $scope.text.audioFileName;
          $scope.audioDownloadUrl = '/download' + $scope.audioPlayUrl;
        }

        $scope.text.url = sfchecksLinkService.text(textId);

        //console.log($scope.project.name);
        //console.log($scope.text.title);

        // Breadcrumb
        breadcrumbService.set('top',
          [
            { href: '/app/projects', label: 'My Projects' },
            { href: sfchecksLinkService.project(), label: $scope.project.name },
            { href: sfchecksLinkService.text($routeParams.textId), label: $scope.text.title }
          ]
        );

        var rights = result.data.rights;
        $scope.rights.archive = session.hasRight(rights, ss.domain.QUESTIONS, ss.operation.ARCHIVE) &&
          !session.project().isArchived;
        $scope.rights.create = session.hasRight(rights, ss.domain.QUESTIONS, ss.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.createTemplate =
          session.hasRight(rights, ss.domain.TEMPLATES, ss.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.editOther = session.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT) &&
          !session.project().isArchived;
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create ||
          $scope.rights.createTemplate || $scope.rights.editOther;
        if ($scope.rights.create) {
          $scope.queryTemplates();
        }

        $scope.finishedLoading = true;
      });
    };

    // Archive questions
    $scope.archiveQuestions = function () {
      //console.log("archiveQuestions()");
      var questionIds = [];
      var message = '';
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        questionIds.push($scope.selected[i].id);
      }

      if (questionIds.length == 1) {
        message = 'Are you sure you want to archive the selected question?';
      } else {
        message = 'Are you sure you want to archive the ' + questionIds.length +
          ' selected questions?';
      }

      var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Questions?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(function () {
        questionService.archive(questionIds, function (result) {
          if (result.ok) {
            $scope.selected = []; // Reset the selection
            $scope.queryQuestions();
            if (questionIds.length == 1) {
              notice.push(notice.SUCCESS, 'The question was archived successfully');
            } else {
              notice.push(notice.SUCCESS, 'The questions were archived successfully');
            }
          }
        });
      });
    };

    // Add question
    $scope.addQuestion = function () {
      //console.log("addQuestion()");
      var model = {};
      model.id = '';
      model.textRef = textId;
      model.title = $scope.questionTitle;
      model.description = $scope.questionDescription;
      questionService.update(model, function (result) {
        if (result.ok) {
          $scope.queryQuestions();
          notice.push(notice.SUCCESS, '\'' + questionService.util
              .calculateTitle(model.title, model.description, Q_TITLE_LIMIT) +
            '\' was added successfully');
          if ($scope.saveAsTemplate) {
            qts.update(model, function (result) {
              if (result.ok) {
                notice.push(notice.SUCCESS, '\'' + model.title +
                  '\' was added as a template question');
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

    $scope.makeQuestionIntoTemplate = function () {
      // Expects one, and only one, question to be selected (checked)
      var l = $scope.selected.length;
      if (l != 1) {
        return;
      }

      var model = {};
      model.id = '';
      model.title = $scope.selected[0].title;
      model.description = $scope.selected[0].description;
      qts.update(model, function (result) {
        if (result.ok) {
          $scope.queryTemplates();
          notice.push(notice.SUCCESS, '\'' + model.title + '\' was added as a template question');
          $scope.selected = [];
        }
      });
    };

    $scope.enhanceDto = function (items) {
      angular.forEach(items, function (item) {
        item.url = sfchecksLinkService.question(textId, item.id);
        item.calculatedTitle = questionService.util.calculateTitle(item.title, item.description,
          Q_TITLE_LIMIT);
      });
    };

  }])
  .controller('QuestionsSettingsCtrl', ['$scope', 'Upload', 'sessionService', '$routeParams',
    'breadcrumbService', 'silNoticeService', 'textService', 'questionService',
    'sfchecksLinkService', 'modalService', '$q',
  function ($scope, Upload, ss, $routeParams,
            breadcrumbService, notice, textService, questionService,
            sfchecksLinkService, modalService, $q) {
    var Q_TITLE_LIMIT = 50;
    var textId = $routeParams.textId;
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

    $scope.queryTextSettings = function () {
      $q.all([ss.getSession(), textService.settingsDto($scope.textId)]).then(function(data) {
        var session = data[0], result = data[1];
        $scope.dto = result.data;
        $scope.textTitle = $scope.dto.text.title;
        $scope.editedText.title = $scope.dto.text.title;
        $scope.editedText.fontfamily = $scope.dto.text.fontfamily;
        $scope.settings.archivedQuestions = result.data.archivedQuestions;
        for (var i = 0; i < $scope.settings.archivedQuestions.length; i++) {
          $scope.settings.archivedQuestions[i].url = sfchecksLinkService.question($scope.textId,
            $scope.settings.archivedQuestions[i].id);
          $scope.settings.archivedQuestions[i].calculatedTitle =
            questionService.util.calculateTitle($scope.settings.archivedQuestions[i].title,
              $scope.settings.archivedQuestions[i].description, Q_TITLE_LIMIT);
          $scope.settings.archivedQuestions[i].dateModified =
            new Date($scope.settings.archivedQuestions[i].dateModified);
        }

        // Rights
        var rights = result.data.rights;
        $scope.rights = {};
        $scope.rights.archive = session.hasRight(rights, ss.domain.QUESTIONS, ss.operation.ARCHIVE);
        $scope.rights.editOther = session.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT);
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.editOther;

        // Breadcrumb
        breadcrumbService.set('top',
          [
            { href: '/app/projects', label: 'My Projects' },
            { href: sfchecksLinkService.project(), label: $scope.dto.bcs.project.crumb },
            { href: sfchecksLinkService.text($routeParams.textId), label: $scope.dto.text.title },
            { href: sfchecksLinkService.text($routeParams.textId) + '/Settings',
              label: 'Settings' }
          ]
        );
      });
    };

    $scope.updateText = function (newText) {
      if (!newText.content) {
        delete newText.content;
      }

      textService.update(newText, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, newText.title + ' settings successfully updated');
          $scope.textTitle = newText.title;
        }
      });
    };

    $scope.toggleRangeSelector = function () {
      $scope.rangeSelectorCollapsed = !$scope.rangeSelectorCollapsed;
    };

    $scope.editPreviousText = function () {
      var msg;
      msg = 'Caution: Editing the USX text can be dangerous. You can easily mess up your text ' +
        'with a typo. Are you really sure you want to do this?';
      var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Edit',
        headerText: 'Edit USX text?',
        bodyText: msg
      };
      modalService.showModal({}, modalOptions).then(function () {
        if ($scope.editedText.content && $scope.editedText.content != $scope.dto.text.content) {
          // Wait; the user had already entered text. Pop up ANOTHER confirm box.
          msg = 'Caution: You had previous edits in the USX text box, which will be replaced if ' +
            'you proceed. Are you really sure you want to throw away your previous edits?';
          var modalOptions = {
            closeButtonText: 'Cancel',
            actionButtonText: 'Replace',
            headerText: 'Replace previous edits?',
            bodyText: msg
          };
          modalService.showModal({}, modalOptions).then(function () {
            $scope.editedText.content = $scope.dto.text.content;
          });
        } else {
          $scope.editedText.content = $scope.dto.text.content;
        }
      });
    };

    $scope.readUsx = function readUsx(file) {
      if (!file || file.$error) return;

      var reader = new FileReader();
      reader.addEventListener('loadend', function () {
        // Basic sanity check: make sure what was uploaded is USX
        // First few characters should be optional BOM, optional <?xml ..., then <usx ...
        var startOfText = reader.result.slice(0, 1000);
        var usxIndex = startOfText.indexOf('<usx');
        if (usxIndex != -1) {
          $scope.$apply(function () {
            $scope.editedText.content = reader.result;
          });
        } else {
          notice.push(notice.ERROR, 'Error loading USX file. The file doesn\'t appear to be ' +
            'valid USX.');
          $scope.$apply(function () {
            $scope.editedText.content = '';
          });
        }
      });

      reader.readAsText(file);
    };

    $scope.uploadAudio = function uploadAudio(file) {
      if (!file || file.$error) return;

      ss.getSession().then(function(session) {
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
            file: file,
            textId: textId
          }
        }).then(function (response) {
            notice.cancelLoading();
            var isUploadSuccess = response.data.result;
            if (isUploadSuccess) {
              $scope.uploadResult = 'File uploaded successfully.';
              notice.push(notice.SUCCESS, $scope.uploadResult);
            } else {
              notice.push(notice.ERROR, response.data.data.errorMessage);
              if (response.data.data.errorType == 'UserMessage') {
                $scope.uploadResult = response.data.data.errorMessage;
              }
            }
          },

          function (response) {
            notice.cancelLoading();
            var errorMessage = 'Import failed.';
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

          function (evt) {
            notice.setPercentComplete(100.0 * evt.loaded / evt.total);
          }
        );
      });
    };

  }])
  .controller('TextSettingsArchivedQuestionsCtrl', ['$scope', 'questionService', 'silNoticeService',
  function ($scope, questionService, notice) {
    // Listview Selection
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      if (item == null) {
        return false;
      }

      var i = $scope.selected.length;
      while (i--) {
        if ($scope.selected[i].id === item.id) {
          return true;
        }
      }

      return false;
    };

    // Publish Questions
    $scope.publishQuestions = function () {
      var questionIds = [];
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        questionIds.push($scope.selected[i].id);
      }

      questionService.publish(questionIds, function (result) {
        if (result.ok) {
          $scope.selected = []; // Reset the selection
          $scope.queryTextSettings();
          if (questionIds.length == 1) {
            notice.push(notice.SUCCESS, 'The question was re-published successfully');
          } else {
            notice.push(notice.SUCCESS, 'The questions were re-published successfully');
          }
        }
      });
    };

  }])
  .controller('ParatextExportTextCtrl', ['$scope', 'textService', '$routeParams',
  function ($scope, textService, $routeParams) {
    $scope.exportConfig = {
      textId: $routeParams.textId,
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

    $scope.returnTrue = function () {
      return true;
    };

    $scope.startExport = function () {
      $scope.download.inprogress = true;
      textService.exportComments($scope.exportConfig, function (result) {
        if (result.ok) {
          $scope.download = result.data;
          $scope.download.complete = true;
        }

        $scope.download.inprogress = false;
      });
    };

    $scope.downloadExport = function () {
      // for a reference on how to create a data-uri for use in downloading content see
      // http://stackoverflow.com/questions/16514509/how-do-you-serve-a-file-for-download-with-angularjs-or-javascript
      var uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.download.xml);
      var link = document.createElement('a');
      link.download = $scope.download.filename;
      link.href = uri;
      link.click();
    };

  }])

  ;
