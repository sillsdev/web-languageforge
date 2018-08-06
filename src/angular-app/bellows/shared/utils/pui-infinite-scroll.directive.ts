import * as angular from 'angular';

angular.module('palaso.ui.scroll', []);

export function PuiInfiniteScroll(): angular.IDirective {
  return {
    restrict: 'A',
    link($scope, $element, $attrs) {
      const raw = $element[0];
      $element.bind('scroll', () => {
        if (raw.scrollTop + raw.offsetHeight + 1000 >= raw.scrollHeight) {
          $scope.$apply($attrs.puiWhenScrolled);
        }
      });
    }
  };
}
