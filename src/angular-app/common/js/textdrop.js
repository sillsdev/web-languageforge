'use strict';

angular.module('palaso.ui.textdrop', [])
.directive('textdrop', function() {
	return {
		restrict: 'A',
		scope: {
			dropTarget: "=textdrop",
		},
		link: function(scope, element, attrs) {
	        var processDragOverOrEnter = function(event) {
	          if (event != null) {
	            event.preventDefault();
	          }
	          return false;
	        };
	        element.bind('dragover', processDragOverOrEnter);
	        element.bind('dragenter', processDragOverOrEnter);
			element.bind('drop', function(event) {
				var file, reader;
				if (event != null) {
					event.preventDefault();
				}
				reader = new FileReader();
				event.originalEvent.dataTransfer.effectAllowed = 'copy';
				file = event.originalEvent.dataTransfer.files[0];
				reader.onloadend = function(evt) {
					if (evt.target.readyState == FileReader.DONE) {
						scope.$apply(function() {
							scope.dropTarget = evt.target.result;
							// this is probably a hack, but I cannot get scope.$apply to update the view, so I will update it myself
							element[0].value = evt.target.result;
						});	
					}
				};
				reader.readAsText(file);
			});
		}
	}
});