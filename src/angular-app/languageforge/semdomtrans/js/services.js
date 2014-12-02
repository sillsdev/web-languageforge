'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    
    this.editorDto = function(source, target, callback) {
    	// jsonRpc.call('semdom_editor_dto', [], callback);
    	var result = {ok: true, data:[]};
    	result.data = {terms: [], questions: [], config: {}};
    	var i = 0;
    	for (var key in semanticDomains_en) {
    		  if (semanticDomains_en.hasOwnProperty(key)) {
    			var term = semanticDomains_en[key];
                var questions = semanticDomainQuestions_en[key];
      		  
    		    result.data.terms.push( 
    	 	    {
		    	    'key': term.abbreviation,
    		    	'name': term.name,
    		    	'nameTrans': "",
    		    	'description': term.description,
    		    	'descriptionTrans': "",
    		    	'display': true,
    		    	'comments': ""
	    		});
    		    	
    		     var questionObjects = [];
    		     for (var j = 0; j < questions.length; j++) {
    		    	 questionObjects.push({'question': questions[j], 'translation':'', 'terms':''})
    		     }
    		     
    		     result.data.questions.push({'key': term.abbreviation, 'termQuestions': questionObjects, 'position': 0});
    		  }
    		  i++;
    		  if (i > 500)
    			  break;
    	}    	
    	
    	
    	callback(result);
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
		                              {'id':6, 'language' :'Tibetan'},
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
  