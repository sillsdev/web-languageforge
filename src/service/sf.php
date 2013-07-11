<?php

use libraries\sf\JsonRpcServer;
use libraries\api\ProjectCommands;
use libraries\api\TextCommands;
use libraries\api\UserCommands;

require_once(APPPATH . 'libraries/Bcrypt.php');

require_once(APPPATH . 'models/UserModel.php');
require_once(APPPATH . 'models/ProjectModel.php');
require_once(APPPATH . 'models/TextModel.php');

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
	 * Delete users
	 * @param array<string> $userIds
	 * @return int Count of deleted users
	 */
 	public function user_delete($userIds) {
 		return UserCommands::deleteUsers($userIds);
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
	 * Delete projects
	 * @param array<string> $projectIds
	 * @return int Count of deleted projects
	 */
 	public function project_delete($projectIds) {
 		return ProjectCommands::deleteProjects($projectIds);
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
	
	public function text_update($projectId, $object) {
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel);
		JsonRpcServer::decode($textModel, $object);
		return $textModel->write();
	}
	
	public function text_read($projectId, $textId) {
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel, $textId);
		return $textModel;
	}
	
	public function text_delete($projectId, $textIds) {
		return TextCommands::deleteTexts($projectId, $textIds);
	}
	
	public function text_list($projectId) {
		$projectModel = new \models\ProjectModel($projectId);
		$textListModel = new \models\TextListModel($projectModel);
		$textListModel->read();
		return $textListModel;
	}
	
}

?>
