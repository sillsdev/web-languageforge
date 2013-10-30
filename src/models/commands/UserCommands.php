<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use libraries\sfchecks\IDelivery;
use libraries\sfchecks\Communicate;
use models\mapper\JsonDecoder;
use models\UserModel;
use models\ProjectModel;

class UserCommands
{
	
	/**
	 * @param array $userIds
	 * @return int Total number of users removed.
	 */
	public static function deleteUsers($userIds) {
		CodeGuard::checkTypeAndThrow($userIds, 'array');
		$count = 0;
		foreach ($userIds as $userId) {
 			CodeGuard::checkTypeAndThrow($userId, 'string');
			$userModel = new \models\UserModel($userId);
			$userModel->remove();
			$count++;
		}
		return $count;
	}
	
	public static function register($params, $captcha_info, $projectCode, IDelivery $delivery = null) {
		if (strtolower($captcha_info['code']) != strtolower($params['captcha'])) {
			return false;  // captcha does not match
		}
		$user = new \models\UserModelWithPassword();
		JsonDecoder::decode($user, $params);
		if (UserModel::userNameExists($user->username)) {
			return false;
		}
		Communicate::sendSignup($user, $delivery);
		
		$user->encryptPassword();
		$user->active = false;
		$user->role = "user";

		// if signup from project page then add user to project
		if ($projectCode != '') {
			$project = ProjectModel::createFromDomain($projectCode);
			if ($project->projectCode == $projectCode) {
				$project->addUser($user->id->asString(), $user->role);
				$user->addProject($project->id->asString());
				$project->write();
			}
		}
		
		return $user->write();
	}
	
}

?>