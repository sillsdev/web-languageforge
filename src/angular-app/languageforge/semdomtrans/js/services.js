'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.editorDto = function editorDto($languageCode, callback) {
        jsonRpc.call('semdom_editor_dto', [$languageCode], function(result) {
          callback(result);
        });
  };
        
    this.updateTerm = function(term, callback) {
    	// don't do anything6
    	var result = {ok: true};
    	callback(result);
    };

  }])
  .service('semdomtransSetupService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    
	
    this.getOpenProjects = function getOpenProjects(callback) {
    	jsonRpc.call('semdom_get_open_projects', [], function(result) {
            callback(result);
          });
    }
    
    this.createProject = function(source, target, creatorID, callback) {
    	callback({ok:true, success: true});
    }
    
    this.sendJoinRequest = function(source, target, creatorID, callback) {
    	callback({ok:true, success: true});
    }
    
    

  }]);
  