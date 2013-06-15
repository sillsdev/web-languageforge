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
	 * @param unknown_type $id
	 */
	public function user_read($id) {
		$user = new User_model($id);
		return $user;
	}
	
// 	public function user_delete($id) {
//		
// 	}
	
	public function doSomething($params) {
		
	}
	
}