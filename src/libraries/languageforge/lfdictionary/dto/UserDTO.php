<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains User DTO
 */
// TODO. Delete. This is not likely useful.  The Dto should be page focussed, and the ProjectModel + JsonEncoder will help a lot. CP 2013-12

class UserDTO {

	/**
	 * @var UserModel
	 */
	private $_userModel;
	
	/**
	* @var String
	*/
	private $_userRole;
	/**
	 * @param UserModel $userModel
	 */
	function __construct($userModel) {
		$this->_userModel = $userModel;
	}

	public function getUserId()
	{
		return $this->_userModel->id;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return array
	 */
	function encode() {
		return array(
 			'id' => $this->_userModel->id->asString(),
 			'name' => $this->_userModel->username,
			'role' => $this->_userModel->role
		);

	}
}
?>