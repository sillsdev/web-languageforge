'use strict';

angular.module('lexicon.rapid-word', ['coreModule', 'palaso.ui.language', 'palaso.ui.notice'])
  .controller('RapidWordCollectionCtrl', ['$scope', 'silNoticeService', 'userService', 'lexProjectService',
    'sessionService', '$filter', 'lexConfigService', 'lexSendReceive',
  function ($scope, notice, userService, lexProjectService,
            sessionService, $filter, lexConfig, sendReceive) {
    var currentTabIndex = 0;
    var warnOfUnsavedEditsId;
lexProjectService.setBreadcrumbs('rapidWord', $filter('translate')('Rapid Word Collection'));
}]);