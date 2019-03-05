import * as angular from 'angular';

interface TagScope extends angular.IScope {
  tags: string[];
  inputtagstring?: string;
  onDelete?: () => void;
  rightsDelete?: () => void;
  removeTag?: (tagIndex: number) => void;
}

// ToDo: refactor both directives as Angular components - IJH 2018-07

export function ViewTags(): angular.IDirective {
  return {
    template: `
      <ul>
        <li data-ng-repeat="tag in tags" data-ng-mouseenter="show = true && rightsDelete()"
            data-ng-mouseleave="show = false">
          {{tag}} <i class="fa fa-trash closeicon" data-ng-click="removeTag($index)"></i>
        </li>
      </ul>
    `,
    restrict: 'E',
    scope: {
      tags: '=',
      onDelete: '&',
      rightsDelete: '&'
    },
    controller: ['$scope', ($scope: TagScope) => {
      $scope.removeTag = function removeTag(tagIndex) {
        $scope.tags.splice(tagIndex, 1);
        if ($scope.onDelete) {
          $scope.onDelete();
        }
      };
    }]
  };
}

export function AddTags(): angular.IDirective {
  return {
    template: `<input type="text" class="form-control" name="inputtagstring"
      data-ng-model="inputtagstring">`,
    restrict: 'E',
    scope: {
      tags: '='
    },
    controller: ['$scope', ($scope: TagScope) => {
      // As the user types into the text input, the comma-separated list of tags will be turned into
      // an actual list and stored in $scope.inputtaglist. Submitting the form will send those tags
      // to the client by setting $scope.tags.
      $scope.inputtagstring = '';

      $scope.$watch('inputtagstring', (inputtagstring: string) => {
        if (inputtagstring) {
          const taglist = inputtagstring.split(',');
          for (let i = 0; i < taglist.length; i++) {
            taglist[i] = taglist[i].trim();

            // Guard against empty-string tags (i.e., "")
            if (!taglist[i]) {
              taglist.splice(i, 1);
              i--; // Stay on this index for next loop iteration
            }
          }

          $scope.tags = taglist;
        }
      });
    }]
  };
}

export const TaggingModule = angular
  .module('palaso.ui.tagging', ['ui.bootstrap'])
  .directive('viewTags', ViewTags)
  .directive('addTags', AddTags)
  .name;
