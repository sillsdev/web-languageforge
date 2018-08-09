import * as angular from 'angular';

export function TextDrop(): angular.IDirective {
  return {
    restrict: 'A',
    require: '?ngModel',
    link(scope, element, attrs, ngModelCtrl: angular.INgModelController) {
      element.bind('dragover', processDragOverOrEnter);
      element.bind('dragenter', processDragOverOrEnter);
      element.bind('drop', (event: Event | any) => {
        if (event != null) {
          event.preventDefault();
        }

        const reader = new FileReader();
        const file = event.originalEvent.dataTransfer.files[0];
        event.originalEvent.dataTransfer.effectAllowed = 'copy';
        reader.onloadend = (evt: ProgressEvent) => {
          const target = evt.target as FileReader;
          if (target.readyState === (FileReader as any).DONE) {
            ngModelCtrl.$setViewValue(target.result);
            ngModelCtrl.$render();
          }
        };

        reader.readAsText(file);
      });

      function processDragOverOrEnter(event: Event): boolean {
        if (event != null) {
          event.preventDefault();
        }

        return false;
      }

    }
  };
}

export const TextDropModule = angular
  .module('palaso.ui.textdrop', [])
  .directive('textdrop', TextDrop)
  .name;
