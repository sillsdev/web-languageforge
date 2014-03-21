<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;

class LexBaseViewDto {
	
	/**
	 * @param string $projectId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId) {
		$project = new LexiconProjectModel($projectId);
		$config = JsonEncoder::encode($project->settings);
		$config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		
		$data = array();
		$data['config'] = $config;
		$data['project'] = array('projectname' => $project->projectname);
		
		return $data;
	}
}

?>
