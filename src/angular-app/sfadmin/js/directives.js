'use strict';

/* Directives */


angular.module('sfAdmin.directives', ["jsonRpc"]).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('userData', ['jsonRpc', function(jsonRpc) {
	  return {
		  templateUrl: "/angular-app/sfadmin/partials/userdata.html",
		  restrict: "E",
		  link: function(scope, elem, attrs) {
			  scope.$watch("vars.record.id", function(newval, oldval) {
			  //attrs.$observe("userid", function(newval, oldval) {
				  console.log("Watch triggered with oldval '" + oldval + "' and newval '" + newval + "'");
				  if (newval) {
					  get_user_by_id(newval);
				  } else {
					  // Clear data table
					  scope.record = {};
				  }
			  });
			  
			  function get_user_by_id(userid) {
				  console.log("Fetching id: " + userid);
				  jsonRpc.connect("/api/sf");
				  jsonRpc.call("user_read", {"id": userid}, function(result) {
					  scope.record = result.data.result;
				  });
			  }
		  },
	  };
  }])
  .directive('userList', function() {
	  return {
		  restrict: "E",
		  templateUrl: "/angular-app/sfadmin/partials/userlist.html",
  }})
  .directive('projectData', ['jsonRpc', function(jsonRpc) {
	  return {
		  templateUrl: "/angular-app/sfadmin/partials/projectdata.html",
		  restrict: "E",
		  link: function(scope, elem, attrs) {
			  scope.$watch("vars.record.id", function(newval, oldval) {
			  //attrs.$observe("userid", function(newval, oldval) {
				  console.log("Watch triggered with oldval '" + oldval + "' and newval '" + newval + "'");
				  if (newval) {
					  get_project_by_id(newval);
				  } else {
					  // Clear data table
					  scope.record = {};
				  }
			  });
			  
			  function get_project_by_id(recordid) {
				  console.log("Fetching id: " + recordid);
				  jsonRpc.connect("/api/sf");
				  jsonRpc.call("project_read", {"id": recordid}, function(result) {
					  scope.record = result.data.result;
				  });
			  }
		  },
	  };
  }])
  .directive('projectList', function() {
	  return {
		  restrict: "E",
		  templateUrl: "/angular-app/sfadmin/partials/projectlist.html",
  }})
// This directive's code is from http://stackoverflow.com/q/16016570/
.directive('ngFocus', function($parse, $timeout) {
	return function(scope, elem, attrs) {
		var ngFocusGet = $parse(attrs.ngFocus);
		var ngFocusSet = ngFocusGet.assign;
		if (!ngFocusSet) {
			throw Error("Non assignable expression");
		}
		console.log("In ng-focus directive, trying to focus with var ", attrs.ngFocus);

		var abortFocusing = false;
		var unwatch = scope.$watch(attrs.ngFocus, function(newVal){
			if(newVal){
				$timeout(function(){
					elem[0].focus();  
				},0);
			}
			else {
				$timeout(function(){
					elem[0].blur();
				},0);
			}
		});


		elem.bind("blur", function(){

			if(abortFocusing) return;

			$timeout(function(){
				ngFocusSet(scope,false);
			},0);

		});


		var timerStarted = false;
		var focusCount = 0;

		function startTimer(){
			$timeout(function(){
				timerStarted = false;
				if(focusCount > 3){
					unwatch();
					abortFocusing = true;
					throw new Error("Aborting : ngFocus cannot be assigned to the same variable with multiple elements");
				}
			},200);
		}

		elem.bind("focus", function(){

			if(abortFocusing) return;

			if(!timerStarted){
				timerStarted = true;
				focusCount = 0;
				startTimer();
			}
			focusCount++;

			$timeout(function(){
				ngFocusSet(scope,true);
			},0);

		});
	};
});
