'use strict';

angular.module('semdomtrans.services', ['jsonRpc'])
  .service('semdomtransService', ['jsonRpc',
  function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    
    this.editorDto = function(callback) {
    	// jsonRpc.call('semdom_editor_dto', [], callback);
    	var result = {ok: true, data:[]};
    	result.data = {terms: [], questions: [], config: {}};
    	result.data = [
	                 {
	                   'key': '1.1',
	                   'source': 'Planet',
	                  'translation': 'Planeta',
	                  'comments': 'This translation may not be true in every context'
	                 },
	                 {
	                  'key': '1.2',
	                  'source': 'Earth',
	                  'translation': '',
	                  'comments': 'Please double check'
	                 },
	                 {
                	  'key': '1.3',
	                  'source': 'Moon',
	                  'translation': '',
	                  'comments': ''
	                 }
	                  
	               ];
    	callback(result);
    }; 
    
    this.updateTerm = function(term, callback) {
    	// don't do anything
    	var result = {ok: true};
    	callback(result);
    };

  }])
  ;
