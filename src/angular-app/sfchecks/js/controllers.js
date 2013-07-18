'use strict';

function projectIdFromLocation(location) {
	var url = location.absUrl();
	var slashIndex = url.lastIndexOf('/');
	return url.substr(slashIndex + 1);
}

/* Controllers */
var app = angular.module(
		'sfchecks.controllers',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('MainCtrl', ['$scope', '$route', '$routeParams', '$location', function($scope, $route, $routeParams, $location) {
		$scope.route = $route;
		$scope.location = $location;
		$scope.routeParams = $routeParams;
	}])
	.controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService', function($scope, $rootScope, breadcrumbService) {
		$rootScope.$on('$routeChangeSuccess', function(event, current) {
			$scope.breadcrumbs = breadcrumbService.read();
		});
	}])
	.controller('ProjectsCtrl', ['$scope', 'projectService', function($scope, projectService) {
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
		$scope.projects = [];
		$scope.queryProjectsForUser = function() {
			console.log("queryProjectForUser()");
			projectService.list(function(result) {
				if (result.ok) {
					$scope.projects = result.data.entries;
					$scope.projectCount = result.data.count;
				}
			});
		};
		// Remove
		$scope.removeProject = function() {
			console.log("removeProject()");
			var projectIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				projectIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			projectService.remove(projectIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryProjectsForUser();
					// TODO
				}
			});
		};
		// Add
		$scope.addProject = function() {
			console.log("addProject()");
			var model = {};
			model.id = '';
			model.projectname = $scope.projectName;
			projectService.update(model, function(result) {
				if (result.ok) {
					$scope.queryProjectsForUser();
				}
			});
		};
	}])
	.controller('ProjectCtrl', ['$scope', 'textService', '$routeParams', function($scope, textService, $routeParams) {
		var projectId = $routeParams.projectId;
		$scope.projectId = projectId;
		$scope.projectName = $routeParams.projectName;
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
		$scope.texts = [];
		$scope.queryTexts = function() {
			console.log("queryTexts()");
			textService.list(projectId, function(result) {
				if (result.ok) {
					$scope.texts = result.data.entries;
					$scope.textsCount = result.data.count;
				}
			});
		};
		// Remove
		$scope.removeTexts = function() {
			console.log("removeTexts()");
			var textIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				textIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			textService.remove(projectId, textIds, function(result) {
				if (result.ok) {
					$scope.selected = []; // Reset the selection
					$scope.queryTexts();
					// TODO
				}
			});
		};
		// Add
		$scope.addText = function() {
			console.log("addText()");
			var model = {};
			model.id = '';
			model.title = $scope.title;
			model.content = $scope.content;
			textService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryTexts();
				}
			});
		};
	}])
	.controller('QuestionsCtrl', ['$scope', 'questionService', '$routeParams', function($scope, questionService, $routeParams) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.projectName = $routeParams.projectName;
		$scope.textId = textId;
		$scope.textName = $routeParams.textName;
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
	.controller('QuestionCtrl', ['$scope', 'projectService', '$routeParams', function($scope, projectService, $routeParams) {
		$scope.questionName = $routeParams.questionName;
	}])
	;
