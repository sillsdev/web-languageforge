'use strict';

/* See http://www.benlesh.com/2013/05/angularjs-unit-testing-controllers.html */

describe('controllers', function(){
	var scope;
	var rootScope;
	var ctrl;

	var mockBreadcrumbService = {
		read: function() {
			return "Breadcrumbs in jasmine sauce"; // Silly test value
		}
	}

	beforeEach(module('sfchecks.controllers'));

	beforeEach(inject(function($rootScope, $controller /* what else? ... */) {
		// Create a fresh scope for each test to use
		scope = $rootScope.$new();

		// Keep the root scope around for the test functions to use too
		rootScope = $rootScope;

		// Set up the controller with that fresh scope
		// Also, inject any mock services we're going to need
		ctrl = $controller('BreadcrumbCtrl', {
			$scope: scope,
			breadcrumbService: mockBreadcrumbService
		});
	}));

	it('should have a breadcrumb after $routeChangeSuccess', function() {
		// Broadcast a fake event for the service to react to
		rootScope.$broadcast("$routeChangeSuccess", {angularEvent: {}, current: "/", previous: undefined});

		expect(scope.breadcrumbs).toBe("Breadcrumbs in jasmine sauce");
	});

	/*it('should ....', inject(function() {
		//spec body
	}));*/
});
