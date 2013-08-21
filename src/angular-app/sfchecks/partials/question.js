'use strict';

angular.module(
		'sfchecks.question',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.jqte', 'ui.bootstrap' ]
	)
	.controller('QuestionCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', 'breadcrumbService',
	                             function($scope, $routeParams, questionService, ss, bcs) {
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
			console.log('questionService.read(', projectId, questionId, ') =>', result)
			if (result.ok) {
				$scope.text = result.data.text;
				$scope.question = result.data.question;
				$scope.project = result.data.project;
				bcs.updateMap('project', $scope.project.id, $scope.project.projectname);
				bcs.updateMap('text', $scope.text.id, $scope.text.title);
				bcs.updateMap('question', $scope.question.id, $scope.question.title);
				// Keep track of answer count so we can show or hide "There are no answers" as appropriate
				$scope.question.answerCount = Object.keys($scope.question.answers).length;
				$scope.rights = result.data.rights;
			} else {
				// error condition
			}
		});
		
		$scope.rightsEditOwn = function(userId) {
			var right = (userId == ss.currentUserId()) && ss.hasRight($scope.rights, ss.domain.ANSWERS, ss.operation.EDIT_OWN);
			return right;
		};

		$scope.rightsDeleteOwn = function(userId) {
			var right = (userId == ss.currentUserId()) && ss.hasRight($scope.rights, ss.domain.ANSWERS, ss.operation.DELETE_OWN);
			return right;
		};

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
				comments: {},
				content: answer.content,
				//dateEdited: Date.now(), // Commented out for now because the model wasn't happy with a Javascript date. TODO: Figure out what format I should be passing this in. RM 2013-08
				score: answer.score,
				textHighlight: answer.textHighlight,
				userRef: answer.userRef,
			};
			for (var id in answer.comments) {
				var strippedComment = {};
				var comment = answer.comments[id];
				strippedComment.id = comment.id;
				strippedComment.content = comment.content;
				strippedComment.dateCreated = comment.dateCreated;
				strippedComment.dateEdited = comment.dateEdited;
				strippedComment.userRef = comment.userRef.userid;
				$scope.editedAnswer.comments[id] = strippedComment;
			}
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
		
		$scope.submitComment = function(answerId, answer) {
			console.log('submitComment(', answerId, answer, ')');
			var newComment = {
				id: '',
				content: $scope.newComment.content,
			};
			questionService.update_comment(projectId, questionId, answerId, newComment, function(result) {
				console.log('update_comment(', projectId, questionId, answerId, newComment, ')');
				if (result.ok) {
					console.log('update_comment ok');
					console.log('Result:', result);
					console.log('Result.data.id:', result.data.id);
					console.log("Comment object before setting ID:", newComment);
					for (var id in result.data) {
						newComment = result.data[id]; // There should be one, and only one, record in result.data
					}
					console.log("Comment object after setting ID:", newComment);
					$scope.question.answers[answerId].comments[newComment.id] = newComment;
				} else {
					console.log('update_comment ERROR');
					console.log(result);
				}
			});
		};
		
		$scope.commentDelete = function(answer, commentId) {
			console.log('delete ', commentId);
			console.log(projectId, questionId, answer, commentId);
			questionService.remove_comment(projectId, questionId, answer.id, commentId, function(result) {
				if (result.ok) {
					console.log('remove_comment ok');
					// Delete locally
					delete answer.comments[commentId];
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
