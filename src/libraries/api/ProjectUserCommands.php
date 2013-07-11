<?php

namespace libraries\api;

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
	public function addUser($object) {
		$userId = null;
		if (array_key_exists('id', $object)) {
			// TODO Check user exists? CP 2013-07
			$userId = $object['id'];
		} else if (array_key_exists('email', $object)) {
			throw new \Exception("Project_user_commands::addUser with email NYI");
		} else if (array_key_exists('name', $object)) {
			// No key, so create a new user.
			$user = new \models\UserModel();
			$user->name = $object['name'];
			// TODO passwords, how to notify, email? CP 2013-07
			$userId = $user->write();
		} else {
			throw new Exception("Project_user_commands::addUser with unsupported data");
		}
		// Add the user to the project.
		assert($userId != null);
		LinkCommands::LinkUserAndProject($this->_projectModel->id, $userId);
		return $userId;
	}
	
	public function deleteProject() {
		throw new \Exception("Project_user_commands::deleteProject NYI");
	}
}


?>