'use strict';

/* Directives */


angular.module('myApp.directives', ["jsonRpc"]).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('userData', ['jsonRpc', function(jsonRpc) {
	  return {
		  templateUrl: "/partials/userdata.html",
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
		  templateUrl: "/partials/userlist.html",
  }});