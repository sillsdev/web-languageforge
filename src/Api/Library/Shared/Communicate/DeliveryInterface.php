<?php

namespace Api\Library\Shared\Communicate;

use Api\Library\Shared\Communicate\Sms\SmsModel;

interface DeliveryInterface
{
    /**
     * Sends an email
     * @param string $from
     * @param string $to
     * @param string $subject
     * @param string $content
     * @param string $htmlContent
     */
    public function sendEmail($from, $to, $subject, $content, $htmlContent = "");

    /**
     * Sends an Sms.
     * It actually queues the sms to be sent at an appropriate time.
     * @param SmsModel $smsModel
     */
    public function sendSms($smsModel);
}
