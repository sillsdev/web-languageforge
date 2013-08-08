'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', function($scope, $routeParams, questionService, sessionService) {
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
			'content':'',
			'userRef':sessionService.currentUserId
		}
		
		$scope.newAnswer = {
			'id':'',
			'content':'',
			'userRef':sessionService.currentUserId
		}
		
		$scope.submitComment = function(answerId, comment) {
			questionService.update_comment(projectId, questionId, answerId, $scope.newComment, function(result) {
				if (result.error) {
					// TODO error condition
				}
			});
		}
		
		$scope.submitAnswer = function(answer) {
			questionService.update_answer(projectId, questionId, $scope.newAnswer, function(result) {
				if (result.error) {
					// TODO error condition
				}
			});
		}
	}])
	;
