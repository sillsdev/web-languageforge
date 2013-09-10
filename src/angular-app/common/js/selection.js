
angular.module('palaso.ui.selection', [])
  // Typeahead
  .directive('selection', ["$compile", function($compile) {
		return {
			restrict: 'A',
			scope: {
				remoteVar : "=",
				content : "=",
			},
			link: function(scope, element, attrs) {
				scope.$watch('content',
					function(value) {
						// When the "compile" expresison changes, assign it into
						// the current DOM
						element.html(value);

						// Compile the new DOM and link it to the current scope.
						// NOTE: We only compile .contents so that we don't get
						// into an infinite loop compiling ourselves
						$compile(element.contents())(scope);
					}
				);
				element.bind('mouseup', function() {
					var selectObj = '';
					var range;
					var txt;
					if (window.getSelection) {
						selectObj = window.getSelection();
					}
					else if (document.getSelection) {
						selectObj = document.getSelection();
					}
					else if (document.selection) {
						selectObj = document.selection.createRange().text;
					}
					txt = selectObj.toString();
					console.log('Selected text appears to be:', txt);
					scope.$apply(function() {
						scope.remoteVar = txt;
					});
				});
			}
		};
  }])
  ;
