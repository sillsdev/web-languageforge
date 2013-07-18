'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', 'projectService', function($scope, projectService) {
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
