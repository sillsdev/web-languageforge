<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
use models\scriptureforge\SfchecksProjectModel;
use models\MessageModel;
use models\ProjectModel;
use models\QuestionModel;
use models\TextListModel;
use models\TextModel;
use models\UnreadActivityModel;
use models\UnreadMessageModel;
use models\UserModel;

class ProjectPageDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$user = new UserModel($userId);
		$project = new SfchecksProjectModel($projectId);
		if ($project->isArchived && $project->users[$userId]->role != ProjectRoles::MANAGER) {
			throw new \Exception("This Project is no longer available.\nIf this is incorrect contact your project manager.\n");
		}
		$textList = new TextListModel($project);
		$textList->read();

		$data = array();
		$data['rights'] = RightsHelper::encode($user, $project);
		$data['project'] = array(
				'name' => $project->projectName,
				'id' => $projectId);
		$data['texts'] = array();
		foreach ($textList->entries as $entry) {
			$text = new TextModel($project, $entry['id']);
			if (! $text->isArchived) {
				$questionList = $text->listQuestionsWithAnswers();
				// Just want count of questions and responses, not whole list
				$entry['questionCount'] = 0;
				$responseCount = 0; // "Responses" = answers + comments
				foreach ($questionList->entries as $q) {
					$question = new QuestionModel($project, $q['id']);
					if (! $question->isArchived) {
						$entry['questionCount']++;
						foreach ($q['answers'] as $a) {
							$commentCount = count($a['comments']);
							$responseCount += ($commentCount+1); // +1 for this answer
						}
					}
				}
				$entry['responseCount'] = $responseCount;
				$entry['dateCreated'] = $text->dateCreated->format(\DateTime::RFC2822);
				
				$data['texts'][] = $entry;
			}
		}

 		// sort Texts with newest at the top
 		usort($data['texts'], function ($a, $b) {
 			$sortOn = 'dateCreated';
 			if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
 				return (strtotime($a[$sortOn]) < strtotime($b[$sortOn])) ? 1 : -1;
 			} else {
 				return 0;
 			}
 		});
		
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
			$message = new MessageModel($project, $messageId);
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
