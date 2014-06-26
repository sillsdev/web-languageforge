<?php

namespace models\shared\dto;

use models\ActivityListModel;
use models\QuestionModel;
use models\TextModel;
use models\UnreadActivityModel;
use models\ProjectList_UserModel;
use models\ProjectListModel;
use models\ProjectModel;
use models\UserModel;
use models\mapper\JsonEncoder;

require_once(APPPATH . 'models/ActivityModel.php');

class ActivityListDtoEncoder extends JsonEncoder {
	private $_project;
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 */
	public function __construct($projectModel) {
		$this->_project = $projectModel;
	}
	public function encodeIdReference($key, $model) {
		if ($key == 'userRef' || $key == 'userRef2') {
			$user = new UserModel();
			if ($user->exists($model->asString())) {
				$user->read($model->asString());
				return array(
						'id' => $user->id->asString(),
						'avatar_ref' => $user->avatar_ref,
						'username' => $user->username);
			} else {
				return '';
			}
		} else if ($key == 'textRef') {
			$text = new TextModel($this->_project);
			if ($text->exists($model->asString())) {
				return $model->asString();
			} else {
				return '';
			}
		} else if ($key == 'questionRef') {
			$question = new QuestionModel($this->_project);
			if ($question->exists($model->asString())) {
				return $model->asString();
			} else {
				return '';
			}
		} else {
			return $model->asString();
		}
	}
	
	/**
	 * 
	 * @param Object $model - the model to encode
	 * @param ProjectModel $projectModel
	 * @return array
	 */
	public static function encodeModel($model, $projectModel) {
		/* Note: I had to change the name of this static method to something else besides 'encode' because
		 * PHP complained about the signature not being the same as the parent class JsonEncoder
		 * cjh 2013-08
		 */
		$e = new ActivityListDtoEncoder($projectModel);
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
		$dto = ActivityListDtoEncoder::encodeModel($activityList, $projectModel);
		self::prepareDto($dto);
		return (is_array($dto['entries'])) ? $dto['entries'] : array();
	}
	
	/**
	 * @param string $site
	 * @param string $userId
	 * @return array - the DTO array
	*/
	public static function getActivityForUser($site, $userId) {
		$projectList = new ProjectList_UserModel($site);
		$projectList->readUserProjects($userId);
		$activity = array();
		foreach ($projectList->entries as $project) {
			$projectModel = new ProjectModel($project['id']);
			$activity = array_merge($activity, self::getActivityForProject($projectModel));
		}
		uasort($activity, array('self', 'sortActivity'));
		$unreadActivity = new UnreadActivityModel($userId);
		$unreadItems = $unreadActivity->unreadItems();
		$unreadActivity->markAllRead();
		$unreadActivity->write();
		$dto = array(
				'activity' => $activity,
				'unread' => $unreadItems
		);
		return $dto;
	}
	
	private static function sortActivity($a, $b) {
		return (new \DateTime($a['date']) < new \DateTime($b['date'])) ? 1 : -1;
	}
	
	private static function prepareDto(&$dto) {
		foreach ($dto['entries'] as &$item) {
			$item['content'] = $item['actionContent'];
			$item['type'] = 'project';
			unset($item['actionContent']);
		}
	}
}

?>