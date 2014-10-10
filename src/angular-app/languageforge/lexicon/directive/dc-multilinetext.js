'use strict';

angular.module('palaso.ui.dc.multilinetext', ['textAngular'])

// Custom textAngular tool for language spans
.config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {

    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('colourRed', {
      iconclass: "fa fa-square red",
      action: function() {
        this.$editor().wrapSelection('forecolor', 'red');
      }
    });

    // add the button to the default toolbar definition
    taOptions.toolbar[0].push('colourRed');
    return taOptions;
  }]);
})

// Dictionary Control Multi-Line Text Editor
.directive('dcMultilinetext', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-multilinetext.html',
    scope: {
      mltModel: "=",
      mltLanguageName: "=",
      mltAbbreviation: "=",
      mltDisabled: "=",
      mltDir: "="
    },
    controller: ['$scope', function($scope) {

    }]
  };
}]);
