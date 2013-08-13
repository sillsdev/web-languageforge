<?php

namespace models\dto;

require_once(APPPATH . 'models/ActivityModel.php');


use models\ProjectList_UserModel;

use models\ActivityListModel;

use models\ProjectListModel;

use models\UserModel;

use models\ProjectModel;


class ActivityListDto
{
	/**
	 * @param string $projectModel
	 * @param string $questionId
	 * @return array - the DTO array
	 */
	public static function getActivityForProject($projectModel) {
		$activityList = new ActivityListModel($projectModel);
		$activityList->read();
		// turn userRefs into userArrays
		return $activityList;
	}
	
	/**
	 * @param string $userId
	 * @return array - the DTO array
	*/
	public static function getActivityForUser($userId) {
		$projectList = new ProjectList_UserModel($userId);
		$dto = array();
		foreach ($projectList->entries as $project) {
			$dto = array_merge($dto, $this::getActivityForProject($project));
		}
		function sortActivity($a, $b) {
			return ($a['date'] > $b['date']) ? 1 : -1;
		}
		uasort($dto, "sortActivity");
		return $dto;
	}
}

?>