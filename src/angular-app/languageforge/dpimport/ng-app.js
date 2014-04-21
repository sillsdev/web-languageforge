'use strict';

// TODO This is currently not used. The module is really defined in
// controller.js for now CP 2013-07

// Declare app level module which depends on filters, and services
angular.module('dpimport', [ 'lf.services', 'dpimport.directives',
		'dpimport.controllers', 'ui.bootstrap', 'vcRecaptcha',
		'palaso.ui.typeahead' ,'palaso.ui.notice']);