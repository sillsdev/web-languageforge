'use strict';

angular.module('sfchecks.project', ['ui.bootstrap', 'sgw.ui.breadcrumb', 'bellows.services',
  'sfchecks.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.notice',
  'palaso.ui.textdrop', 'palaso.ui.jqte', 'ngFileUpload', 'ngRoute'])
  .controller('ProjectCtrl', ['$scope', 'textService', 'sessionService', 'breadcrumbService',
    'linkService', 'listviewSortingService', 'silNoticeService', 'sfchecksProjectService',
    'messageService', 'utilService', 'modalService', '$q',
  function ($scope, textService, ss, breadcrumbService,
            linkService, sorting, notice, sfchecksProjectService,
            messageService, util, modalService, $q) {
    $scope.finishedLoading = false;

    // Rights
    $scope.rights = {};
    $scope.rights.archive = false;
    $scope.rights.create = false;
    $scope.rights.edit = false; //ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create ||
      $scope.rights.edit;

    // Broadcast Messages
    // items are in the format of {id: id, subject: subject, content: content}
    $scope.messages = [];

    /*
    function addMessage(id, message) {
      messages.push({id: id, message: message});
    };
    */

    $scope.markMessageRead = function (id) {
      for (var i = 0; i < $scope.messages.length; ++i) {
        var m = $scope.messages[i];
        if (m.id === id) {
          $scope.messages.splice(i, 1);
          messageService.markRead(id);
          break;
        }
      }
    };

    // Listview Selection
    $scope.newTextCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex === -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex !== -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      return item !== null && $scope.selected.indexOf(item) >= 0;
    };

    $scope.texts = [];

    // Listview Sorting

    $scope.sortdata = { sortColumn: '', direction: '' };

    $scope.sortIconClass = function (columnName) { return sorting.sortIconClass($scope.sortdata, columnName); };

    $scope.setSortColumn = function (columnName) { return sorting.setSortColumn($scope.sortdata, columnName); };

    $scope.doSort = function () {
      sorting.sortDataByColumn($scope.texts, $scope.sortdata.sortColumn, $scope.sortdata.direction);
    };

    $scope.doSortByColumn = function (columnName) {
      $scope.setSortColumn(columnName);
      $scope.doSort();
    };

    // Page Dto
    // Page Dto
    $scope.getPageDto = function () {
      $q.all([ss.getSession(), sfchecksProjectService.pageDto()]).then(function (data) {
        var session = data[0];
        var result = data[1];
        $scope.texts = result.data.texts;
        $scope.textsCount = $scope.texts.length;
        $scope.enhanceDto($scope.texts);

        $scope.messages = result.data.broadcastMessages;

        // update activity count service
        $scope.activityUnreadCount = result.data.activityUnreadCount;

        $scope.members = result.data.members;

        $scope.project = result.data.project;
        $scope.project.url = linkService.project();

        // Breadcrumb
        breadcrumbService.set('top',
        [
        { href: '/app/projects', label: 'My Projects' },
        { href: linkService.project(), label: $scope.project.name }
        ]
        );

        var rights = result.data.rights;
        $scope.rights.archive = session.hasRight(rights, ss.domain.TEXTS, ss.operation.ARCHIVE) &&
          !session.project().isArchived;
        $scope.rights.create = session.hasRight(rights, ss.domain.TEXTS, ss.operation.CREATE) &&
          !session.project().isArchived;
        $scope.rights.edit = session.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT) &&
          !session.project().isArchived;
        $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create ||
          $scope.rights.edit;

        $scope.finishedLoading = true;
      });
    };

    // Archive Texts
    $scope.archiveTexts = function () {
      //console.log("archiveTexts()");
      var textIds = [];
      var message = '';
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        textIds.push($scope.selected[i].id);
      }

      if (textIds.length === 1) {
        message = 'Are you sure you want to archive the selected text?';
      } else {
        message = 'Are you sure you want to archive the ' + textIds.length + ' selected texts?';
      }

      var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Texts?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(function () {
        textService.archive(textIds, function (result) {
          if (result.ok) {
            $scope.selected = []; // Reset the selection
            $scope.getPageDto();
            if (textIds.length === 1) {
              notice.push(notice.SUCCESS, 'The text was archived successfully');
            } else {
              notice.push(notice.SUCCESS, 'The texts were archived successfully');
            }
          }
        });
      }, angular.noop);
    };

    // Add Text
    $scope.addText = function () {
      //    console.log("addText()");
      var model = {};
      model.id = '';
      model.title = $scope.title;
      model.content = $scope.content;
      model.startCh = $scope.startCh;
      model.startVs = $scope.startVs;
      model.endCh = $scope.endCh;
      model.endVs = $scope.endVs;
      model.fontfamily = $scope.fontfamily;
      textService.update(model, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The text \'' + model.title + '\' was added successfully');
        }

        $scope.getPageDto();
      });
    };

    $scope.rangeSelectorCollapsed = true;
    $scope.toggleRangeSelector = function () {
      $scope.rangeSelectorCollapsed = !$scope.rangeSelectorCollapsed;
    };

    $scope.enhanceDto = function (items) {
      for (var i in items) {
        if (items.hasOwnProperty(i)) {
          items[i].url = linkService.text(items[i].id);
        }
      }
    };

    $scope.readUsx = function readUsx(file) {
      util.readUsxFile(file).then(function (usx) {
        $scope.$applyAsync(function () {
          $scope.content = usx;
        });
      }).catch(function (errorMessage) {
        $scope.$applyAsync(function () {
          notice.push(notice.ERROR, errorMessage);
          $scope.content = '';
        });
      });
    };

    $scope.getPageDto();

  }])

  ;
