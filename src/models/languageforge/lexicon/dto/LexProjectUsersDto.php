<?php

namespace models\languageforge\lexicon\dto;

use models\mapper\JsonEncoder;
use models\shared\dto\RightsHelper;
use models\UserModel;
use models\ProjectModel;
use models\shared\dto\ProjectUsersDto;

class LexProjectUsersDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$userModel = new UserModel($userId);
		$data = LexBaseViewDto::encode($projectId);
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		
		$data = array_merge($data, ProjectUsersDto::encode($projectId, $userId));
		
		return $data;
	}
}

?>
