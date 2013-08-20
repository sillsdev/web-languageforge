'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.jqte', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', 'breadcrumbService', function($scope, $routeParams, questionService, sessionService, bcs) {
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
		//var userId = sessionService.currentUserId(); // Currently unused.
		questionService.read(projectId, questionId, function(result) {
			if (result.ok) {
				$scope.text = result.data.text;
				$scope.question = result.data.question;
				$scope.project = result.data.project;
				bcs.updateMap('project', $scope.project.id, $scope.project.projectname);
				bcs.updateMap('text', $scope.text.id, $scope.text.title);
				bcs.updateMap('question', $scope.question.id, $scope.question.title);
				// Keep track of answer count so we can show or hide "There are no answers" as appropriate
				$scope.question.answerCount = Object.keys($scope.question.answers).length;
			} else {
				// error condition
			}
		});

		$scope.openEditors = {
			answerId: null,
			commentId: null,
		};

		$scope.showAnswerEditor = function(answerId) {
			$scope.openEditors.answerId = answerId;
		};

		$scope.$watch('openEditors.answerId', function(newval, oldval) {
			if (newval === null || newval === undefined) {
				// Skip; we're being called during initialization
				return;
			}

			// Set up the values needed by the new editor
			var answer = $scope.question.answers[newval];
			if (angular.isUndefined(answer)) {
				//console.log('Failed to find', newval, 'in', $scope.question.answers);
				return;
			}
			$scope.editedAnswer = {
				id: newval,
				content: answer.content,
				score: answer.score,
				// Any other fields that should be copied? TODO: Find out. RM 2013-08
			};
		});

		$scope.answerEditorVisible = function(answerId) {
			return (answerId == $scope.openEditors.answerId);
		};

		$scope.showCommentEditor = function(commentId) {
			$scope.openEditors.commentId = commentId;
		};
		$scope.commentEditorVisible = function(commentId) {
			return (commentId == $scope.openEditors.commentId);
		};
		
		$scope.newComment = {
			'content': ''
		};
		
		$scope.newAnswer = {
			content: ''
		};
		
		$scope.submitComment = function(answer, comment) {
			var comment = {
				'id':'',
				'content': $scope.newComment.content,
			};
			questionService.update_comment(projectId, questionId, answer.id, comment, function(result) {
				console.log('update_comment(', projectId, questionId, answer.id, comment, ')');
				if (result.ok) {
					console.log('update_comment ok');
					console.log(result);
					for (var id in result.data) {
						answer.comments[id] = result.data[id];
					}
				} else {
					console.log('update_comment ERROR');
					console.log(result);
				}
			});
		};
		
		$scope.updateAnswer = function(projectId, questionId, answer) {
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

		$scope.submitAnswer = function() {
			var answer = {
				'id':'',
				'content': $scope.newAnswer.content
			};
			$scope.updateAnswer(projectId, questionId, answer);
		};
		
		$scope.editAnswer = function(answer) {
			// FIXME: Preserve ownership of answer. Currently if user A creates
			// an answer and user B edits it later, the answer ends up being
			// "by user B" in the question page. TODO: Fix later. RM 2013-08
			$scope.updateAnswer(projectId, questionId, answer);
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
