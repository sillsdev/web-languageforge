angular.module('entryblock.services', [ 'jsonRpc' ])
 .service('entryBlockService', [ 'jsonRpc', function(jsonRpc) {
	this.getEntryById = function(projectid, entryid, callback) {
		jsonRpc.connect('/api/Lf_dictionary?p=' + projectid);
		jsonRpc.call('getEntry', [entryid], callback);
	};
}]);
