<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\dto\RightsHelper;
use models\UserModel;
use models\ProjectModel;

class LexBaseViewDto {
	
	/**
	 * @param string $projectId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$user = new UserModel($userId);
		$project = new LexiconProjectModel($projectId);
		
		$config = JsonEncoder::encode($project->config);
		$config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		
		$data = array();
		$data['config'] = $config;
		$data['project'] = array('projectname' => $project->projectname);
		$data['rights'] = RightsHelper::encode($user, $project);
		
		return $data;
	}
}

?>
