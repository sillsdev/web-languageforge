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
				// Keep track of answer count so we can show or hide "There are no answers" as appropriate
				$scope.question.answerCount = Object.keys($scope.question.answers).length;
			} else {
				// error condition
			}
		});
		
		$scope.newComment = {
			'content': ''
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
				'content': $scope.newAnswer.content
			};
				
			questionService.update_answer(projectId, questionId, answer, function(result) {
				if (result.ok) {
					console.log('update_answer ok');
					for (var id in result.data) {
						$scope.question.answers[id] = result.data[id];
					}
					// Recalculate answer count as it might have changed
					$scope.question.answerCount = Object.keys($scope.question.answers).length;
					// TODO error condition (well, that should be handled globally by the service CP 2013-08)
				}
			});
		};
		
		$scope.answerDelete = function(answerId) {
			console.log('delete ', answerId);
			questionService.remove_answer(projectId, questionId, answerId, function(result) {
				if (result.ok) {
					console.log('remove_answer ok');
					// Delete locally
					delete $scope.question.answers[answerId];
					// Recalculate answer count as it just changed
					$scope.question.answerCount = Object.keys($scope.question.answers).length;
				}
			});
		};
		
	}])
	;
