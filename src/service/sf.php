<?php

class Sf
{
	
	public function __construct()
	{
		$CI =& get_instance();
		$CI->load->model('User_model');
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
		$user = new User_model();
		$user->remove($id);
		return $id;
 	}

	// TODO Pretty sure this is going to want some paging params
	public function user_list() {
		$list = new User_list_model();
		$list->read();
		return $list;
	}
	
}