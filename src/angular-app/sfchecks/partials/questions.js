'use strict';

angular.module(
		'sfchecks.questions',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionsCtrl', ['$scope', 'questionService', '$routeParams', function($scope, questionService, $routeParams) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		// Listview Selection
		$scope.selected = [];
		$scope.updateSelection = function(event, item) {
			var selectedIndex = $scope.selected.indexOf(item);
			var checkbox = event.target;
			if (checkbox.checked && selectedIndex == -1) {
				$scope.selected.push(item);
			} else if (!checkbox.checked && selectedIndex != -1) {
				$scope.selected.splice(selectedIndex, 1);
			}
		};
		$scope.isSelected = function(item) {
			return item != null && $scope.selected.indexOf(item) >= 0;
		};
		// Listview Data
		$scope.questions = [];
		$scope.queryQuestions = function() {
			console.log("queryQuestions()");
			questionService.list(projectId, textId, function(result) {
				if (result.ok) {
					$scope.questions = result.data.entries;
					$scope.questionsCount = result.data.count;
				}
			});
		};
		// Remove
		$scope.removeQuestions = function() {
			console.log("removeQuestions()");
			var questionIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				questionIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			questionService.remove(projectId, questionIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryQuestions();
					// TODO
				}
			});
		};
		// Add
		$scope.addQuestion = function() {
			console.log("addQuestion()");
			var model = {};
			model.id = '';
			model.textRef = textId;
			model.comment = $scope.question;
			questionService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryQuestions();
				}
			});
		};
	}])
	;