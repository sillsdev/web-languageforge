'use strict';

angular.module(
		'sfchecks.project',
		[ 'bellows.services', 'sfchecks.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop', 'palaso.ui.jqte', 'angularFileUpload' ]
)
.controller('ProjectCtrl', ['$scope', 'textService', '$routeParams', 'sessionService', 'breadcrumbService', 'sfchecksLinkService', 'silNoticeService', 'sfchecksProjectService', 'messageService',
                            function($scope, textService, $routeParams, ss, breadcrumbService, sfchecksLinkService, notice, sfchecksProjectService, messageService) {
		var projectId = $routeParams.projectId;
		$scope.projectId = projectId;
		$scope.finishedLoading = false;
		
		// Rights
		$scope.rights = {};
		$scope.rights.deleteOther = false; 
		$scope.rights.create = false; 
		$scope.rights.editOther = false; //ss.hasRight(ss.realm.SITE(), ss.domain.PROJECTS, ss.operation.EDIT);
		$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
		
		// Broadcast Messages
		// items are in the format of {id: id, subject: subject, content: content}
		$scope.messages = [];
		
		/*
		function addMessage(id, message) {
			messages.push({id: id, message: message});
		};
		*/
		
		$scope.markMessageRead = function(id) {
			for (var i=0; i < $scope.messages.length; ++i) {
				var m = $scope.messages[i];
				if (m.id == id) {
					$scope.messages.splice(i, 1);
					messageService.markRead(projectId, id);
					break;
				}
			}
		};
		
		
		
		// Listview Selection
		$scope.newTextCollapsed = true;
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
		
		$scope.texts = [];
		
		// Page Dto
		$scope.getPageDto = function() {
			sfchecksProjectService.pageDto(projectId, function(result) {
				if (result.ok) {
					$scope.texts = result.data.texts;
					$scope.textsCount = $scope.texts.length;
					$scope.enhanceDto($scope.texts);
					
					$scope.messages = result.data.broadcastMessages;
					
					// update activity count service
					$scope.activityUnreadCount = result.data.activityUnreadCount;
					
					$scope.members = result.data.members;
						

					$scope.project = result.data.project;
					$scope.project.url = sfchecksLinkService.project(projectId);
					
					// Breadcrumb
					breadcrumbService.set('top',
							[
							 {href: '/app/projects', label: 'My Projects'},
							 {href: sfchecksLinkService.project($routeParams.projectId), label: $scope.project.name},
							]
					);

					var rights = result.data.rights;
					$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.DELETE); 
					$scope.rights.create = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.CREATE); 
					$scope.rights.editOther = ss.hasRight(rights, ss.domain.TEXTS, ss.operation.EDIT);
					$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
					
					$scope.finishedLoading = true;
				}
			});
		};
		
		// Remove Text
		$scope.removeTexts = function() {
			//console.log("removeTexts()");
			var textIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				textIds.push($scope.selected[i].id);
			}
			if (window.confirm("Are you sure you want to delete the(se) " + textIds.length + " text(s)?")) {
				textService.remove(projectId, textIds, function(result) {
					if (result.ok) {
						if (textIds.length == 1) {
							notice.push(notice.SUCCESS, "The text was removed successfully");
						} else {
							notice.push(notice.SUCCESS, "The texts were removed successfully");
						}
						$scope.selected = []; // Reset the selection
						// TODO
					}
					$scope.getPageDto();
				});
			}
		};
		// Add
		$scope.addText = function() {
//			console.log("addText()");
			var model = {};
			model.id = '';
			model.title = $scope.title;
			model.content = $scope.content;
			model.startCh = $scope.startCh;
			model.startVs = $scope.startVs;
			model.endCh = $scope.endCh;
			model.endVs = $scope.endVs;
			textService.update(projectId, model, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "The text '" + model.title + "' was added successfully");
				}
				$scope.getPageDto();
			});
		};

		$scope.getQuestionCount = function(text) {
			return text.questionCount;
		};

		$scope.getResponses = function(text) {
			return text.responseCount;
		};
		
		$scope.enhanceDto = function(items) {
			for (var i in items) {
				items[i].url = sfchecksLinkService.text($scope.projectId, items[i].id);
			}
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
						$scope.content = reader.result;
					});
				} else {
					notice.push(notice.ERROR, "Error loading USX file. The file doesn't appear to be valid USX.");
					$scope.$apply(function() {
						$scope.content = '';
					});
				}
			});
			reader.readAsText(file);
		};
		
		$scope.getPageDto();

	}])
	;
