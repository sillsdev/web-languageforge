<?php

namespace models\dto;

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
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);

		$list = $projectModel->listUsers();
		$data = array();
		$data['count'] = $list->count;
		$data['entries'] = $list->entries;
		$data['projectName'] = $projectModel->projectname;
		$data['projectIsFeatured'] = $projectModel->featured;
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['bcs'] = BreadCrumbHelper::encode('settings', $projectModel, null, null);
		return $data;
	}
}

?>
