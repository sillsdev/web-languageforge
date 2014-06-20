<?php

namespace models\shared\dto;

use models\UserModel;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use libraries\shared\palaso\CodeGuard;

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
					$projectDto = array();
					try {
						$projectModel = new ProjectModel($id->asString());
						$projectDto['id'] = $id->asString();
						$projectDto['name'] = $projectModel->projectName;
						$projectDto['userProperties'] = self::encode($projectModel->userProperties);
					} catch (\Exception $e) {
						
					}
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