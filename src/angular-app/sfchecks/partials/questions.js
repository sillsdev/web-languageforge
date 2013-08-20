'use strict';

angular.module(
		'sfchecks.questions',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('QuestionsCtrl', ['$scope', 'questionsService', '$routeParams', 'sessionService', 'linkService', 'breadcrumbService',
	                              function($scope, questionsService, $routeParams, ss, linkService, bcs) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		$scope.projectName = $routeParams.projectName;
		$scope.textName = $routeParams.textName;
		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = false; 
		$scope.rights.create = false; 
		$scope.rights.editOther = false; //ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT_OTHER);
		$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
		// Listview Selection
		$scope.newQuestionCollapsed = true;
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
			questionsService.list(projectId, textId, function(result) {
				if (result.ok) {
					$scope.questions = result.data.entries;
					$scope.questionsCount = result.data.count;

					$scope.enhanceDto($scope.questions);
					$scope.text = result.data.text;
					$scope.project = result.data.project;
					$scope.text.url = linkService.text(projectId, textId);
					bcs.updateMap('project', $scope.project.id, $scope.project.name);
					bcs.updateMap('text', $scope.text.id, $scope.text.title);

					var rights = result.data.rights;
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.DELETE_OTHER); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT_OTHER);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
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
			questionsService.remove(projectId, questionIds, function(result) {
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
			model.title = $scope.questionTitle;
			model.description = $scope.questionDescription;
			questionsService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryQuestions();
				}
			});
		};

		// Fake data to make the page look good while it's being designed. To be
		// replaced by real data once the appropriate API functions are writen.
		var fakeData = {
			answerCount: -3,
			viewsCount: -27,
			unreadAnswers: -1,
			unreadComments: -5
		};

		$scope.getAnswerCount = function(question) {
			return question.answerCount;
		};

		$scope.getViewsCount = function(question) {
			return fakeData.viewsCount;
		};

		$scope.getUnreadAnswers = function(question) {
			return fakeData.unreadAnswers;
		};

		$scope.getUnreadComments = function(question) {
			return fakeData.unreadComments;
		};
		
		$scope.enhanceDto = function(items) {
			for (var i in items) {
				items[i].url = linkService.question(projectId, textId, items[i].id);
			}
		};

	}])
	.controller('QuestionsSettingsCtrl', ['$scope', 'questionsService', '$routeParams', function($scope, questionsService, $routeParams) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		$scope.projectName = $routeParams.projectName;
		$scope.textName = $routeParams.textName;
	}])
	;
