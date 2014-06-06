<?php

namespace models\scriptureforge\dto;

use models\scriptureforge\SfchecksProjectModel;
use libraries\shared\Website;

use models\mapper\JsonEncoder;
use models\shared\dto\RightsHelper;
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
		$projectModel = new SfchecksProjectModel($projectId);

		$list = $projectModel->listUsers();
		// remove unvalidated entries, e.g. unvalidated "Invite a friend"
		foreach ($list->entries as $key => $entry) {
			if (!array_key_exists('username', $entry) || !$entry['username']) {
				unset($list->entries[$key]);
			}
		}
		
		$data = array();
		$data['themeNames'] = Website::getProjectThemeNamesForSite(Website::SCRIPTUREFORGE);
		$data['count'] = count($list->entries);
		$data['entries'] = array_values($list->entries);	// re-index array
		$data['project'] = JsonEncoder::encode($projectModel);
		unset($data['project']['users']);
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['bcs'] = BreadCrumbHelper::encode('settings', $projectModel, null, null);
		return $data;
	}
}

?>
