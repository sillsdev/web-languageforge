'use strict';


// TODO This is currently not used.  The module is really defined in controller.js for now CP 2013-07

// Declare app level module which depends on filters, and services
angular.module('sfAdmin', ['sfAdmin.filters', 'sfAdmin.services', 'sfAdmin.directives', 'sfAdmin.controllers', 'ui.bootstrap']);
/*
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
*/