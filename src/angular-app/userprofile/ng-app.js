'use strict';

function getAvatarUrl(color, shape) {
	var imgPath = "/images/avatar";
	if (!color || !shape) {
		return imgPath + "/anonymoose.png";
	}
	return imgPath + "/" + color + "-" + shape + "-128x128.png";
}


angular.module('userprofile', ['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.notice'])
.controller('userProfileCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',
		function userProfileCtrl($scope, userService, ss, notice) {
	$scope.user = {};
	$scope.user.avatar_color = '';
	$scope.user.avatar_shape = '';
	$scope.user.avatar_ref = getAvatarUrl('', '');
	
	$scope.$watch('user.avatar_color', function() {
		$scope.user.avatar_ref = getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
	});
	$scope.$watch('user.avatar_shape', function() {
		$scope.user.avatar_ref = getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
	});
	
	var loadUser = function() {
		userService.readProfile(ss.currentUserId(), function(result) {
			if (result.ok) {
				$scope.user = result.data.userProfile;
				$scope.projectsSettings = result.data.projectsSettings;
				console.log(result.data);
				
				// populate the project pickList default values with the userProfile picked values 
				for (var i = 0; i < $scope.projectsSettings.length; i++) {
					var project = $scope.projectsSettings[i];
					for (var pickListId in project.userProperties.userProfilePickLists) {
						if ($scope.user.projectUserProfiles[project.id]) {	// ensure user has profile data
							if ($scope.user.projectUserProfiles[project.id][pickListId])
								$scope.projectsSettings[i].userProperties.userProfilePickLists[pickListId].defaultKey = $scope.user.projectUserProfiles[project.id][pickListId];
						}
					}
				}
			}
		});
	};	
	
	$scope.updateUser = function() {
		// populate the userProfile picked values from the project pickLists
		console.log("updateProfile ", $scope.user);
		for (var i = 0; i < $scope.projectsSettings.length; i++) {
			var project = $scope.projectsSettings[i];
			$scope.user.projectUserProfiles[project.id] = {};
			for (var pickListId in project.userProperties.userProfilePickLists) {
				var pickList = project.userProperties.userProfilePickLists[pickListId];
				$scope.user.projectUserProfiles[project.id][pickListId] = pickList.defaultKey;
			}
		}
		
		userService.updateProfile($scope.user, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "Profile updated successfully");
			}
		});
	};
	
	loadUser(); // load the user data right away
	
	$scope.dropdown = {};
	
	$scope.dropdown.avatarColors = [
		{value:'purple4', label:'Purple'},
		{value:'green', label:'Green'},
		{value:'chocolate4', label:'Chocolate'},
		{value:'turquoise4', label:'Turquoise'},
		{value:'LightSteelBlue4', label:'Steel Blue'},
		{value:'DarkOrange', label:'Dark Orange'},
		{value:'HotPink', label:'Hot Pink'},
		{value:'DodgerBlue', label:'Blue'},
		{value:'plum', label:'Plum'},
		{value:'red', label:'Red'},
		{value:'gold', label:'Gold'},
		{value:'salmon', label:'Salmon'},
		{value:'DarkGoldenrod3', label:'Dark Golden'},
		{value:'chartreuse', label:'Chartreuse'},
		{value:'LightBlue', label:'Light Blue'},
		{value:'LightYellow', label:'Light Yellow'}
	];
	
	$scope.dropdown.avatarShapes = [
		{value:'camel', label:'Camel'},
		{value:'cow', label:'Cow'},
		{value:'dog', label:'Dog'},
		{value:'elephant', label:'Elephant'},
		{value:'frog', label:'Frog'},
		{value:'gorilla', label:'Gorilla'},
		{value:'hippo', label:'Hippo'},
		{value:'horse', label:'Horse'},
		{value:'kangaroo', label:'Kangaroo'},
		{value:'mouse', label:'Mouse'},
		{value:'otter', label:'Otter'},
		{value:'pig', label:'Pig'},
		{value:'rabbit', label:'Rabbit'},
		{value:'rhino', label:'Rhino'},
		{value:'sheep', label:'Sheep'},
		{value:'tortoise', label:'Tortoise'},
	];
	
	$scope.dropdown.bibleVersions = [
		{label:'Amplified'},
		{label:'CEV'},
		{label:'ESV'},
		{label:'KJV'},
		{label:'NIV'},
		{label:'Message'},
		{label:'Other'}
	];
	
	$scope.dropdown.religiousAffiliations = [
		{label:'Protestant'},
		{label:'Catholic'},
		{label:'Other'}
	];
	
	$scope.dropdown.studyGroups = [
		{label:'Study Group #1'},
		{label:'Study Group #2'},
		{label:'Study Group #3'}
	];
	
	$scope.dropdown.feedbackGroups = [
		{label:'Feedback group #1'},
		{label:'Feedback group #2'},
		{label:'Feedback group #3'}
	];
	
	$scope.dropdown.jamaicanTowns = [
		{label:"Above Rocks"},
		{label:"Albert Town"},
		{label:"Alexandria"},
		{label:"Alligator Pond"},
		{label:"Anchovy"},
		{label:"Annotto Bay"},
		{label:"Balaclava"},
		{label:"Bamboo"},
		{label:"Bath"},
		{label:"Bethel Town"},
		{label:"Black River"},
		{label:"Bluefields"},
		{label:"Bog Walk"},
		{label:"Brown's Town"},
		{label:"Buff Bay"},
		{label:"Bull Savanna"},
		{label:"Cambridge"},
		{label:"Cascade"},
		{label:"Cave Valley"},
		{label:"Chapelton"},
		{label:"Sanguinetti"},
		{label:"Christiana"},
		{label:"Claremont"},
		{label:"Clark's Town"},
		{label:"Coleyville"},
		{label:"Constant Spring"},
		{label:"Croft's Hill"},
		{label:"Dalvey"},
		{label:"Darliston"},
		{label:"Discovery Bay (Dry Harbour)"},
		{label:"Duncans"},
		{label:"Easington"},
		{label:"Ewarton"},
		{label:"Falmouth"},
		{label:"Frankfield"},
		{label:"Frome"},
		{label:"Gayle"},
		{label:"Seaford Town"},
		{label:"Golden Grove"},
		{label:"Gordon Town"},
		{label:"Grange Hill"},
		{label:"Green Island"},
		{label:"Guy's Hill"},
		{label:"Hayes"},
		{label:"Highgate"},
		{label:"Hope Bay"},
		{label:"Hopewell"},
		{label:"Islington"},
		{label:"Kellits"},
		{label:"Kingston"},
		{label:"Lacovia"},
		{label:"Linstead"},
		{label:"Lionel Town"},
		{label:"Little London"},
		{label:"Lluidas Vale"},
		{label:"Lucea"},
		{label:"Lucky Hill"},
		{label:"Maggotty"},
		{label:"Malvern"},
		{label:"Manchioneal"},
		{label:"Mandeville"},
		{label:"Maroon Town"},
		{label:"Mavis Bank"},
		{label:"May Pen"},
		{label:"Moneague"},
		{label:"Montego Bay"},
		{label:"Moore Town"},
		{label:"Morant Bay"},
		{label:"Nain"},
		{label:"Negril"},
		{label:"Ocho Rios"},
		{label:"Old Harbour"},
		{label:"Old Harbour Bay"},
		{label:"Oracabessa"},
		{label:"Osbourne Store"},
		{label:"Petersfield"},
		{label:"Point Hill"},
		{label:"Port Antonio"},
		{label:"Port Maria"},
		{label:"Port Royal"},
		{label:"Portmore"},
		{label:"Porus"},
		{label:"Race Course"},
		{label:"Richmond"},
		{label:"Rio Bueno"},
		{label:"Riversdale"},
		{label:"Rocky Point"},
		{label:"Runaway Bay"},
		{label:"Saint Ann's Bay"},
		{label:"Sandy Bay"},
		{label:"Santa Cruz"},
		{label:"Savanna-la-Mar"},
		{label:"Seaforth"},
		{label:"Siloah"},
		{label:"Southfield"},
		{label:"Spanish Town"},
		{label:"Stony Hill"},
		{label:"Trinity Ville"},
		{label:"Ulster Spring"},
		{label:"Wakefield"},
		{label:"White House"},
		{label:"Williamsfield"},
		{label:"Yallahs"}
	];
}])
;
