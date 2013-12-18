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
		// TODO Review. Simplification of this DTO Ok? IJH 2013-12
		$userProfileModel = new UserProfileModel($userId);
		return UserProfileEncoder::encode($userProfileModel);
	}
}

?>
