<?php

use models\UserModel;

require_once 'base.php';

class Validate extends Base {

	public function check($validateKeySubmitted = '') {
		$data = array();
		$data['title'] = "Scripture Forge";
		$data['is_static_page'] = true;
		
		// Search users for $validateKeySubmitted
		$userActivated = false;
		$userModel = new UserModel();
		if ($userModel->readByProperty('validationKey', $validateKeySubmitted)) {
			// Check validation key hasn't expired
			$validationInterval = $userModel->validationDate->diff(new \DateTime());
			$validationDays = $validationInterval->format('%R%a');
			if ($validationDays >= 0 and $validationDays <= 1) {
				$userModel->active = true;
				$userModel->write();
				$userActivated = true;
			}
		}
		
		if ($userActivated) {
			$data['message'] = "Your account has been successfully activated. Please <a href='http://" . 
				$_SERVER['SERVER_NAME'] . "/auth/login'>login</a> to get started.";
		} else {
			$data['message'] = "Invalid key: sorry your account was not activated.";
		}
		
		$this->_render_page("validate/validate", $data);
	}
}


?>