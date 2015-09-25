<?php

namespace Api\Model\Command;

use Api\Library\Shared\Communicate\Communicate;
use Api\Model\ProjectSettingsModel;
use Api\Model\UnreadMessageModel;
use Api\Model\UserModel;

class MessageCommands
{
    public static function markMessageRead($projectId, $messageId, $userId)
    {
        $unreadModel = new UnreadMessageModel($userId, $projectId);
        $unreadModel->markRead($messageId);
        $unreadModel->write();
    }

    /**
     * @param string $projectId
     * @param array<string> $userIds
     * @param string $subject
     * @param string $smsTemplate
     * @param string $emailTemplate
     * @param string $htmlEmailTemplate
     * @return string
     */
    // TODO this needs to be tested!  cjh 2014-02
    public static function sendMessage($projectId, $userIds, $subject, $smsTemplate, $emailTemplate, $htmlEmailTemplate = '')
    {
        $project = new ProjectSettingsModel($projectId);
        $users = array();
        foreach ($userIds as $id) {
            $users[] = new UserModel($id);
        }

        return Communicate::communicateToUsers($users, $project, $subject, $smsTemplate, $emailTemplate, $htmlEmailTemplate);
    }
}
