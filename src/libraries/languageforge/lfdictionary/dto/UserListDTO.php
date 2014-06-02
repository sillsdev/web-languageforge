<?php
/**
 * This class contains User DTO
 * @author Arivusudar
 */
// TODO. Delete. This is not likely useful.  The Dto should be page focussed, and the ProjectModel + JsonEncoder will help a lot. CP 2013-12

namespace libraries\lfdictionary\dto;

class UserListDTO {

	/**
	 * @var array
	 */
	var $_user;

	function __construct() {
		$this->_user = array();
	}

	function getUsers()
	{
		return $this->_user;
	}
	
	/**
	 * @param User $user
	 */
	function addListUser($user) {
		$this->_user[] = $user;
	}

	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		$users = array();
		foreach ($this->_user as $user) {
			$users[] = $user->encode();
		}
		return array(
			"List" => $users
		);

	}
}
?>