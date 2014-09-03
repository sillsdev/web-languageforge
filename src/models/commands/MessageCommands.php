<?php
namespace models\commands;

use models\UnreadMessageModel;
use models\UserModel;
use models\ProjectSettingsModel;
use libraries\scriptureforge\sfchecks\Communicate;

class MessageCommands
{
    public static function markMessageRead($projectId, $messageId, $userId)
    {
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
    // TODO this needs to be tested!  cjh 2014-02
    public static function sendMessage($projectId, $userIds, $subject, $emailTemplate, $smsTemplate)
    {
        $project = new ProjectSettingsModel($projectId);
        $users = array();
        foreach ($userIds as $id) {
            $users[] = new UserModel($id);
        }

        return Communicate::communicateToUsers($users, $project, $subject, $smsTemplate, $emailTemplate);
    }
}
