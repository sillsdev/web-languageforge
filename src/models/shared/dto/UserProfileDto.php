<?php

namespace models\shared\dto;

use models\mapper\JsonEncoder;
use models\UserProfileModel;

class UserProfileDto
{
	/**
	 *
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($userId) {
		$dto = array();
		
		$userProfileModel = new UserProfileModel($userId);
		$userProfile = UserProfileEncoder::encode($userProfileModel);
		$dto['projectsSettings'] = $userProfile['projects'];

		unset($userProfile['projects']);
		$dto['userProfile'] = $userProfile;
		
		return $dto;
	}
}

?>
