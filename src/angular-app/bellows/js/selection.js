
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
				rangy.init();
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
				element.bind('mousedown', function(event) {
					if (scope.oldHighlightedRange) {
						controller.cssApplier.undoToRange(scope.oldHighlightedRange);
						scope.oldHighlightedRange = null;
					}
					scope.validMouseDown = true;
				});
				element.bind('mouseup', function(event) {
					// There is a Firefox behavior, which may be a bug, that
					// is making the mouseup event fire even when the mouse
					// button is released *outside* this element. Weirdly,
					// both the event.currentTarget and event.delegateTarget
					// properties point to this element when the event fires
					// from an outside mouse release! This behavior doesn't
					// happen in Chrome, where the event (correctly) doesn't
					// fire on an outside mouse release.

					// I have found no way to get Firefox to fire the mouseup
					// event correctly. In the meantime, checking that the
					// mousedown event was originally fired on this element
					// should be good enough to catch most, though not all,
					// cases of invalid highlighting.  2013-10 RM

					if (scope.validMouseDown) {
						var selection = rangy.getSelection();
						var selectedHtml = selection.toHtml();

						var range = selection.getRangeAt(0);
						controller.cssApplier.applyToRange(range);
						scope.oldHighlightedRange = range;

						scope.$apply(function() {
							if (scope.silSelectedText != undefined) {
								scope.silSelectedText = selectedHtml;
							}
						});
					}
					scope.validMouseDown = false;
				});
			}
		};
  }])
  ;
