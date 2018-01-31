angular.module('palaso.ui.dc.optionlist', [])

  // Palaso UI Optionlist
  .directive('dcOptionlist', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-optionlist.html',
      scope: {
        config: '=',
        model: '=',
        control: '=',
        items: '=',
        fieldName: '='
      },
      controller: ['$scope', '$state', function ($scope, $state) {
        $scope.$state = $state;
        $scope.contextGuid = $scope.$parent.contextGuid;
        $scope.getDisplayName = function getDisplayName(value) {
          var displayName = value;
          if (angular.isDefined($scope.items)) {
            for (var i = 0; i < $scope.items.length; i++) {
              if ($scope.items[i].key == value) {
                displayName = $scope.items[i].value;
                break;
              }
            }
          }

          return displayName;
        };
      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }])

  ;
