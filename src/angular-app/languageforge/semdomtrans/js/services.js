'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.editorDto = function editorDto(callback) {
        jsonRpc.call('semdom_editor_dto', [], function(result) {
          callback(result);
        });
  };
        
    this.updateTerm = function updateTerm(term, callback) {
    	jsonRpc.call('semdom_item_update', [term], function(result) {
    		callback(result);
    	});
    };
    
    this.updateComment = function updateComment(comment, callback) {
    	jsonRpc.call('semdom_comment_update', [comment], function(result) {
    		callback(result);
    	});
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
    
    this.createProject = function createProject(projectName, projectCode, languageIsoCode, sourceXMLPath, callback) {
    	jsonRpc.call('semdom_create_project', [projectName, projectCode, languageIsoCode, sourceXMLPath], function(result) {
            callback(result);
          });
    }
    
    

  }]);
  