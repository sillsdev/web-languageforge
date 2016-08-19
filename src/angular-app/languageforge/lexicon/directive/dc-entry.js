angular.module('palaso.ui.dc.entry', ['palaso.ui.dc.fieldrepeat', 'palaso.ui.dc.sense',
  'ngAnimate', 'lexicon.services', 'bellows.services'])

  // Palaso UI Dictionary Control: Entry
  .directive('dcEntry', ['lexUtils', 'modalService', function (utils, modal) {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/directive/dc-entry.html',
      scope: {
        config: '=',
        model: '=',
        control: '='
      },
      controller: ['$scope', '$state', function ($scope, $state) {
        $scope.$state = $state;
        $scope.addSense = function () {
          var newSense = {};
          $scope.control.makeValidModelRecursive($scope.config.fields.senses, newSense, 'examples');
          $scope.model.senses.push(newSense);

          // Scroll to the newly added sense to provide UI feedback
          var elem = document.getElementsByClassName('entryItemView')[0];
          $(elem).animate({ scrollTop:elem.scrollHeight }, 1500);
        };

        $scope.deleteSense = function (index) {
          var deletemsg = "Are you sure you want to delete the meaning <b>' " +
            utils.getMeaning($scope.config.fields.senses, $scope.model.senses[index])  + " '</b>";
          modal.showModalSimple('Delete Meaning', deletemsg, 'Cancel', 'Delete Meaning')
            .then(function () {
              $scope.model.senses.splice(index, 1);
            });
        };

      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }])

;
