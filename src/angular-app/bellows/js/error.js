'use strict';

// ScriptureForge Error Service
angular.module('sf.error', ['palaso.ui.notice'])
	.service('error', ['$log', 'silNoticeService', function($log, noticeService) {

		this.error = function(title, message) {
			$log.error('Error: ' + title + ' - ' + message);
			var errorMessage = '<b>Bummer.  Something went wrong.</b><br /><b>' + title + "</b>";
			noticeService.push(noticeService.ERROR, errorMessage, message);
		};
	}])
	;