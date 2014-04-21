'use strict';

/* Controllers */

angular.module(
	'dpimport.controllers',
	[ 'lf.services', 'ui.bootstrap', 'dpimport.services','vcRecaptcha', 'palaso.ui.typeahead', 'ui.bootstrap']
)
.controller('UserCtrl', ['$scope', 'depotImportService', '$location', 'languageService', 'vcRecaptchaService', 'silNoticeService', function UserCtrl($scope, depotImportService, $location, languageService, vcRecaptchaService, noticeService) {
	$scope.progressstep=0;
	$scope.showprogressbar = false;
	$scope.showbackbtn = false;
	$scope.showgotoprojectbtn = false;
	$scope.hideInput = false;
	$scope.record = {};
	$scope.newprojectid ='';
	$scope.usernameok = true;
	$scope.usernameexist = false;
	$scope.usernameloading = false;
	$scope.record.projectname = '';
	$scope.record.projectlanguagecode = '';
	$scope.record.projectcode = '';
	$scope.record.projectusername = '';
	$scope.record.projectpassword = '';
	
	$scope.backToPrePage= function(){
		window.location.href="/app/dpimport/";
    };

	$scope.gotoProject= function(){
		window.location.href="/gwt/main/" + $scope.newprojectid;
    };
//	noticeService.push(noticeService.ERROR, 'Oh snap! Change a few things up and try submitting again.');
//	noticeService.push(noticeService.SUCCESS, 'Well done! You successfully read this important alert message.');
//	noticeService.push(noticeService.WARN, 'Oh snap! Change a few things up and try submitting again.');
//	noticeService.push(noticeService.INFO, 'Well done! You successfully read this important alert message.');
	$scope.importProject = function(record) {
		noticeService.push(noticeService.INFO, 'Starting Depot Project import...');
		record.captcha_challenge = record.captcha.challenge;
		record.captcha_response = record.captcha.response;
		$scope.record.projectlanguagecode = $scope.language.subtag;
		$scope.hideInput = true;
		depotImportService.depotImport(record, function(result) {
			if (result.ok) {
				
				if (result.data.succeed==true) {
					noticeService.push(noticeService.INFO, 'Project import in progress, please wait...');
					$scope.showprogressbar = true;
					$scope.progressstep=0;
					$scope.inprogerss=true;
					record.projectpassword = '';
					var stateChecker = function(){
				    	depotImportService.depotImportStates(record, function(result) {
				    		if (result.ok) {
				    			
				    			if (result.data.haserror==true)
				    				{
				    					noticeService.push(noticeService.ERROR, 'An error occurred in the import process: ' + result.data.code);
				    					$scope.showbackbtn = true;
				    					return;
				    				}
				    			
					            if (result.data.succeed==true)
				            	{ 	//import finished, so return code will be new project ID, and will redirect
				            		$scope.progressstep=100;
				            		noticeService.push(noticeService.SUCCESS, 'Project import finished!');
				            		$scope.showgotoprojectbtn = true;
				            		$scope.newprojectid = result.data.code;
				            		$scope.showprogressbar = false;
				            		//window.location.href="/gwt/main/" + result.data.code;
				            	}else
				            	{
				            		setTimeout(stateChecker,1000);
				            		$scope.progressstep=parseInt(result.data.code);
				            	}
				    		} else {
				    			$scope.inprogerss=false;
								noticeService.push(noticeService.ERROR, 'An error occurred in the import process: ' + result.data.code);
								$scope.showbackbtn = true;
							}
				    	});
				    
				        };

				     setTimeout(stateChecker,1000);
				} else {
					//$scope.inprogerss=false;
					result.data.haserror =true;
					noticeService.push(noticeService.ERROR, 'An error occurred in the import process: ' + result.data.code);
					vcRecaptchaService.reload();
					$scope.showbackbtn = true;
					return;
				}
				
			} else {
				$scope.inprogerss=false;
				noticeService.push(noticeService.ERROR, 'An error occurred in the import process: ' + result.data.code);
				$scope.showbackbtn = true;
			}
		});
		return true;
	};
	// ----------------------------------------------------------
	// Typeahead for project selection
	// ----------------------------------------------------------
	$scope.languages = [];
	$scope.language = {};
	$scope.typeahead = {};
	$scope.typeahead.langName = '';

	$scope.queryLanguages = function(searchTerm) {
		console.log('Searching for languages matching', searchTerm);
		if (searchTerm.length < 3) {
			return;
		}
		languageService.typeahead(searchTerm, function(result) {
			console.log("languageService.typeahead(", searchTerm, ") returned:");
			console.log(result);
			if (result.ok) {
				$scope.languages = result.data.entries;
				console.log("$scope.languages is now:", $scope.languages);
				//$scope.updateSomethingInTheForm(); // TODO: Figure out what, if anything, needs to be updated when the list comes back. 2013-08 RM
			}
		});
	};

	$scope.selectLanguage = function(item) {
		console.log('selectLanguage called with args:');
		console.log(arguments);
		$scope.language = item;
		$scope.typeahead.langName = item.description[0];
	};

	$scope.languageDescription = function(language) {
		// Format a language description for display
		// Language with just one name (most common case): English
		// Language with two names: Dutch (Flemish)
		// Language with 3+ names: Romanian (Moldavian, Moldovan)
		var desc = language.description;
		var first = desc[0];
		var rest = desc.slice(1).join(', ');
		if (rest) {
			return first + " (" + rest + ")";
		} else {
			return first;
		}
	};

	$scope.deprecationWarning = function(language) {
		if (language.deprecated) {
			return " (Deprecated)";
		} else {
			return "";
		}
	};
}]);


