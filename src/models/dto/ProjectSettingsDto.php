<?php

namespace models\dto;

use models\mapper\JsonEncoder;

use models\UserModel;
use models\ProjectModel;

class ProjectSettingsDto
{
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		// TODO: ensure $userId is authorized to access project settings
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);

		$list = $projectModel->listUsers();
		$data = array();
		$data['count'] = $list->count;
		$data['entries'] = $list->entries;
		$data['project'] = JsonEncoder::encode($projectModel);
		unset($data['project']['users']);
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['bcs'] = BreadCrumbHelper::encode('settings', $projectModel, null, null);
		return $data;
	}
}

?>
