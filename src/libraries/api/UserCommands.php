<?php

namespace libraries\api;

class UserCommands
{
	
	/**
	 * @param array $userIds
	 * @return int Total number of users removed.
	 */
	public static function deleteUsers($userIds) {
		$count = 0;
		foreach ($userIds as $userId) {
			\models\UserModel::remove($userId);
			$count++;
		}
		return $count;
	}
	
}

?>