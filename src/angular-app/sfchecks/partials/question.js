'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', 'projectService', function($scope, projectService) {
		$(".jqte").jqte({
			"placeholder": "Say what you think...",
			"u": false,
			"indent": false,
			"outdent": false,
			"left": false,
			"center": false,
			"right": false,
			"rule": false,
			"source": false,
			"link": false,
			"unlink": false,
			"fsize": false,
			"formats": [
				["p", "Normal"],
				["h4", "Large"]
			]
		});
		$scope.question = {
				'title': 'Who is Sherlock refering to in the text?',
				'content': 'Some pertinent question'
		};
		$scope.answers = 
			[{
				'content': 'Some relevant answer',
				'by': 'Robin',
				'score': '6',
				'comments':
				[{
					'content': 'Some engaging comment',
					'by': 'Cambell'
				}, {
					'content': 'Some dispute',
					'by': 'Chris'
				}]
			}, {
				'content': 'Some relevant answer',
				'by': 'Cambell',
				'score': '3',
				'comments':
				[{
					'content': 'Some engaging comment'
				}, {
					'content': 'Some dispute'
				}]
			}];
	}])
	;
