<?php

namespace models\commands;

use models\shared\rights\SiteRoles;
use models\ProjectModel;
use models\UserModel;
use libraries\shared\Website;


class SessionCommands {
	
	/**
	 * @param string $userId
	 * @param string $projectId
	 * @param Website
	 * @return array
	 */
	public static function getSessionData($projectId, $userId, $website) {
		$sessionData = array();
		$sessionData['userId'] = (string)$userId;
		$sessionData['projectId'] = (string)$projectId;
		$sessionData['baseSite'] = $website->base;

		// Rights
		$user = new UserModel($userId);
		$role = $user->role;
		if (empty($role)) {
			$role = SiteRoles::USER;
		}
		$sessionData['userSiteRights'] = SiteRoles::getRightsArray($role);

		if ($projectId) {
			$project = ProjectModel::getById($projectId);
			$sessionData['userProjectRights'] = $project->getRightsArray($userId);
			$sessionData['projectSettings'] = $project->getPublicSettings();
		}

		// File Size
		$postMax = self::fromValueWithSuffix(ini_get("post_max_size"));
		$uploadMax = self::fromValueWithSuffix(ini_get("upload_max_filesize"));
		$fileSizeMax = min(array($postMax, $uploadMax));
		$sessionData['fileSizeMax'] = $fileSizeMax;

		//return JsonEncoder::encode($sessionData);  // This is handled elsewhere
		return $sessionData;
	}

	/**
	 * Convert a human-readable size value (5M, 1G) into bytes
	 * @param string $val
	 * @return int
	 */
	private static function fromValueWithSuffix($val) {
		$val = trim($val);
		$result = (int)$val;
		$last = strtolower($val[strlen($val)-1]);
		switch($last) {
			// The 'G' modifier is available since PHP 5.1.0
			case 'g':
				$result *= 1024;
			case 'm':
				$result *= 1024;
			case 'k':
				$result *= 1024;
		}

		return $result;
	}

}

?>