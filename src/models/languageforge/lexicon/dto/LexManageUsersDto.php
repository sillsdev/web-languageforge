<?php

namespace models\languageforge\lexicon\dto;

use models\mapper\JsonEncoder;
use models\shared\dto\ManageUsersDto;

class LexManageUsersDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$data = LexBaseViewDto::encode($projectId, $userId);
		$data = array_merge($data, ManageUsersDto::encode($projectId, $userId));
		
		return $data;
	}
}

?>
