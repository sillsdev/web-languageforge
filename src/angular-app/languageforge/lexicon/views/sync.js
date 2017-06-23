'use strict';

angular.module('lexicon.sync', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice'])
  .controller('SyncCtrl', ['$scope', 'silNoticeService', 'sessionService', 'lexProjectService',
    'lexRightsService', 'lexSendReceiveApi', 'lexSendReceive', '$q',
  function ($scope, notice, sessionService, lexProjectService,
            rightsService, sendReceiveApi, sendReceive, $q) {
    lexProjectService.setBreadcrumbs('sync', 'Synchronize');

    $scope.syncStateNotice = sendReceive.syncStateNotice;
    $scope.lastSyncNotice = sendReceive.lastSyncNotice;

    $q.all([sessionService.getSession(), rightsService.getRights()]).then(function(data) {
      var session = data[0], rights = data[1];
      $scope.showSyncButton = function showSyncButton() {
        return !session.project().isArchived && rights.canEditUsers() &&
          session.projectSettings().hasSendReceive;
      };
    });

    $scope.disableSyncButton = function disableSyncButton() {
      return sendReceive.isStarted();
    };

    // Called when Send/Receive button clicked
    $scope.syncProject = function syncProject() {
      if (!$scope.showSyncButton()) return;

      sendReceiveApi.receiveProject(function (result) {
        if (result.ok) {
          sendReceive.setSyncStarted();
        } else {
          notice.push(notice.ERROR,
            'The project could not be synchronized with LanguageDepot.org. Please try again.');
        }
      });
    };

  }]);
