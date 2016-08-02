'use strict';

angular.module('sfchecks.project', ['bellows.services', 'sfchecks.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.jqte', 'angularFileUpload', 'ngRoute'])
  .controller('ProjectCtrl', ['$scope', 'textService', 'sessionService', 'breadcrumbService', 'sfchecksLinkService', 'silNoticeService', 'sfchecksProjectService', 'messageService','modalService',
  function($scope, textService, ss, breadcrumbService, sfchecksLinkService, notice, sfchecksProjectService, messageService, modalService) {
    $scope.finishedLoading = false;

    // Rights
    $scope.rights = {};
    $scope.rights.archive = false;
    $scope.rights.create = false;
    $scope.rights.edit = false; //ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create || $scope.rights.edit;

    // Broadcast Messages
    // items are in the format of {id: id, subject: subject, content: content}
    $scope.messages = [];

    /*
    function addMessage(id, message) {
      messages.push({id: id, message: message});
    };
    */

    $scope.markMessageRead = function(id) {
      for (var i = 0; i < $scope.messages.length; ++i) {
        var m = $scope.messages[i];
        if (m.id == id) {
          $scope.messages.splice(i, 1);
          messageService.markRead(id);
          break;
        }
      }
    };

    // Listview Selection
    $scope.newTextCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function(event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function(item) {
      return item != null && $scope.selected.indexOf(item) >= 0;
    };

    $scope.texts = [];

    // Page Dto
    $scope.getPageDto = function() {
      sfchecksProjectService.pageDto(function(result) {
        if (result.ok) {
          $scope.texts = result.data.texts;
          $scope.textsCount = $scope.texts.length;
          $scope.enhanceDto($scope.texts);

          $scope.messages = result.data.broadcastMessages;

          // update activity count service
          $scope.activityUnreadCount = result.data.activityUnreadCount;

          $scope.members = result.data.members;

          $scope.project = result.data.project;
          $scope.project.url = sfchecksLinkService.project();

          // Breadcrumb
          breadcrumbService.set('top',
              [
               {href: '/app/projects', label: 'My Projects'},
               {href: sfchecksLinkService.project(), label: $scope.project.name},
              ]
          );

          var rights = result.data.rights;
          $scope.rights.archive = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.ARCHIVE) && !ss.session.project.isArchived;
          $scope.rights.create = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.CREATE) && !ss.session.project.isArchived;
          $scope.rights.edit = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT) && !ss.session.project.isArchived;
          $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create || $scope.rights.edit;

          $scope.finishedLoading = true;
        }
      });
    };

    // Archive Texts
    $scope.archiveTexts = function() {
      //console.log("archiveTexts()");
      var textIds = [];
      var message = '';
      for (var i = 0, l = $scope.selected.length; i < l; i++) {
        textIds.push($scope.selected[i].id);
      }

      if (textIds.length == 1) {
        message = 'Are you sure you want to archive the selected text?';
      } else {
        message = 'Are you sure you want to archive the ' + textIds.length + ' selected texts?';
      }

      // The commented modalService below can be used instead of the window.confirm alert, but must change E2E tests using alerts. IJH 2014-06
      var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Texts?',
        bodyText: message,
      };
      modalService.showModal({}, modalOptions).then(function() {
        textService.archive(textIds, function(result) {
          if (result.ok) {
            $scope.selected = []; // Reset the selection
            $scope.getPageDto();
            if (textIds.length == 1) {
              notice.push(notice.SUCCESS, 'The text was archived successfully');
            } else {
              notice.push(notice.SUCCESS, 'The texts were archived successfully');
            }
          }
        });
      });
    };

    // Add Text
    $scope.addText = function() {
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
      textService.update(model, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The text \'' + model.title + '\' was added successfully');
        }

        $scope.getPageDto();
      });
    };

    $scope.rangeSelectorCollapsed = true;
    $scope.toggleRangeSelector = function() {
      $scope.rangeSelectorCollapsed = !$scope.rangeSelectorCollapsed;
    };

    $scope.enhanceDto = function(items) {
      for (var i in items) {
        items[i].url = sfchecksLinkService.text(items[i].id);
      }
    };

    $scope.onUsxFile = function($files) {
      if (!$files || $files.length == 0) {
        return;
      }

      var file = $files[0];  // Use only first file
      var reader = new FileReader();
      reader.addEventListener('loadend', function() {
        // Basic sanity check: make sure what was uploaded is USX
        // First few characters should be optional BOM, optional <?xml ..., then <usx ...
        var startOfText = reader.result.slice(0, 1000);
        var usxIndex = startOfText.indexOf('<usx');
        if (usxIndex != -1) {
          $scope.$apply(function() {
            $scope.content = reader.result;
          });
        } else {
          notice.push(notice.ERROR, 'Error loading USX file. The file doesn\'t appear to be valid USX.');
          $scope.$apply(function() {
            $scope.content = '';
          });
        }
      });

      reader.readAsText(file);
    };

    $scope.getPageDto();

  },])

  ;
