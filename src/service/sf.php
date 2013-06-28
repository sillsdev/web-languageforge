<?php

class Sf
{
	
	public function __construct()
	{
		$CI =& get_instance();
		$CI->load->model('User_model');
		$CI->load->model('Project_model');
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
	
	/**
	 * Create/Update a Project
	 * @param Project_model $json
	 * @return string Id of written object
	 */
	public function project_update($params) {
		$project = new Project_model();
		Jsonrpc_server::decode($project, $params);
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
}