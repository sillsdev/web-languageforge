angular.module('palaso.ui.dc.example', ['palaso.ui.dc.fieldrepeat'])

// Palaso UI Dictionary Control: Example Sentence
.directive('dcExample', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-example.html',
    scope: {
      config: '=',
      model: '=',
      index: '=',
      remove: '=',
      control: '='
    },
    controller: ['$scope', '$state', function ($scope, $state) {
      $scope.$state = $state;

      angular.forEach($scope.control.config.entry.fields.senses.fields.examples.fields, function (field) {
        field.senseLabel = 'Example ' + ($scope.index + 1);
      });
    }],

    link: function (scope, element, attrs, controller) {
    }
  };
}])

;
