<?php

use libraries\sfchecks\Email;
use models\UserModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockMailer {
	
	public $to;
	public $from;
	public $body;
	
	public function setTo($to) {
		$this->to = $to;
	}
	
	public function setFrom($from) {
		$this->from = $from;
	}
	
	public function setBody($body) {
		$this->body = $body;
	}
	
	public function send() {
	}
	
}

class TestEmail extends UnitTestCase {

	function testSendSignup_PropertiesToFromBodyOk() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId1 = $e->createUser("User1", "Name1", "name@example.com");
		
		$mailer = new MockMailer();
		$userModel = new UserModel($userId1);
		
		Email::sendSignup($userModel, $mailer);
		
		// What's in the mailer?
		$expectedFrom = array('no-reply@scriptureforge.org' => 'ScriptureForge');
		$expectedTo = array($userModel->email => $userModel->name);
		$this->assertPattern('/Name1/', $mailer->body);
		$this->assertPattern('/' . $userModel->validationKey . '/', $mailer->body);
		$this->assertEqual($expectedFrom, $mailer->from);
		$this->assertEqual($expectedTo, $mailer->to);
		
	}
	
}

?>