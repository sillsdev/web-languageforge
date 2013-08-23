<?php

namespace models\dto;

use models\ProjectModel;
use models\UserModel;
use models\rights\Realm;
use models\rights\Roles;

class RightsHelper
{

	/**
	 * @param UserModel $userModel
	 * @param ProjectModel $projectModel
	 */
	public static function encode($userModel, $projectModel) {
		if ($userModel->role == Roles::SYSTEM_ADMIN) {
			return Roles::getRightsArray(Realm::PROJECT, $userModel->role); 
		} else {
			return $projectModel->getRightsArray($userModel->id->id);
		}
	}
	
}

?>