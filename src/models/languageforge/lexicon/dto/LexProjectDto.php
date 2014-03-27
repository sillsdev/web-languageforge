<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\dto\ManageUsersDto;

class LexProjectDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$data = LexBaseViewDto::encode($projectId, $userId);
		
		$project = new LexiconProjectModel($projectId);
		$projectJson = JsonEncoder::encode($project);
		$data['project']['projectCode'] = $projectJson['projectCode'];
		$data['project']['featured'] = $projectJson['featured'];
		
		return $data;
	}
}

?>
