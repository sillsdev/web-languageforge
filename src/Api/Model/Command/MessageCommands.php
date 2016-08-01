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
        return $unreadModel->write();
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
    // This is untested because email is not usually setup on a developers machine and it is easier to mock it.
    // However, Communicate::communicateToUsers is tested using a mock for delivery of email or sms. IJH 2016-07
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
