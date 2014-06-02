angular.module('dpimport.services', [ 'jsonRpc' ])
 .service('depotImportService', [ 'jsonRpc', function(jsonRpc) {
	this.depotImport = function(model, callback) {
		jsonRpc.connect('/api/Lf_dictionary');
		jsonRpc.call('depot_begin_import', [ model ], callback);
	};
	
	this.depotImportStates = function(model, callback) {
		jsonRpc.connect('/api/Lf_dictionary');
		jsonRpc.call('depot_check_import_states', [model], callback);
	};
}]);
