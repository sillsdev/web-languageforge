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
		  // templateUrl = "",  // Eventually we'll move this out to its own template file
		  restrict: "E",
		  link: function(scope, elem, attrs) {
			  scope.$watch("vars.userid", function(newval, oldval) {
			  //attrs.$observe("userid", function(newval, oldval) {
				  console.log("Watch triggered with oldval '" + oldval + "' and newval '" + newval + "'");
				  if (newval) {
					  get_user_by_id(newval);
				  }
			  });
			  
			  function get_user_by_id(userid) {
				  console.log("Fetching id: " + userid);
				  jsonRpc.connect("/api/sf");
				  jsonRpc.call("user_read", {"id": userid}, function(result) {
					  scope.result = result.data.result;
				  });
			  }
		  },
		  template: '<div class="details">{{vars.userid}}: {{result}}</div>',
	  };
  }]);