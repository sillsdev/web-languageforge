<?php

namespace models\dto;

use models\MessageModel;

use models\UnreadMessageModel;
use models\UnreadActivityModel;

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
			$questionList = $textModel->listQuestionsWithAnswers();
			// Just want count of questions and responses, not whole list
			$entry['questionCount'] = $questionList->count;
			$responseCount = 0; // "Responses" = answers + comments
			foreach ($questionList->entries as $q) {
				foreach ($q['answers'] as $a) {
					$commentCount = count($a['comments']);
					$responseCount += ($commentCount+1); // +1 for this answer
				}
			}
			$entry['responseCount'] = $responseCount;

			$data['texts'][] = $entry;
		}
		
		// future support for members
		$data['members'] = array();
		
		// unread activity count
		$unreadActivity = new UnreadActivityModel($userId);
		$unreadItems = $unreadActivity->unreadItems();
		$data['activityUnreadCount'] = count($unreadItems);
		
		// unread broadcast messages
		$unreadMessages = new UnreadMessageModel($userId, $projectId);
		$messageIds = $unreadMessages->unreadItems();
		$messages = array();
		foreach ($messageIds as $messageId) {
			$message = new MessageModel($projectModel, $messageId);
			$messages[] = array(
				'id' => $message->id->asString(),
				'subject' => $message->subject,
				'content' => $message->content
			);
		}
		$data['broadcastMessages'] =  $messages;
		
		return $data;
	}
}

?>
