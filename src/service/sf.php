<?php

require_once(APPPATH . 'libraries/Bcrypt.php');

class Sf
{
	
	public function __construct()
	{
		$CI =& get_instance();
		$CI->load->model('User_model');
		$CI->load->model('Password_model');
		$CI->load->model('Project_model');
		$CI->load->library('bcrypt',8); // Might increase this at some future date to increase PW hashing time
		// TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
		ini_set('display_errors', 0);
	}

	/**
	 * Create/Update a User
	 * @param User_model $json
	 * @return string Id of written object
	 */
	public function user_update($params) {
		$user = new User_model();
		Jsonrpc_server::decode($user, $params);
		$result = $user->write();
		return $result;
	}

	/**
	 * Read a user from the given $id
	 * @param string $id
	 */
	public function user_read($id) {
		$user = new User_model($id);
		return $user;
	}
	
	/**
	 * Delete a user record
	 * @param string $id
	 * @return string Id of deleted record
	 */
 	public function user_delete($id) {
 		User_model::remove($id);
		return true;
 	}

	// TODO Pretty sure this is going to want some paging params
	public function user_list() {
		$list = new User_list_model();
		$list->read();
		return $list;
	}
	
	public function user_typeahead($term) {
		$list = new User_typeahead_model($term);
		$list->read();
		return $list;
	}
	
	/**
	 * Create/Update a Project
	 * @param Project_model $json
	 * @return string Id of written object
	 */
	public function project_update($object) {
		$project = new Project_model();
		Jsonrpc_server::decode($project, $object);
		$result = $project->write();
		return $result;
	}

	/**
	 * Read a project from the given $id
	 * @param string $id
	 */
	public function project_read($id) {
		$project = new Project_model($id);
		return $project;
	}
	
	/**
	 * Delete a project record
	 * @param string $id
	 * @return string Id of deleted record
	 */
 	public function project_delete($id) {
 		Project_model::remove($id);
		return true;
 	}

	// TODO Pretty sure this is going to want some paging params
	public function project_list() {
		$list = new Project_list_model();
		$list->read();
		return $list;
	}
	
	public function change_password($userid, $newPassword) {
		$user = new Password_model($userid);
		$bcrypt = new Bcrypt();
		$user->password = $bcrypt->hash($newPassword);
		$user->remember_code = null;
		$user->write();
	}
	
	public function project_readUser($projectId, $userId) {
		throw new Exception("project_readUser NYI");
	}
	
	public function project_updateUser($projectId, $object) {
		$projectModel = new Project_model($projectId);
		$command = new Project_user_commands($projectModel);
		return $command->addUser($object);
	}
	
	public function project_deleteUser($projectId, $userId) {
		// This removes the user from the project.
		$projectModel = new Project_model($projectId);
		$projectModel->removeUser($userId);
		$projectModel->write();
	}
	
	public function project_listUsers($projectId) {
		$projectModel = new Project_model($projectId);
		return $projectModel->listUsers();
	}
	
}