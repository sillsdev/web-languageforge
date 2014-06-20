<?php

namespace models\commands;

use models\shared\rights\SiteRoles;
use models\ProjectModel;
use models\UserModel;
use libraries\shared\Website;

/*
use models\shared\rights\SiteRoles;

use libraries\scriptureforge\sfchecks\Communicate;
use libraries\scriptureforge\sfchecks\Email;
use libraries\scriptureforge\sfchecks\IDelivery;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use libraries\shared\palaso\CodeGuard;
use libraries\shared\palaso\JsonRpcServer;
use libraries\shared\palaso\exceptions\UserNotAuthenticatedException;
use libraries\shared\Website;
use models\commands\ActivityCommands;
use models\commands\ProjectCommands;
use models\commands\QuestionCommands;
use models\commands\TextCommands;
use models\commands\UserCommands;
use models\scriptureforge\dto\ProjectSettingsDto;
use models\shared\dto\ActivityListDto;
use models\shared\dto\CreateSimpleDto;
use models\shared\dto\RightsHelper;
use models\shared\dto\UserProfileDto;
use models\sms\SmsSettings;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\mapper\MongoStore;
use models\shared\rights\Domain;
use models\shared\rights\Operation;

use models\shared\rights\ProjectRoles;
use models\AnswerModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionModel;
use models\UnreadMessageModel;
use models\UserModel;
use models\UserModelWithPassword;
use models\UserProfileModel;
*/

class SessionCommands {
	
	/**
	 * @param string $userId
	 * @param string $projectId
	 * @return array
	 */
	public static function getSessionData($projectId, $userId) {
		$sessionData = array();
		$sessionData['userId'] = (string)$userId;
		$sessionData['projectId'] = (string)$projectId;
		$site = Website::getSiteName();
		$sessionData['site'] = $site;

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