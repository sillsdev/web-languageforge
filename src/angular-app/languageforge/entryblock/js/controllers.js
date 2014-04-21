'use strict';

/* Controllers */

angular.module(
	'entryblock.controllers',
	[ 'entryblock.services', 'ui.bootstrap']
)
.controller('EntryBlockCtrl', ['$scope', 'entryBlockService', function UserCtrl($scope, entryBlockService) {

	$scope.record = {};
	$scope.entryData ='';
	$scope.projectid = window.session.param1;
	$scope.entryid = window.session.param2;
	console.log($scope.projectid);
	console.log($scope.entryid);
	$scope.getEntry = function(projectId, entryId) {
		entryBlockService.getEntryById(projectId, entryId, function(result) {
			if (result.ok) {
				$scope.entryData=createWordBlock(result.data);
			} else {
				$scope.entryData='Error when reading entry from server...';
			}
		});
		return true;
	};
	
	$scope.getEntry($scope.projectid,$scope.entryid);
}])
;

function isEmpty(str) {
    return (!str || 0 === str.length);
};
function createWordBlock(entry)
{

	var senseLenght = 0;
	if (entry.hasOwnProperty("senses")){
		 senseLenght = entry['senses'].length;
	}
	if (senseLenght > 1)
	{
		// we have mutiple senses
		for (var i = 0; i < senseLenght; i++) {								
					wordHtml = wordHtml + createBlockHtml(entry,senseLenght,i);
				}
	}else{
			//only one or none
			
		return createBlockHtml(entry,senseLenght,0);
	}
	return wordHtml;
}

function createBlockHtml(entry, senseLenght, senseIndex)
{
		var wordHtml = "";
		if (senseIndex>0)
		{
			wordHtml = '<p class="lpLexEntryPara2">';
		}else
			{
				wordHtml = '<p class="lpLexEntryPara">';
				wordHtml = wordHtml + '<span id="e0" class="lpLexEntryName">' + entry['entry']['th'] +'</span>';
				wordHtml = wordHtml + '<span class="lpSpAfterEntryName">&nbsp;&nbsp;&nbsp;</span>';
			}
			
			if (senseLenght>1)
			{
				wordHtml = wordHtml + '<span class="lpSenseNumber">'+ (senseIndex + 1) +' &nbsp;•&nbsp;</span>';
			}
			
			if (entry.hasOwnProperty("senses") && entry['senses'].length>0){
			var sense = entry['senses'][senseIndex];
			if (sense.hasOwnProperty("POS") && !isEmpty(sense["POS"])){
				 wordHtml = wordHtml + '<span class="lpPartOfSpeech">' + sense["POS"] + '. </span>';
			}
			if (sense.hasOwnProperty("definition") && sense["definition"]){
				var keys = Object.keys(sense["definition"]); 
				wordHtml = wordHtml + '<span class="lpGlossEnglish">' + sense["definition"][keys[0]] + '. </span>';
			}
			if (sense.hasOwnProperty("SemDomValue") && !isEmpty(sense["SemDomValue"])){
				wordHtml = wordHtml + '<span class="lpCategory">' +sense["SemDomValue"] + '</span>';
				wordHtml = wordHtml + '<span class="lpPunctuation">.</span>';
			}
		}
		wordHtml = wordHtml + '</p>';
		return wordHtml;
}