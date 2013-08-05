'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', '$routeParams', 'dtoService', 'answerService', 'commentService', 'sessionService', function($scope, $routeParams, dtoService, answerService, commentService, sessionService) {
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
		dtoService.questionCommentDto(projectId, questionId, function(result) {
			if (result.ok) {
				$scope.text = result.data.text;
				$scope.question = result.data.question;
				$scope.answers = result.data.question.answers;
			} else {
				// error condition
			}
		});
		
		$scope.submitComment = function(answerId, comment) {
			commentModel = {
				'userRef': sessionService.currentUserId,
				'content': comment,
			};
			commentService.update(projectId, questionId, answerId, commentModel, function(result) {
				if (result.error) {
					// TODO error condition
				}
			});
		}
		
		$scope.submitAnswer = function(answer) {
			answerModel = {
				'userRef': sessionService.currentUserId,
				'content': comment,
			};
			commentService.update(projectId, questionId, answerModel, function(result) {
				if (result.error) {
					// TODO error condition
				}
			});
		}
	}])
	;
