<?php
namespace libraries\lfdictionary\dto;

use models\UserModel;
use models\ProjectModel;

class ClientEnvironmentDto {

	/**
	 * @var ProjectModel
	 */
	private $_projectModel;

	/**
	 * @var UserModel
	 */
	private $_userModel;
	
	/**
	 * @param ProjectModel $projectModel
	 * @param UserModel $userModel
	 */
	function __construct($projectModel, $userModel) {
		$this->_projectModel = $projectModel;
		$this->_userModel = $userModel;
	}

	function encode() {
		// TODO Don't think we really need projectDTO and userDTO, we can just use projectAccessDTO maybe CP 2012-11
		$projectDTO = new ProjectDTO($this->_projectModel);
		$project = base64_encode(json_encode($projectDTO->encode()));
		
		$userDTO = new UserDTO($this->_userModel);
		$user = base64_encode(json_encode($userDTO->encode()));
		
		return array(
			'currentProject' => $project,
			'currentUser' => $user,
			'rights' => base64_encode(json_encode(array ("grants"=> $this->_projectModel->getRightsArray($this->_userModel->id->asString())))),
		);
		
	}
}

?>