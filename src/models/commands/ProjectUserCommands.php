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
	 * @param array $object
	 * @return string
	 */
	public function updateUser($object) {
		$userId = null;
		// 1) Check the user
		if (array_key_exists('id', $object)) {
			// TODO Check user exists? CP 2013-07
			$userId = $object['id'];
		} else if (array_key_exists('email', $object)) {
			throw new \Exception("Project_user_commands::addUser with email NYI");
		} else if (array_key_exists('name', $object)) {
			// No key, so create a new user.
			$user = new \models\UserModel();
			$user->name = $object['name'];
			$user->username = strtolower(str_replace(' ', '.', $user->name));
			// TODO passwords, how to notify, email? CP 2013-07
			$userId = $user->write();
		} else {
			$info = var_export($object);
			throw new \Exception("unsupported data '$object'");
		}
		// Add the user to the project.
		CodeGuard::checkNullAndThrow($userId, '$userId');
		// 2) Check the role
		$role = key_exists('role', $object) ? $object['role'] : Roles::USER;
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