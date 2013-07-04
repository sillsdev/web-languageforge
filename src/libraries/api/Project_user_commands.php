<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class Project_user_commands {
	
	private $_projectModel;
	
	public function __construct($projectModel) {
		$this->_projectModel = $projectModel;
	}
	
	public function addUser($object) {
		// If we've got a key then try and read existing user.
		
		// No key, so create a new user.
		
		// Add the user to the project.
	}
	
	public function deleteProject() {
		throw new Exception("Project_user_commands::deleteProject NYI");
	}
	
}

?>