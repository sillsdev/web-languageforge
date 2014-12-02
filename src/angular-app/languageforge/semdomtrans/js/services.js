'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    
    this.editorDto = function(source, target, callback) {
    	// jsonRpc.call('semdom_editor_dto', [], callback);
    	var result = {ok: true, data:[]};
    	result.data = {items: [], config: {}};
    	var i = 0;
    	for (var key in semanticDomains_en) {
    		  if (semanticDomains_en.hasOwnProperty(key)) {

                var questions = semanticDomainQuestions_en[key];
    			 var questionObjects = [];
     		     for (var j = 0; j < questions.length; j++) {
     		    	 var beginTerms = 0;
     		    	 var endTerms = 0;
     		    	 var seenPar = false;
     		    	 
     		    	 for (var l = 0; l < questions[j].length; l++) {
     		    		 if (questions[j].charAt(l) == '(') {
     		    			 seenPar = 0;
     		    			 beginTerms = l + 1;
     		    		 }
     		    		 else if (questions[j].charAt(l) == ')') {
     		    			 endTerms = l;
     		    			 break;
     		    		 }
     		    	 }
     		    	 
     		    	 var questTerms = questions[j].substring(beginTerms, endTerms);
     		    	 questionObjects.push({'question': questions[j].substring(0, beginTerms - 1), 'questTranslation':'', 'terms': questTerms, 'termsTranslation': ""})
     		     }
    			 var term = semanticDomains_en[key];
    			 var searchKeys = [];
    			 for (var j = 0; j < semanticDomains_en[key].searchKeys.length; j++) {
    				 searchKeys.push({
    							 'searchKey': semanticDomains_en[key].searchKeys[j],
    							 'translation': ""
					 });
    			 }
      		  
    		    result.data.items.push( 
    	 	    {
    	 	    	'key': term.abbreviation,
    	 	    	'display': term.abbreviation + " " + term.name,
    		    	'included': true,
    	 	    	'term' : {			    	    
	    		    	'name': term.name,
	    		    	'nameTrans': "",
	    		    	'description': term.description,
	    		    	'descriptionTrans': "",
	    		    	'comments': "",
	    		    	'translated': false,
	    		    	'searchKeys': searchKeys
    	 	    	},
    	 	    	'questions': {
    	 	    		'termQuestions': questionObjects,
    	 	    		'position': 0,
    	 	    		'translated': false
    	 	    	}
    	 	    
	    		});
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
  