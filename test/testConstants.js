'use strict';

var constants = function() {
	this.adminUsername   = 'test_runner_admin';
	this.adminPassword   = 'hammertime';
	this.adminName       = 'Test Admin';
	this.adminEmail      = 'test_runner_admin@example.com';
	this.managerUsername = 'test_runner_manager_user';
	this.managerPassword = 'manageruser1';
	this.managerName     = 'Test Manager';
	this.managerEmail    = 'test_runner_manager_user@example.com';
	this.memberUsername  = 'test_runner_normal_user';
	this.memberPassword  = 'normaluser1';
	this.memberName      = 'Test User';
	this.memberEmail     = 'test_runner_normal_user@example.com';
};

module.exports = new constants();
