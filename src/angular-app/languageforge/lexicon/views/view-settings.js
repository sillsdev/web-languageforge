'use strict';

angular.module('lexicon.view.settings', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate'])
.controller('ViewSettingsCtrl', ['$scope', 'silNoticeService', 'lexProjectService', 'sessionService', '$filter', '$modal', 
                                 function($scope, notice, lexProjectService, ss, $filter, $modal) {
	lexProjectService.setBreadcrumbs('viewSettings', 'View Settings');
	
	$scope.configDirty = angular.copy($scope.projectSettings.config);
	$scope.roleViews = [
		{name: 'Observer', role: 'observer', view: $scope.configDirty.roleViews['observer']},
		{name: 'Commenter', role: 'observer_with_comment', view: $scope.configDirty.roleViews['observer_with_comment']},
		{name: 'Contributor', role: 'contributor', view: $scope.configDirty.roleViews['contributor']},
		{name: 'Project Manager', role: 'project_manager', view: $scope.configDirty.roleViews['project_manager']}
	];
	$scope.fieldConfig = {
		'lexeme': $scope.configDirty.entry.fields['lexeme'],
		'definition': $scope.configDirty.entry.fields.senses.fields['definition'],
		'gloss': $scope.configDirty.entry.fields.senses.fields['gloss'],
		'partOfSpeech': $scope.configDirty.entry.fields.senses.fields['partOfSpeech'],
		'semanticDomain': $scope.configDirty.entry.fields.senses.fields['semanticDomain'],
		'sentence': $scope.configDirty.entry.fields.senses.fields.examples.fields['sentence'],
		'translation': $scope.configDirty.entry.fields.senses.fields.examples.fields['translation']
	};
	
	$scope.isAtLeastOneSense = function(view) {
		return view.showFields['definition'] || view.showFields['gloss'] || 
			view.showFields['partOfSpeech'] || view.showFields['semanticDomain'];
	};
	
	$scope.allRolesHaveAtLeastOneSense = function() {
		var atLeastOne = true;
		angular.forEach($scope.roleViews, function(roleView) {
			atLeastOne = atLeastOne && $scope.isAtLeastOneSense(roleView.view);
		});
		return atLeastOne;
	};
	
	$scope.settingsApply = function() {
		lexProjectService.updateConfiguration($scope.configDirty, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $filter('translate')("View settings updated successfully"));
				$scope.viewSettingForm.$setPristine();
				$scope.projectSettings.config = angular.copy($scope.configDirty);
			}
		});
	};

}])
;
