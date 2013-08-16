<?php

namespace models\dto;

use models\TextModel;

use models\mapper\JsonEncoder;

require_once(APPPATH . 'models/ActivityModel.php');


use models\ProjectList_UserModel;

use models\ActivityListModel;

use models\ProjectListModel;

use models\UserModel;

use models\ProjectModel;

class ActivityListDtoEncoder extends JsonEncoder {
	private $_project;
	
	public function __construct($projectModel) {
		$this->_project = $projectModel;
	}
	public function encodeIdReference($key, $model) {
		if ($key == 'userRef' || $key == 'userRef2') {
			$user = new UserModel();
			if ($user->exists($model->id)) {
				return array(
						'userid' => $user->id->asString(),
						'avatar_ref' => $user->avatar_ref,
						'username' => $user->username);
			} else {
				return '';
			}
		} else if ($key == 'textRef') {
			$text = new TextModel($projectModel)
		} else if ($key == 'questionRef') {
		} else {
			$result = $model->id;
			return $result;
		}
	}
	
	public static function encode($model) {
		$e = new ActivityListDtoEncoder();
		return $e->_encode($model);
	}
}

class ActivityListDto
{
	/**
	 * @param string $projectModel
	 * @param string $questionId
	 * @return array - the DTO array
	 */
	public static function getActivityForProject($projectModel) {
		$activityList = new ActivityListModel($projectModel);
		$activityList->readAsModels();
		$dto = JsonEncoder::encode($activityList);
		return $dto;
		
		// massage dto
		foreach ($dto as &$a) {
			$a['type'] = 'project';
			$a['content'] = $a['actionContent'];
			unset($a['actionContent']);
			$a['projectRef'] = ($a['projectRef']) ? $a['projectRef']->{'$id'} : '';
			$a['textRef'] = ($a['textRef']) ? self::encodeText($a['textRef']->{'$id'}) : '';
			$a['questionRef'] = ($a['questionRef']) ? self::encodeQuestion($a['questionRef']->{'$id'}) : '';
			$a['date'] = ($a['date']) ? $a['date']->sec : 0;
			$a['userRef'] = ($a['userRef']) ? self::encodeUser($a['userRef']->{'$id'}) : '';
			$a['userRef2'] = ($a['userRef2']) ? self::encodeUser($a['userRef2']->{'$id'}) : '';
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
		
	private static function encodeUser($id) {
		// if the user has been deleted, we return empty string
		$user = new UserModel();
		if ($user->exists($id)) {
			$user->read($id);
			return array(
					'id' => $user->id->asString(),
					'username' => $user->username,
					'avatar_ref' => $user->avatar_ref
			);
		} else {
			return '';
		}
	}
	
	private static function encodeText($id) {
		
	}
	
	private static function encodeQuestion($id) {
		
	}
		
}

?>