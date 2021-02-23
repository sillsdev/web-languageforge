// tslint:disable-next-line:no-reference
///<reference types="rangy/rangy-classapplier"/>
import * as angular from 'angular';

interface SelectionScope extends angular.IScope {
  oldHighlightedRange: RangyRange;
  silSelectedText: string;
  validMouseDown: boolean;
}

interface SelectionController extends angular.IController {
  cssApplier: RangyClassApplier;
}

export const SfChecksSelectionModule = angular
  .module('palaso.ui.selection', [])
  .directive('silSelection', ['$compile', '$window', ($compile, $window) => {
    return {
      restrict: 'A',
      scope: {
        silSelectedText: '=',
        content: '='
      },
      controller() {
        $window.rangy.init();
        this.cssApplier = $window.rangy.createClassApplier('highlighted');
      },

      link(scope: SelectionScope, element, attrs, controller: SelectionController) {
        scope.$watch('content', (value: string) => {
            // When the "compile" expression changes, assign it into the current DOM
            element.html(value);

            // Compile the new DOM and link it to the current scope.
            // NOTE: We only compile .contents so that we don't get into an infinite loop compiling ourselves
            $compile(element.contents())(scope);
          }
        );
        scope.oldHighlightedRange = null;
        scope.$watch('silSelectedText', (newSelection: string) => {
          if (!newSelection) {
            // Client code cleared the selection; we should clear the highlight if there is one.
            if (scope.oldHighlightedRange) {
              controller.cssApplier.undoToRange(scope.oldHighlightedRange);
            }
          }
        });

        element.bind('mousedown', () => {
          if (scope.oldHighlightedRange) {
            controller.cssApplier.undoToRange(scope.oldHighlightedRange);
            scope.oldHighlightedRange = null;
          }

          scope.validMouseDown = true;
        });

        element.bind('mouseup', () => {
          // There is a Firefox behavior, which may be a bug, that is making the mouseup event fire even when the mouse
          // button is released *outside* this element. Weirdly, both the event.currentTarget and event.delegateTarget
          // properties point to this element when the event fires from an outside mouse release! This behavior doesn't
          // happen in Chrome, where the event (correctly) doesn't fire on an outside mouse release.

          // I have found no way to get Firefox to fire the mouseup event correctly. In the meantime, checking that the
          // mousedown event was originally fired on this element should be good enough to catch most, though not all,
          // cases of invalid highlighting.  2013-10 RM

          if (scope.validMouseDown) {
            const selection = rangy.getSelection();
            const selectedHtml = selection.toHtml();

            const range = selection.getRangeAt(0);
            controller.cssApplier.applyToRange(range);
            scope.oldHighlightedRange = range;

            scope.$apply(() => {
              if (scope.silSelectedText !== undefined) {
                scope.silSelectedText = selectedHtml;
              }
            });
          }

          scope.validMouseDown = false;
        });
      }
    };
  }])
  .name;
