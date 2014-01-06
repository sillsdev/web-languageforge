<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use libraries\sfchecks\IDelivery;
use libraries\sfchecks\Communicate;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\ProjectModel;
use models\UserModel;
use models\UserModelWithPassword;
use models\rights\Roles;
use models\dto\CreateSimpleDto;

class UserCommands
{
	
	/**
	 * 
	 * @param string $id
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return array
	 */
	public static function readUser($id, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$user = new UserModel($id);
		return JsonEncoder::encode($user);
	}
	/**
	 * User Create/Update
	 * @param array $params - user model fields to update
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function updateUser($params, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$user = new UserModel();
		if ($params['id']) {
			$user->read($params['id']);
		}
		JsonDecoder::decode($user, $params);
		$result = $user->write();
		return $result;
	}
	
	/**
	 * User Profile Create/Update
	 * @param array $params - user model fields to update
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function updateUserProfile($params, $authUserId) {
		// TODO: validate $userId as authorized to perform this action
		$user = new UserProfileModel();
		if ($params['id']) {
			$user->read($params['id']);
		}
		
		// don't allow the following keys to be persisted
		if (array_key_exists('projects', $params)) {
			unset($params['projects']);
		}
		if (array_key_exists('role', $params)) {
					unset($params['role']);
		}
		JsonDecoder::decode($user, $params);
		$result = $user->write();
		return $result;
		
	}
	

	/**
	 * @param array $userIds
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return int Total number of users removed.
	 */
	public static function deleteUsers($userIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
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
	 * 
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return \models\UserListModel
	 */
	public static function listUsers($authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$list = new \models\UserListModel();
		$list->read();
		return $list;
	}
	
	/**
	 * 
	 * @param string $term
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return \models\UserTypeaheadModel
	 */
	public static function userTypeaheadList($term, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$list = new \models\UserTypeaheadModel($term);
		$list->read();
		return $list;
	}
	
	/**
	 * 
	 * @param string $userId
	 * @param string $newPassword
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @throws \Exception
	 */
	public static function changePassword($userId, $newPassword, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		if (!is_string($userId) && !is_string($newPassword)) {
			throw new \Exception("Invalid args\n" . var_export($userId, true) . "\n" . var_export($newPassword, true));
		}
		$user = new \models\PasswordModel($userId);
		$user->changePassword($newPassword);
		$user->write();
	}
	
	/**
	 * 
	 * @param string $params
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return boolean|string
	 */
	public static function createUser($params, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$user = new \models\UserModelWithPassword();
		JsonDecoder::decode($user, $params);
		if (UserModel::userNameExists($user->username)) {
			return false;
		}
		$user->setPassword($params['password']);
		return $user->write();
	}
	

	/**
	 * Create a user with only username, add user to project if in context, creating user gets email of new user credentials
	 * @param string $userName
	 * @param string $projectId
	 * @param string $currentUserId
	 * @return CreateSimpleDto
	 */
	public static function createSimple($userName, $projectId = '', $currentUserId = '') {
		// TODO: validate $authUserId as authorized to perform this action
		$user = new UserModel();
		$user->name = $userName;
		$user->username = strtolower(str_replace(' ', '.', $user->name));
		$user->role = Roles::USER;
		$user->active = true;
		$userId = $user->write();
		
		// Make 4 digit password
		$characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
		$password = '';
		while (strlen($password) < 4) {
			$password .= substr($characters, rand() % (strlen($characters)), 1);
		}
		$userWithPassword = new UserModelWithPassword($userId);
		$userWithPassword->setPassword($password);
		$userWithPassword->write();
		
		if ($projectId) {
			ProjectCommands::updateUserRole($projectId, array('id' => $userId), $currentUserId);
			
			if ($currentUserId) {
				$toUser = new UserModel($currentUserId);
				$project = new ProjectModel($projectId);
				Communicate::sendNewUserInProject($toUser, $user->username, $password, $project);
			}
		}
		
		$dto = new CreateSimpleDto($userId, $password);
		return $dto->encode();
	}
	
	/**
	 * Register a new user, add to project if in context
	 * @param array $params
	 * @param string $captcha_info
	 * @param string $httpHost
	 * @param IDelivery $delivery
	 * @throws \Exception
	 * @return string $userId
	 */
	public static function register($params, $captcha_info, $httpHost, IDelivery $delivery = null) {
		if (strtolower($captcha_info['code']) != strtolower($params['captcha'])) {
			return false;  // captcha does not match
		}
		
		$projectCode = ProjectModel::domainToProjectCode($httpHost);

		$user = new UserModel();
		JsonDecoder::decode($user, $params);
		if (UserModel::userNameExists($user->username)) {
			return false;
		}
		$user->active = false;
		$user->role = Roles::USER;
		if (!$user->emailPending) {
			if (!$user->email) {
				throw new \Exception("Error: no email set for user signup.");
			}
			$user->emailPending = $user->email;
			$user->email = '';
		}
		$userId = $user->write();

		// Write the password
		$userPassword = new UserModelWithPassword($userId);
		$userPassword->setPassword($params['password']);
		$userPassword->write();

		// if signup from project page then add user to project
		$project = null;
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

		Communicate::sendSignup($user, $project, $delivery);
		
		return $userId;
	}
	
	public static function getCaptchaSrc($controller) {
		$controller->load->library('captcha');
		$captcha_config = array(
			'png_backgrounds' => array(APPPATH . 'images/captcha/captcha_bg.png'),
			'fonts' => array(FCPATH.'/images/captcha/times_new_yorker.ttf'),
			'characters' => 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',
		);
		$captcha_info = $controller->captcha->main($captcha_config);
		$controller->session->set_userdata('captcha_info', $captcha_info);
		return $captcha_info['image_src'];
	}
	
	
    /**
    * Sends an email to invite emailee to join the project
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