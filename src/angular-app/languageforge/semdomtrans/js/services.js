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
    
	
    this.getStartedProjects = function(callback) {
    	// replace with php call to get available languages
		var result = {ok:true, data: [
		                              {'id':1, 'language' :'Thai', 'pctComplete': 20}, 
		                              {'id':2, 'language' :'French', 'pctComplete': 30},
		                              {'id':3, 'language' :'Togalo', 'pctComplete': 10 },
		                              {'id':4, 'language' :'Chinese', 'pctComplete': 50},
		                              {'id':5, 'language' :'Indonesian', 'pctComplete': 5}
		                             ]

					  };
		callback(result);
    }; 
    
    this.getUnstartedProject = function(callback) {
    	// replace with php call to get available languages
		var result = {ok:true, data: [
		                              {'id':1, 'language' :'Korean'}, 
		                              {'id':2, 'language' :'Tibetan'},
		                              {'id':3, 'language' :'Persian'},
		                              {'id':4, 'language' :'Incan'},
		                              {'id':5, 'language' :'Arabic'},
		                              {'id':7, 'language' :'Japanese'}
		                             ]

					};
    	callback(result);
    };
    
    
    this.createProject = function(source, target, creatorID, callback) {
    	callback({ok:true, success: true});
    }
    
    this.sendJoinRequest = function(source, target, creatorID, callback) {
    	callback({ok:true, success: true});
    }
    
    

  }])
  