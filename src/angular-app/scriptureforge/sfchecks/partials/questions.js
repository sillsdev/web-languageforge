'use strict';

angular.module(
		'sfchecks.questions',
		[ 'bellows.services', 'sfchecks.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'angularFileUpload', 'ngSanitize' ]
	)
	.controller('QuestionsCtrl', ['$scope', 'questionsService', 'questionTemplateService', '$routeParams', 'sessionService', 'sfchecksLinkService', 'breadcrumbService', 'silNoticeService',
	                              function($scope, questionsService, qts, $routeParams, ss, sfchecksLinkService, breadcrumbService, notice) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		$scope.finishedLoading = false;
		
		$scope.audioReady = false;
		soundManager.setup({
			url : '/angular-app/scriptureforge/sfchecks/js/vendor/sm2',
			flashVersion : 9, // optional: shiny features (default = 8)
			// optional: ignore Flash where possible, use 100% HTML5 mode
			//preferFlash : false,
			onready : function() {
				$scope.audioReady = true;
				if(!$scope.$$phase) {
					$scope.$apply();
				}
				// Ready to use; soundManager.createSound() etc. can now be called.
			}
		});
		
		$scope.audioIcon = function() {
			var map = {
				'stop': 'icon-volume-up',
				'play': 'icon-pause',
				'pause': 'icon-play'
			};
			return map[$scope.state];
		};

		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = false; 
		$scope.rights.create = false; 
		$scope.rights.createTemplate = false; 
		$scope.rights.editOther = false; //ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT);
		$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.createTemplate || $scope.rights.editOther;
		
		// Question templates
		$scope.emptyTemplate = {
			title: '(Select a template)',
			description: undefined
		};
		$scope.templates = [$scope.emptyTemplate];
		$scope.queryTemplates = function() {
			qts.list(function(result) {
				if (result.ok) {
					$scope.templates = result.data.entries;
					// Add "(Select a template)" as default value
					$scope.templates.unshift($scope.emptyTemplate);
					if (angular.isUndefined($scope.template)) {
						$scope.template = $scope.emptyTemplate;
					}
				}
			});
		};

		$scope.$watch('template', function(template) {
			if (template && !angular.isUndefined(template.description)) {
				$scope.questionTitle = template.title;
				$scope.questionDescription = template.description;
			}
		});

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
		
//		Array.prototype.containsKey = function(obj_key, key) {
//		    var i = this.length;
//		    while (i--) {
//		        if (this[i][key] === obj_key) {
//		            return true;
//		        }
//		    }
//		    return false;
//		};
		$scope.isSelected = function(item) {
			if (item == null) {
				return false;
			} 
		    var i = $scope.selected.length;
		    while (i--) {
		        if ($scope.selected[i]['id'] === item.id) {
		            return true;
		        }
		    }
		    return false;
//			return item != null && $scope.selected.containsKey(item.id, 'id');
		};
		
		// Listview Data
		$scope.questions = [];
		$scope.queryQuestions = function() {
			//console.log("queryQuestions()");
			questionsService.list(projectId, textId, function(result) {
				if (result.ok) {
					$scope.selected = [];
					$scope.questions = result.data.entries;
					$scope.questionsCount = result.data.count;

					$scope.enhanceDto($scope.questions);
					$scope.text = result.data.text;
					if ($scope.text.audioUrl != '') {
						$scope.audioDownloadUrl = '/download/' + $scope.text.audioUrl;
						$scope.text.audioUrl = '/' + $scope.text.audioUrl;
					} 
					$scope.project = result.data.project;
					$scope.text.url = sfchecksLinkService.text(projectId, textId);
					//console.log($scope.project.name);
					//console.log($scope.text.title);

					// Breadcrumb
					breadcrumbService.set('top',
							[
							 {href: '/app/projects', label: 'My Projects'},
							 {href: sfchecksLinkService.project($routeParams.projectId), label: $scope.project.name},
							 {href: sfchecksLinkService.text($routeParams.projectId, $routeParams.textId), label: $scope.text.title},
							]
					);

					var rights = result.data.rights;
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.DELETE); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.QUESTIONS, ss.operation.CREATE); 
					$scope.rights.createTemplate = ss.hasRight(rights, ss.domain.TEMPLATES, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.createTemplate || $scope.rights.editOther;
					if ($scope.rights.create) {
						$scope.queryTemplates();
					}
					$scope.finishedLoading = true;
				}
			});
		};
		// Remove
		$scope.removeQuestions = function() {
			//console.log("removeQuestions()");
			var questionIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				questionIds.push($scope.selected[i].id);
			}
			if (window.confirm("Are you sure you want to delete these " + questionIds.length + " question(s)?")) {
				questionsService.remove(projectId, questionIds, function(result) {
					if (result.ok) {
						$scope.selected = []; // Reset the selection
						$scope.queryQuestions();
						if (questionIds.length == 1) {
							notice.push(notice.SUCCESS, "The question was removed successfully");
						} else {
							notice.push(notice.SUCCESS, "The questions were removed successfully");
						}
					}
				});
			}
		};
		// Add question
		$scope.addQuestion = function() {
			//console.log("addQuestion()");
			var model = {};
			model.id = '';
			model.textRef = textId;
			model.title = $scope.questionTitle;
			model.description = $scope.questionDescription;
			questionsService.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryQuestions();
					notice.push(notice.SUCCESS, "'" + $scope.calculateTitle(model.title, model.description) + "' was added successfully");
					if ($scope.saveAsTemplate) {
						qts.update(projectId, model, function(result) {
							if (result.ok) {
								notice.push(notice.SUCCESS, "'" + model.title + "' was added as a template question");
							}
						});
					}
					$scope.questionTitle = "";
					$scope.questionDescription = "";
					$scope.saveAsTemplate = false;
					$scope.newQuestionCollapsed = true;
				}
				$scope.queryTemplates();
			});
		};
		
		$scope.calculateTitle = function(title, description) {
			var questionTitleCalculated;
			if (!title || title == '') {
				var spaceIndex = description.indexOf(' ', 50);
				var shortTitle;
				if (spaceIndex > -1) {
					shortTitle = description.slice(0, spaceIndex) + '...';
				} else {
					shortTitle = description;
				}
				questionTitleCalculated = shortTitle;
			} else {
				questionTitleCalculated = title;
			}
			return questionTitleCalculated;
		};
		
		$scope.makeQuestionIntoTemplate = function() {
			// Expects one, and only one, question to be selected (checked)
			var l = $scope.selected.length;
			if (l != 1) {
				return;
			}
			var model = {};
			model.id = '';
			model.title = $scope.selected[0].title;
			model.description = $scope.selected[0].description;
			qts.update(projectId, model, function(result) {
				if (result.ok) {
					$scope.queryTemplates();
					notice.push(notice.SUCCESS, "'" + model.title + "' was added as a template question");
					$scope.selected = [];
				}
			});
		};

		$scope.getAnswerCount = function(question) {
			return question.answerCount;
		};

		$scope.getResponses = function(question) {
			return question.responseCount;
		};
		
		$scope.enhanceDto = function(items) {
			angular.forEach(items, function(item) {
				item.url = sfchecksLinkService.question(projectId, textId, item.id);
				item.calculatedTitle = $scope.calculateTitle(item.title, item.description);
			});
		};

	}])
	.controller('QuestionsSettingsCtrl', ['$scope', '$http', 'textService', 'sessionService', '$routeParams', 'breadcrumbService', 'silNoticeService', 'sfchecksLinkService',
	                                      function($scope, $http, textService, ss, $routeParams, breadcrumbService, notice, sfchecksLinkService) {
		var projectId = $routeParams.projectId;
		var textId = $routeParams.textId;
		$scope.projectId = projectId;
		$scope.textId = textId;
		$scope.editedText = {
			id: textId,
		};

		// Get name from text service. This really should be in the DTO, but this will work for now.
		// TODO: Move this to the DTO (or BreadcrumbHelper?) so we don't have to do a second server round-trip. RM 2013-08
		textService.settings_dto($scope.projectId, $scope.textId, function(result) {
			if (result.ok) {
				$scope.dto = result.data;
				$scope.textTitle = $scope.dto.text.title;
				$scope.editedText.title = $scope.dto.text.title;
				$scope.rights = {
					editOther: ss.hasRight($scope.dto.rights, ss.domain.TEXTS, ss.operation.EDIT),
				};
//				console.log($scope.dto);

				// Breadcrumb
				breadcrumbService.set('top',
						[
						 {href: '/app/projects', label: 'My Projects'},
						 {href: sfchecksLinkService.project($routeParams.projectId), label: $scope.dto.bcs.project.crumb},
						 {href: sfchecksLinkService.text($routeParams.projectId, $routeParams.textId), label: $scope.dto.text.title},
						 {href: sfchecksLinkService.text($routeParams.projectId, $routeParams.textId) + '/Settings', label: 'Settings'},
						]
				);
			}
		});

		$scope.updateText = function(newText) {
			if (!newText.content) {
				delete newText.content;
			}
			textService.update($scope.projectId, newText, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, newText.title + " settings successfully updated");
					$scope.textTitle = newText.title;
				}
			});
		};

		$scope.onUsxFile = function($files) {
			if (!$files || $files.length == 0) {
				return;
			}
			var file = $files[0];  // Use only first file
			var reader = new FileReader();
			reader.addEventListener("loadend", function() {
				// Basic sanity check: make sure what was uploaded is USX
				// First few characters should be optional BOM, optional <?xml ..., then <usx ...
				var startOfText = reader.result.slice(0,1000);
				var usxIndex = startOfText.indexOf('<usx');
				if (usxIndex != -1) {
					$scope.$apply(function() {
						$scope.editedText.content = reader.result;
					});
				} else {
					notice.push(notice.ERROR, "Error loading USX file. The file doesn't appear to be valid USX.");
					$scope.$apply(function() {
						$scope.editedText.content = '';
					});
				}
			});
			reader.readAsText(file);
		};

		$scope.progress = 0;
		$scope.uploadResult = '';
		$scope.onFileSelect = function($files) {
			var file = $files[0];	// take the first file only
			$scope.file = file;
			if (file['size'] <= ss.fileSizeMax()) {
				$http.uploadFile({
				    url: '/upload',	// upload.php script
//					headers: {'myHeaderKey': 'myHeaderVal'},
					data: {
						projectId: projectId,
						textId: textId,
					},
					file: file
				}).progress(function(evt) {
					$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				}).success(function(data, status, headers, config) {
					$scope.uploadResult = data.toString();
					$scope.progress = 100.0;
					// to fix IE not updating the dom
					if (!$scope.$$phase) {
						$scope.$apply();
					}
				});
			} else {
				$scope.uploadResult = file['name'] + " is too large.";
			}
		};
		  

	}])
	.controller('ParatextExportTextCtrl', ['$scope', 'textService', '$routeParams', '$location', 
	                                      function($scope, textService, $routeParams, $location) {
		
		$scope.exportConfig = {
			'textId': $routeParams.textId,
			'tagEditorVisible' : false,
			'exportComments' : false,
			'tags' : []
		};
		
		$scope.download = {
			'xml' : '<no data>',
			'commentCount' : 0,
			'answerCount' : 0,
			'totalCount' : 0,
			'complete' : false,
			'inprogress' : false
		};
		
		$scope.returnTrue = function() {
			return true;
		};

		
		$scope.startExport = function() {
			$scope.download.inprogress = true;
			textService.exportComments($routeParams.projectId, $scope.exportConfig, function(result) {
				if (result.ok) {
					$scope.download = result.data;
					$scope.download.complete = true;
				}
				$scope.download.inprogress = false;
			});
		};
		
		$scope.downloadExport = function() {
			// for a reference on how to create a data-uri for use in downloading content see http://stackoverflow.com/questions/16514509/how-do-you-serve-a-file-for-download-with-angularjs-or-javascript
			var uri = 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.download.xml);
			var link = document.createElement('a');
			link.download = $scope.download.filename;
			link.href = uri;
			link.click();
		};
		
		
	}])
	;
