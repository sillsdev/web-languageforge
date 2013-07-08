<?php

require_once(APPPATH . 'libraries/Bcrypt.php');

require_once(APPPATH . 'models/UserModel.php');
require_once(APPPATH . 'models/ProjectModel.php');

use libraries\sf\JsonRpcServer;

class Sf
{
	
	public function __construct()
	{
		$CI =& get_instance();
		$CI->load->library('bcrypt',8); // Might increase this at some future date to increase PW hashing time
		// TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
		ini_set('display_errors', 0);
	}

	/**
	 * Create/Update a User
	 * @param UserModel $json
	 * @return string Id of written object
	 */
	public function user_update($params) {
		$user = new \models\UserModel();
		JsonRpcServer::decode($user, $params);
		$result = $user->write();
		return $result;
	}

	/**
	 * Read a user from the given $id
	 * @param string $id
	 */
	public function user_read($id) {
		$user = new \models\UserModel($id);
		return $user;
	}
	
	/**
	 * Delete a user record
	 * @param string $id
	 * @return string Id of deleted record
	 */
 	public function user_delete($id) {
 		\models\UserModel::remove($id);
		return true;
 	}

	// TODO Pretty sure this is going to want some paging params
	public function user_list() {
		$list = new \models\UserListModel();
		$list->read();
		return $list;
	}
	
	public function user_typeahead($term) {
		$list = new \models\UserTypeaheadModel($term);
		$list->read();
		return $list;
	}
	
	/**
	 * Create/Update a Project
	 * @param ProjectModel $json
	 * @return string Id of written object
	 */
	public function project_update($object) {
		$project = new \models\ProjectModel();
		JsonRpcServer::decode($project, $object);
		$result = $project->write();
		return $result;
	}

	/**
	 * Read a project from the given $id
	 * @param string $id
	 */
	public function project_read($id) {
		$project = new \models\ProjectModel($id);
		return $project;
	}
	
	/**
	 * Delete a project record
	 * @param string $id
	 * @return string Id of deleted record
	 */
 	public function project_delete($id) {
 		$project = new \models\ProjectModel($id);
 		$project->remove();
		return true;
 	}

	// TODO Pretty sure this is going to want some paging params
	public function project_list() {
		$list = new \models\ProjectListModel();
		$list->read();
		return $list;
	}
	
	public function change_password($userid, $newPassword) {
		$user = new \models\PasswordModel($userid);
		$bcrypt = new Bcrypt();
		$user->password = $bcrypt->hash($newPassword);
		$user->remember_code = null;
		$user->write();
	}
	
	public function project_readUser($projectId, $userId) {
		throw new \Exception("project_readUser NYI");
	}
	
	public function project_updateUser($projectId, $object) {
		
		$projectModel = new \models\ProjectModel($projectId);
		$command = new \libraries\api\ProjectUserCommands($projectModel);
		return $command->addUser($object);
	}
	
	public function project_deleteUsers($projectId, $userIds) {
		// This removes the user from the project.
		$projectModel = new \models\ProjectModel($projectId);
		foreach ($userIds as $userId) {
			$projectModel->removeUser($userId);
			$projectModel->write();
		}
	}
	
	public function project_listUsers($projectId) {
		$projectModel = new \models\ProjectModel($projectId);
		return $projectModel->listUsers();
	}
	
}