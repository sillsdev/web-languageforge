'use strict';

angular.module('login', ['bellows.services', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils'])
.controller('LoginCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',
    function LoginCtrl($scope, userService, sessionService, notice) {
},])

;
