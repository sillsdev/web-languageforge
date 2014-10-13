'use strict';

angular.module('palaso.ui.dc.formattedtext', ['textAngular'])

// Custom textAngular tool for language spans
.config(function($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {

    // $delegate is the taOptions we are decorating
    // register the tool with textAngular
    taRegisterTool('languageSpan', {
      iconclass: 'fa fa-language fa-lg',
      tooltiptext: 'Language span',
      action: function(){
        return this.$editor().wrapSelection("formatBlock", "<SPAN>");
      },
      activeState: function(){ return this.$editor().queryFormatBlockState('span'); }
    });

    // add the button to the default toolbar definition
    taOptions.toolbar[0].push('languageSpan');
    return taOptions;
  }]);
})

// Dictionary Control Formatted Text Editor
.directive('dcFormattedtext', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-formattedtext.html',
    scope: {
      fteModel: "=",
      fteLanguageName: "=",
      fteAbbreviation: "=",
      fteDisabled: "=",
      fteDir: "="
    },
    controller: ['$scope', function($scope) {

    }]
  };
}]);
