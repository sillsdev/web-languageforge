<?php

use models\UserModelBase;

use models\UserModel;

require_once 'base.php';

class Validate extends Base {

	public function check($validateKeySubmitted = '') {
		$data = array();
		$data['title'] = "Scripture Forge";
		$data['is_static_page'] = true;
		
		$userActivated = false;
		$userModel = new UserModelBase();
		if ($userModel->readByProperty('validationKey', $validateKeySubmitted)) {
			if ($userModel->validate()) {
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