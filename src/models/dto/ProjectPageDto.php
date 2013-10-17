<?php

namespace models\dto;

use models\UnreadMessageModel;

use models\UserModel;

use models\ProjectModel;

use models\TextListModel;

use models\TextModel;


class ProjectPageDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);
		$textList = new TextListModel($projectModel);
		$textList->read();

		$data = array();
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['project'] = array(
				'name' => $projectModel->projectname,
				'id' => $projectId);
		$data['texts'] = array();
		foreach ($textList->entries as $entry) {
			$textModel = new TextModel($projectModel, $entry['id']);
			$questionList = $textModel->listQuestions();
			// Just want question count, not whole list
			$entry['questionCount'] = $questionList->count;

			$data['texts'][] = $entry;
		}
		
		// future support for members
		$data['members'] = array();
		
		// unread activity count
		$unreadActivity = new UnreadActivityModel($userId);
		$unreadItems = $unreadActivity->unreadItems();
		$data['activityUnreadCount'] = count($unreadItems);
		
		$unreadMessages = new UnreadMessageModel($userId, $projectId);
		$messageIds = $unreadMessages->unreadItems();
		$messages = array();
		foreach ($messageIds as $messageId) {
			$message = new ;
			$messages[] = array(
				'id' => $message->id->asString(),
				'message' => $message->content
			);
		}
		$data['broadcastMessages'] = 
		
		

		return $data;
	}
}

?>
