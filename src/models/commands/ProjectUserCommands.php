<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use models\rights\Roles;
use models\mapper\JsonDecoder;
use models\UserModel;
use models\UserModelWithPassword;

class ProjectUserCommands {
	
	private $_projectModel;
	
	public function __construct($projectModel) {
		$this->_projectModel = $projectModel;
	}

	/**
	 * Added the user represented by the json array equivalent.
	 * { id: ...
	 *   name: ...
	 *   email: ...
	 * }
	 * Only one of the above is set.
	 * If id is set, add the existing user to the project.
	 * If name is set, create a new user and add to the project.
	 * If email is set, create a user, add to the project, and email to invite user to complete sign up.
	 * @param array $params
	 * @param string $currentUserId
	 * @return string
	 */
	public function updateUser($params, $currentUserId = '') {
		$userId = null;
		$user = null;
		// Update or Create?
		if (array_key_exists('id', $params)) {
			// user exists, so update data
			$userId = $params['id'];
			$user = new UserModel($userId);
			JsonDecoder::decode($user, $params);
		} else if (array_key_exists('name', $params)) {
			// No key, so create a new user.
			$user = new UserModel();
			$user->name = $params['name'];
			$user->username = strtolower(str_replace(' ', '.', $user->name));
			$user->role = Roles::USER;
			$user->active = true;
			$userId = $user->write();
				
			// TODO passwords, make 4 digit and return in message to user and email current user. CP 2013-10
			$characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
			$password = '';
			while( strlen($password) < 4 ) {
				$password .= substr($characters, rand() % (strlen($characters)), 1);
			}
			$userWithPassword = new UserModelWithPassword($userId);
			$userWithPassword->setPassword($password);
			$userWithPassword->write();
		} else {
			$info = var_export($params, true);
			throw new \Exception("unsupported data: '$info'");
		}
		// Note, we should have a $user available here
		CodeGuard::checkNullAndThrow($user, '$userModel');
		
		// Add the user to the project
		$role = array_key_exists('role', $params) ? $params['role'] : Roles::USER;
		$this->_projectModel->addUser($user->id->asString(), $role);
		$user->addProject($this->_projectModel->id->asString());
		$this->_projectModel->write();
		ActivityCommands::addUserToProject($this->_projectModel, $userId);
		
		$userId = $user->write();
		return $userId;
	}

}


?>