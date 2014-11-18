'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransEditService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    
    this.editorDto = function(callback) {
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
    		    	'comments': ""})
    		    	
    		     var questionObjects = [];
    		     for (var j = 0; j < questions.length; j++) {
    		    	 questionObjects.push({'question': questions[j], 'translation':'', 'terms':''})
    		     }
    		     
    		     result.data.questions.push({'key': term.abbreviation, 'termQuestions': questionObjects, 'position': 0});
    		  }
    		  i++;
    		  if (i > 100)
    			  break;
    	}    	
    	
    	
    	callback(result);
    }; 
    
    this.updateTerm = function(term, callback) {
    	// don't do anything
    	var result = {ok: true};
    	callback(result);
    };

  }])
  .service('semdomtransConfigService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');

	var config = { showTerms: true, showQuestions: true}
	
    this.getConfigurationData = function(callback) {
		var result = {ok: true, data: config};
    	callback(result);
    }; 
    
    this.saveConfigurationData = function(showTerms, showQuestions) {
		config.showTerms = showTerms;
		config.showQuestions = showQuestions;
    }; 

  }])
  