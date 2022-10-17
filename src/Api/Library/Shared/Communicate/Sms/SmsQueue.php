<?php

namespace Api\Library\Shared\Communicate\Sms;

use Palaso\Utilities\CodeGuard;

/**
 * Manages the SMS queue.
 */
class SmsQueue
{
    /**
     * Attempts to deliver a single sms message.
     * @param SmsModel $smsModel
     */
    public static function deliver($smsModel)
    {
        CodeGuard::checkTypeAndThrow($smsModel, "Api\Library\Shared\Communicate\Sms\SmsModel");
        // Check if the smsModel is valid
        if (!$smsModel->to || !$smsModel->from || $smsModel->userRef == null || !$smsModel->userRef->asString()) {
            SmsModel::remove($smsModel->databaseName(), $smsModel->id->asString());
            error_log("Error: Removed invalid sms from queue: " . $smsModel->id->asString());
            error_log(" Dump: " . var_export($smsModel, true));

            return;
        }
        $info = explode("|", $smsModel->providerInfo);
        $sid = $info[0];
        $token = $info[1];

        $client = new \Services_Twilio($sid, $token);
        $message = $client->account->messages->sendMessage($smsModel->from, $smsModel->to, $smsModel->message);

        /* Not exactly sure as to what constitutes the various failure modes.  For now dump the message response to the log.
         * As we know more we can 'white list' the codes and handle them gracefully here.
         */
        error_log(var_export($message, true));
        //         var_dump($message);

        // Update the state
        $smsModel->state = SmsModel::SMS_SENT;
        $smsModel->write();
    }

    /**
     * Attempts to deliver any sms messages in the queue.
     * @param string $databaseName
     */
    public static function processQueue($databaseName)
    {
        // TODO Async
        $queue = new SmsQueueModel($databaseName);
        $queue->readNew();
        foreach ($queue->entries as $id => $sms) {
            error_log(var_export($sms, true));
            self::deliver($sms);
        }
    }

    /**
     * @param SmsModel $smsModel
     */
    public static function queue($smsModel)
    {
        CodeGuard::checkTypeAndThrow($smsModel, "Api\Library\Shared\Communicate\Sms\SmsModel");
        // Check if the smsModel is valid
        if (!$smsModel->to || !$smsModel->from || $smsModel->userRef == null || !$smsModel->userRef->asString()) {
            error_log("Error: Attempting to queue invalid sms");
            error_log(" Dump: " . var_export($smsModel, true));

            return;
        }
        $id = $smsModel->write();
        $databaseName = $smsModel->databaseName();
        error_log("wrote sms: $id to $databaseName");
    }
}
