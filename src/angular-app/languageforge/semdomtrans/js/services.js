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
    
	
    this.getSourceLanguages = function(callback) {
    	// replace with php call to get available languages
		var result = {ok:true, data: [
		                              {'id':1, 'name' :'English'}, 
		                              {'id':2, 'name' :'French'},
		                              {'id':3, 'name' :'Thai'},
		                              {'id':4, 'name' :'Chinese'},
		                              {'id':5, 'name' :'Indonesian'}
		                             ]

					  };
		callback(result);
    }; 
    
    this.getTargetLanguages = function(callback) {
    	// replace with php call to get available languages
		var result = {ok:true, data: [
		                              {'id':1, 'name' :'English'}, 
		                              {'id':2, 'name' :'French'},
		                              {'id':3, 'name' :'Thai'},
		                              {'id':4, 'name' :'Chinese'},
		                              {'id':5, 'name' :'Indonesian'}
		                             ]

					};
    	callback(result);
    };
    
    
    this.createProject = function(source, target, creatorID, callback) {
    	callback({ok:true, success: true});
    }
    
    

  }])
  