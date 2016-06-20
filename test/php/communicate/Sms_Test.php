<?php

use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Communicate\Sms\SmsQueue;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestSms extends UnitTestCase
{
    public function testSmsDeliver_Works()
    {
        $smsModel = new SmsModel();
        $smsModel->from = '13852904211';
//         $smsModel->to = '+66871905871';
        $smsModel->to = '+66837610205';
        $smsModel->provider = SmsModel::SMS_TWILIO;
        $smsModel->providerInfo = 'ACc03c2767c2c9c138bde0aa0b30ac9d6e|be77f02cd3b6b13d3b42d8a64050fd35';
        $smsModel->message = 'Test Message';

        SmsQueue::deliver($smsModel);
    }
}
