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
		$dto = $activityList->entries;
		
		// massage dto
		foreach ($dto as &$a) {
			$a['type'] = 'project';
			$a['content'] = $a['actionContent'];
			unset($a['actionContent']);
			$a['projectRef'] = ($a['projectRef']) ? $a['projectRef']->{'$id'} : '';
			$a['textRef'] = ($a['textRef']) ? $a['textRef']->{'$id'} : '';
			$a['questionRef'] = ($a['questionRef']) ? $a['questionRef']->{'$id'} : '';
			$a['date'] = ($a['date']) ? $a['date']->sec : 0;
			$a['userRef'] = ($a['userRef']) ? self::encodeUser($a['userRef']) : '';
			$a['userRef2'] = ($a['userRef2']) ? self::encodeUser($a['userRef2']) : '';
		}
		return $dto;
	}
	
	/**
	 * @param string $userId
	 * @return array - the DTO array
	*/
	public static function getActivityForUser($userId) {
		$projectList = new ProjectList_UserModel($userId);
		$projectList->read();
		$dto = array();
		foreach ($projectList->entries as $project) {
			$projectModel = new ProjectModel($project['id']);
			$dto = array_merge($dto, self::getActivityForProject($projectModel));
		}
		uasort($dto, array('self', 'sortActivity'));
		return $dto;
	}
	
	private static function sortActivity($a, $b) {
		return ($a['date'] > $b['date']) ? 1 : -1;
	}
		
	private static function encodeUser($userIdRef) {
		$user = new UserModel($userIdRef->{'$id'});
		return array(
				'id' => $user->id->asString(),
				'username' => $user->username,
				'avatar_ref' => $user->avatar_ref
		);
	}
		
}

?>