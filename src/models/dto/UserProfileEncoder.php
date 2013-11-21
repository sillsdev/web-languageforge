<?php

namespace models\dto;

use models\UserModel;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use libraries\palaso\CodeGuard;

class UserProfileEncoder extends JsonEncoder {
	
	/**
	 * @param string $key
	 * @param ReferenceList $model
	 * @return array
	 */
	public function encodeReferenceList($key, $model) {
		if ($key != 'projects') {
			return parent::encodeReferenceList($key, $model);
		}
		$result = array_map(
				function($id) {
					CodeGuard::checkTypeAndThrow($id, 'models\mapper\Id');
					$projectModel = new ProjectModel($id->asString());
					$projectDto = array();
					$projectDto['name'] = $projectModel->projectname;
					$projectDto['userProperties'] = self::encode($projectModel->userProperties);
					return $projectDto;
				},
				$model->refs
		);
		return $result;
	}
	
	public static function encode($model) {
		$e = new UserProfileEncoder();
		return $e->_encode($model);
	}
}

?>