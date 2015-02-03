<?php
namespace libraries\scriptureforge\sfchecks;

interface IDelivery
{
    /**
	 * Sends an email
	 * @param string $from
	 * @param string $to
	 * @param string $subject
	 * @param string $content
	 */
    public function sendEmail($from, $to, $subject, $content);

    /**
	 * Sends an Sms.
	 * It actually queues the sms to be sent at an appropriate time.
	 * @param SmsModel $smsModel
	 */
    public function sendSms($smsModel);

}
