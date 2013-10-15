<?php

use models\UserModel;
use libraries\sfchecks\IDelivery;
use libraries\sfchecks\Communicate;
use libraries\sms\SmsModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockCommunicateDelivery implements IDelivery
{
	public $userModel;
	public $projectModel;
	public $content;
	public $smsModel;

	public function sendEmail($userModel, $projectModel, $content) {
	}
	
	public function sendSms($smsModel) {
		$this->smsModel = $smsModel;
	}
	
}

class TestSms extends UnitTestCase {
/*
	function testSmsDeliver_Works() {
		$smsModel = new SmsModel();
		$smsModel->from = '13852904211';
// 		$smsModel->to = '+66871905871';
		$smsModel->to = '+66837610205';
		$smsModel->provider = SmsModel::SMS_TWILIO;
		$smsModel->providerInfo = 'ACc03c2767c2c9c138bde0aa0b30ac9d6e|be77f02cd3b6b13d3b42d8a64050fd35';
		$smsModel->message = 'Test Message';
		
		Sms::deliver($smsModel);
		
	}
*/	
	function testCommunicateToUser() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->communicate_via = UserModel::COMMUNICATE_VIA_SMS;
		$user->mobile_phone = '+66837610205';
		$project = $e->createProject('ProjectName');
		$smsTemplate = 'Test message';
		$emailTemplate = '';
		$delivery = new MockCommunicateDelivery();
		
		Communicate::communicateToUser($user, $project, $smsTemplate, $emailTemplate, $delivery);
		
		// What's in the delivery?
		$expectedTo = $user->mobile_phone;
		$this->assertEqual($expectedTo, $delivery->smsModel->to);
		$this->assertEqual($smsTemplate, $delivery->smsModel->message);
				
		$expectedFrom = array('no-reply@scriptureforge.org' => 'ScriptureForge');
//		$this->assertPattern('/Name/', $mailer->body);
//		$this->assertEqual($expectedFrom, $mailer->from);
		
	}
	
}

?>