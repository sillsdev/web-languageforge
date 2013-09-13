
angular.module('palaso.ui.selection', [])
  // Typeahead
  .directive('silSelection', ["$compile", function($compile) {
		return {
			restrict: 'A',
			scope: {
				silSelectedText : "=",
				content : "=",
			},
			controller: function() {
				this.cssApplier = rangy.createCssClassApplier('highlighted');
			},
			link: function(scope, element, attrs, controller) {
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
				scope.oldHighlightedRange = null;
				scope.$watch('silSelectedText', function(newSelection) {
					if (!newSelection) {
						// Client code cleared the selection; we should clear
						// the highlight if there is one.
						if (scope.oldHighlightedRange) {
							controller.cssApplier.undoToRange(scope.oldHighlightedRange);
						}
					}
				});
				element.bind('mousedown', function() {
					if (scope.oldHighlightedRange) {
						controller.cssApplier.undoToRange(scope.oldHighlightedRange);
						scope.oldHighlightedRange = null;
					}
				});
				element.bind('mouseup', function() {
					var selection = rangy.getSelection();
					var selectedHtml = selection.toHtml();

					var range = selection.getRangeAt(0);
					controller.cssApplier.applyToRange(range);
					scope.oldHighlightedRange = range;

					scope.$apply(function() {
						scope.silSelectedText = selectedHtml;
					});
				});
			}
		};
  }])
  ;
