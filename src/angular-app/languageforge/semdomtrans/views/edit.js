'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice'])
// DBE controller
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, userService, sessionService, modal, notice) {
	$scope.terms = [
	                 {'source': 'Planet',
	                  'translation': 'Planeta',
	                  'comments': 'This translation may not be true in every context'},
	                 {'source': 'Earth',
	                  'translation': '',
	                  'comments': 'Please double check'},
	                 {'source': 'Moon',
	                  'translation': '',
	                  'comments': ''},
	                  {'source': 'Planet',
	                  'translation': 'Planeta',
	                  'comments': 'This translation may not be true in every context'},
	                 {'source': 'Earth',
	                  'translation': '',
	                  'comments': 'Please double check'},
	                 {'source': 'Moon',
	                  'translation': '',
	                  'comments': ''},
	                  {'source': 'Planet',
	                  'translation': 'Planeta',
	                  'comments': 'This translation may not be true in every context'},
	                 {'source': 'Earth',
	                  'translation': '',
	                  'comments': 'Please double check'},
	                 {'source': 'Moon',
	                  'translation': '',
	                  'comments': ''},
	                  
	               ];
	$scope.currentTerm = {'source': 'Planet',  'translation': 'Planeta', 'comments': 'This translation may not be true in every context'}
}]);
