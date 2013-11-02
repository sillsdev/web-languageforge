<?php

namespace models\commands;


use libraries\palaso\CodeGuard;
use libraries\sfchecks\IDelivery;
use libraries\sfchecks\Communicate;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\UserModel;
use models\ProjectModel;
use models\UserModelWithPassword;
use models\rights\Roles;

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
	
	/**
	 * Register a new user, add to project if in context
	 * @param array $params
	 * @param string $captcha_info
	 * @param string $projectCode
	 * @param IDelivery $delivery
	 * @throws \Exception
	 * @return string $userId
	 */
	public static function register($params, $captcha_info, $projectCode, IDelivery $delivery = null) {
		if (strtolower($captcha_info['code']) != strtolower($params['captcha'])) {
			return false;  // captcha does not match
		}

		$user = new UserModel();
		JsonDecoder::decode($user, $params);
		if (UserModel::userNameExists($user->username)) {
			return false;
		}
		$user->active = false;
		$user->role = Roles::USER;
		if (!$user->emailPending) {
			if (!$user->email) {
				throw new \Exception("");
			}
			$user->emailPending = $user->email;
			$user->email = '';
		}
		$id = $user->write();

		// Write the password
		$userPassword = new UserModelWithPassword($id);
		$userPassword->setPassword($params['password']);
		$userPassword->write();

		// if signup from project page then add user to project
		if ($projectCode) {
			$project = ProjectModel::createFromDomain($projectCode);
			if (!$project) {
				error_log("Error: Could not create project from project code '$projectCode'");
			} else {
				$project->addUser($user->id->asString(), $user->role);
				$user->addProject($project->id->asString());
				$project->write();
				$user->write();
			}
		}

		// TODO Choose between two emails.  One for project signup, one for general signup. CP 2013-10
		Communicate::sendSignup($user, $delivery);
		
		return $id;
	}
	
	
    /**
    *
       * @param UserModel $inviterUser
    * @param string $toEmail
    * @param string $projectId
       * @param string $hostName
    * @param IDelivery $delivery
    * @return string $userId
    */
       public static function sendInvite($inviterUser, $toEmail, $projectId, $hostName, IDelivery $delivery = null) {
		$newUser = new UserModel();
		$project = null;
		if ($projectId) {
			$project = new ProjectModel($projectId);
		} else {
				$project = ProjectModel::createFromDomain($hostName);
		}
		if ($project) {
			$newUser->emailPending = $toEmail;
			$newUser->addProject($project->id->asString());
			$userId = $newUser->write();
			$project->addUser($userId, Roles::USER);
			$project->write();
			Communicate::sendInvite($inviterUser, $newUser, $project, $delivery);
			return $userId;
		} else {
				$projectCode = ProjectModel::domainToProjectCode($hostName);
			if ($projectCode == 'scriptureforge') {
				throw new \Exception("Sending an invitation without a project context is not supported.");
			} else {
				throw new \Exception("Cannot send invitation for unknown project '$projectCode'");
			}
		}
    }
    
    /**
     * 
     * @param string $validationKey
     * @return array
     */
	public static function readForRegistration($validationKey) {
		$user = new \models\UserModelBase();
		if (!$user->readByProperty('validationKey', $validationKey)) {
			return array();
		}
		if (!$user->validate(false)) {
			throw new \Exception("Sorry, your registration link has expired.");
		}
		return JsonEncoder::encode($user);
	}
       
	/**
	* 
	* @param string $validationKey
	* @param array $params
	*/
	public static function updateFromRegistration($validationKey, $params) {
		$user = new \models\UserModelWithPassword();
		if ($user->readByProperty('validationKey', $validationKey)) {
			if ($user->validate()) {
				$params['id'] = $user->id->asString();
				JsonDecoder::decode($user, $params);
				$user->setPassword($params['password']);
				$user->validate();
				$user->active = true;
				return $user->write();
			} else {
				throw new \Exception("Sorry, your registration link has expired.");
			}
		}
    }
}

?>