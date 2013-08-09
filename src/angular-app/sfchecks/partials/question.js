'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.jqte', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', function($scope, $routeParams, questionService, sessionService) {
		$scope.jqteOptions = {
			'placeholder': 'Say what you think...',
			'u': false,
			'indent': false,
			'outdent': false,
			'left': false,
			'center': false,
			'right': false,
			'rule': false,
			'source': false,
			'link': false,
			'unlink': false,
			'fsize': false,
			'formats': [
				['p', 'Normal'],
				['h4', 'Large']
			]
		};

		var projectId = $routeParams.projectId;
		var questionId = $routeParams.questionId;
		questionService.read(projectId, questionId, function(result) {
			if (result.ok) {
				$scope.text = result.data.text;
				$scope.question = result.data.question;
			} else {
				// error condition
			}
		});
		
		$scope.newComment = {
			'id': '',
			'content': '',
			'userRef': sessionService.currentUserId
		};
		
		$scope.newAnswer = {
			content: ''
		};
		
		$scope.submitComment = function(answerId, comment) {
			questionService.update_comment(projectId, questionId, answerId, $scope.newComment, function(result) {
				if (result.error) {
					// TODO error condition
				}
			});
		};
		
		$scope.submitAnswer = function() {
			var answer = {
				'id':'',
				'content': $scope.newAnswer.content,
				'userRef':sessionService.currentUserId
			};
				
			questionService.update_answer(projectId, questionId, answer, function(result) {
				if (result.ok) {
					console.log('update_answer ok');
					for (var id in result.data) {
						$scope.question.answers[id] = result.data[id];
					}
					// TODO error condition (well, that should be handled globally by the service CP 2013-08)
				}
			});
		};
	}])
	;
