<?php

namespace models\commands;

use models\UserModel;
use models\rights\Roles;
use libraries\palaso\CodeGuard;

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
	public function updateUser($params, $currentUserId) {
		$userId = null;
		$userModel = null;
		// 1) Check the user
		if (array_key_exists('id', $params)) {
			// TODO Check user exists? CP 2013-07
			$userId = $params['id'];
			$userModel = new UserModel($userId);
		} else if (array_key_exists('email', $params)) {
			throw new \Exception("Project_user_commands::addUser with email NYI");
			// TODO Create a user model
		} else if (array_key_exists('name', $params)) {
			// No key, so create a new user.
			$user = new \models\UserModel();
			$user->name = $params['name'];
			$user->username = strtolower(str_replace(' ', '.', $user->name));
			$user->role = Roles::USER;
			$user->active = true;
			// TODO passwords, make 4 digit and return in message to user and email current user. CP 2013-10
			$userId = $user->write();
		} else {
			$info = var_export($params);
			throw new \Exception("unsupported data '$params'");
		}
		// Note, we should have a $userModel available here
		// CodeGuard::checkNullAndThrow($userModel, '$userModel'); // TODO un-comment for final IJH 2013-10
		
		// Add user to project
		
		// Write the project and the user models
		
		// Add the user to the project.
		// 2) Check the role
		$role = key_exists('role', $params) ? $params['role'] : Roles::USER;
		LinkCommands::LinkUserAndProject($this->_projectModel, new \models\UserModel($userId), $role);
		ActivityCommands::addUserToProject($this->_projectModel, $userId);
		return $userId;
	}

	public function removeUsers($userIds) {
		foreach ($userIds as $userId) {
			$userModel = new UserModel($userId);
			LinkCommands::UnlinkUserAndProject($this->_projectModel, $userModel);
			$this->_projectModel->removeUser($userId);
			$this->_projectModel->write();
		}
	}
	
}


?>