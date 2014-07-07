<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;

class LexProjectDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$project = new LexiconProjectModel($projectId);
		$projectJson = JsonEncoder::encode($project);

		$data = array();
		$data['project'] = array();
		$data['project']['interfaceLanguageCode'] = $projectJson['interfaceLanguageCode'];
		$data['project']['projectCode'] = $projectJson['projectCode'];
		$data['project']['featured'] = $projectJson['featured'];
		
		return $data;
	}
}

?>
