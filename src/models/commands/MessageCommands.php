<?php
namespace models\commands;
use models\UnreadMessageModel;

class MessageCommands {
	public static function markMessageRead($projectId, $messageId, $userId) {
		$unreadModel = new UnreadMessageModel($userId, $projectId);
		$unreadModel->markRead($messageId);
		$unreadModel->write();
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param array $userIds
	 * @param string $subject
	 * @param string $emailTemplate
	 * @param string $smsTemplate
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function sendMessage($projectId, $userIds, $subject, $emailTemplate, $smsTemplate, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$project = new ProjectSettingsModel($projectId);
		$users = array();
		foreach ($userIds as $id) {
			$users[] = new UserModel($id);
		}
		return Communicate::communicateToUsers($users, $project, $subject, $smsTemplate, $emailTemplate);
	}
}