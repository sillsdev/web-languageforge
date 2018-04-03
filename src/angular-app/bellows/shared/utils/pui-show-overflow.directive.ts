import * as angular from 'angular';

export const PuiShowOverflow = () => ({
  restrict: 'A',
  scope: {
    ngBind: '=',
    ngBindHtml: '='
  },
  link($scope, $element, $attrs) {
    function updateTitle(newValue: string) {
      if (angular.isDefined(newValue) &&
        ($element[0].offsetHeight > 0 || $element[0].offsetWidth > 0)) {
        if ($element[0].offsetHeight < $element[0].scrollHeight ||
          $element[0].offsetWidth < $element[0].scrollWidth) {
          // make multiline and strip html tags
          const multiline = newValue.replace('</p><p>', '\r\n');
          $attrs.$set('title', multiline.replace(/<[^>]+>/gm, ''));
        } else {
          $attrs.$set('title', '');
        }
      }
    }

    $scope.$watch('ngBind', updateTitle);
    $scope.$watch('ngBindHtml', updateTitle);
  }
} as angular.IDirective);
