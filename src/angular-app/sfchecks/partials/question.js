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
				'questionid': '12334',
				'content': 'Some pertinent question'
		};
		$scope.answers = 
			[{
				'content': 'Clearly Sherlock is referring to "the woman", but who the woman is I have no idea.',
				'by': 'Robin',
				'userid': '12345',
				'date': '17 July 2013',
				'score': '6',
				'avatarRef': '/images/avatar/turquoise4-otter-48x48.png',
				'comments':
				[{
					'content': 'Some engaging comment',
					'by': 'Cambell',
					'userid': '12345',
					'date': '18 July 2013'
				}, {
					'content': 'Some dispute',
					'by': 'Chris',
					'userid': '12345',
					'date': '18 July 2013'
				}]
			}, {
				'content': 'Some relevant answer',
				'by': 'Cambell',
				'userid': '12345',
				'date': '18 November 2013',
				'score': '3',
				'avatarRef': '/images/avatar/salmon-camel-48x48.png',
				'comments':
				[{
					'content': 'Some engaging comment'
					'by': 'Cambell',
					'userid': '12345',
					'date': '18 July 2013'
				}, {
					'content': 'Some dispute'
					'by': 'Chris',
					'userid': '12345',
					'date': '18 July 2013'
				}]
			}];
	}])
	;
