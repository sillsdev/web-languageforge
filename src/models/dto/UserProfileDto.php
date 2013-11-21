<?php

namespace models\dto;

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
		$dto['profile'] = $userProfile;

		return $dto;
	}
}

?>
