'use strict';

/* See http://www.benlesh.com/2013/05/angularjs-unit-testing-controllers.html */

describe('Projects page (projects.js)', function() {
	var scope;
	var rootScope;
	var ctrl;

	// Not yet used, but once projects are more closely associated with users we'll need this
	/*
	var testUsers = {
		count: 2,
		entries: [
			{id: "1", name: "James Bond", username: "jamesbond", email: "shakennotstirred@gmail.com"},
			{id: "2", name: "John Carter", username: "jcarter", email: "manofbarsoom@example.com"},
		],
	};
	*/

	var testProjects = {
		count: 2,
		entries: [
			{id: "1001", projectname: "Foo", language: "English", textCount: 0, users: ["1"]},
			{id: "1002", projectname: "Bar", language: "Martian", textCount: 1, users: ["2"]},
		],
	};

	var testJsonResult = {
		id: 1,
		ok: true,
		status: 200,
		data: testProjects,
	};

	var mockProjectService = {
		list: function(callback) {
			callback(testJsonResult);
		},
	};

	beforeEach(module('sfchecks.projects'));

	beforeEach(inject(function($rootScope, $controller) {
		// Keep the root scope around for the test functions to use
		rootScope = $rootScope;

		// Create a fresh scope for each test to use
		scope = $rootScope.$new();

		// Set up the controller with that fresh scope
		ctrl = $controller('ProjectsCtrl', {
			$scope: scope,
			projectService: mockProjectService,
		});
	}));

	it('should load projects from the project service', function() {
		expect(scope.projects.length).toBe(0);
		scope.queryProjectsForUser();
		expect(scope.projects.length).toBe(2);
		expect(scope.projects[0].projectname).toBe("Foo");
		expect(scope.projects[1].projectname).toBe("Bar");
		expect(scope.projects[0].language).toBe("English");
		expect(scope.projects[1].language).toBe("Martian");
	});

	// TODO: Rewrite this with spyOn(func) and expect(func).toHaveBeenCalled() RM 2013-08

});
