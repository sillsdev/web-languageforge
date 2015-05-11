"use strict";
angular.module('palaso.ui.sd.questions', ['semdomtrans.services'])
.directive('sdQuestions', function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/semdomtrans/directive/sd-questions.html',
    scope : {
      model : "=",
      state : "@",
      control : "="
    }, 
    controller: ['$scope', function($scope) {
      
      $scope.isInCommentMode = function isInCommentMode() {
        return $scope.state == 'comments';
      }      

      $scope.getPreviousQuestion = function() {
        $scope.control.currentQuestionPos--;
      }
      
      $scope.getNextQuestion = function() {
        $scope.control.currentQuestionPos++;
      }    
      
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
});
