<?php

namespace models\dto;



use models\ActivityListModel;

use models\ProjectListModel;

use models\UserModel;

use models\ProjectModel;


class ActivityListDto
{
	/**
	 * @param string $projectId
	 * @param string $questionId
	 * @return array - the DTO array
	 */
	public static function getActivityForProject($projectId) {
		$projectModel = new ProjectModel($projectId);
		$activityList = new ActivityListModel($projectModel);
		return DtoEncoder::encode($activityList);
	}
	
	public static function getActivityForUser($userId) {
		/*
		$user = new UserModel($userId);
		$projectList = $user->listProjects();
		*/
		$projectList = new ProjectListModel();
		$dto = array();
		foreach ($projectList->entries as $project) {
			$projectId = $project->id->asString();	
			$dto = array_merge($dto, $this::getActivityForProject($projectId));
		}
		return $dto;
	}
}

?>