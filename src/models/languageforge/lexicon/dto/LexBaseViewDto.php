<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\dto\RightsHelper;
use models\ProjectModel;
use models\UserProfileModel;

class LexBaseViewDto {
	
	/**
	 * @param string $projectId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$user = new UserProfileModel($userId);
		$project = new LexiconProjectModel($projectId);

		$config = JsonEncoder::encode($project->config);
		$config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		
		$interfaceLanguageCode = $project->interfaceLanguageCode;
		if (key_exists($projectId, $user->projectsProperties) && $user->projectsProperties[$projectId]->interfaceLanguageCode) {
			$interfaceLanguageCode = $user->projectsProperties[$projectId]->interfaceLanguageCode;
		}
		
		$data = array();
		$data['config'] = $config;
		$data['user'] = array('interfaceLanguageCode' => $interfaceLanguageCode);
		$data['project'] = array('projectname' => $project->projectname);
		$data['rights'] = RightsHelper::encode($user, $project);
		
		return $data;
	}
}

?>
