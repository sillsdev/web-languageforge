'use strict';

/* See http://www.benlesh.com/2013/05/angularjs-unit-testing-controllers.html */

describe('Project page (project.js)', function() {
	var scope;
	var rootScope;
	var ctrl;

	var testData = {
		count: 2,
		entries: [
			{title: "Foo", id: "1001", questionCount: 0},
			{title: "Bar", id: "1002", questionCount: 1},
		],
	};

	var testJsonResult = {
		id: 1,
		ok: true,
		status: 200,
		data: testData,
	};

	var mockTextService = {
		list: function(projectId, callback) {
			callback(testJsonResult);
		},
	};
// If we wanted to mock JSON-RPC, we could create another mock object
// like the following. But mocking the Angular service is a better level
// of abstraction.
/*
	var mockJsonRpc = {
		connect: function() {},
		call: function() {},
		apply: function() {},
		func: {apply: function() {}},
	};
*/
	beforeEach(module('sfchecks.project'));

	beforeEach(inject(function($rootScope, $controller) {
		// Keep the root scope around for the test functions to use
		rootScope = $rootScope;

		// Create a fresh scope for each test to use
		scope = $rootScope.$new();

		// Set up the controller with that fresh scope
		ctrl = $controller('ProjectCtrl', {
			$scope: scope,
			textService: mockTextService,
			//jsonRpc: mockJsonRpc,
		});
	}));

	it('should load texts from the text service', function() {
		expect(scope.texts.length).toBe(0);
		scope.queryTexts();
		expect(scope.texts.length).toBe(2);
		expect(scope.texts[0].title).toBe("Foo");
		expect(scope.texts[1].title).toBe("Bar");
	});

	// TODO: Rewrite this with spyOn(func) and expect(func).toHaveBeenCalled() RM 2013-08

});
