<?php

use libraries\sfchecks\Email;
use models\UserModel;
use models\ProjectModel;

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
	
	function testSendAddedToProject_PropertiesToFromBodyOk() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$adminId = $e->createUser("Admin", "NameOfAdmin", "admin@example.com");
		$userId = $e->createUser("User", "NameOfUser", "user@example.com");
		$adminUserModel = new UserModel($adminId);
		$userUserModel = new UserModel($userId);
		$projectModel = $e->createProject("NameOfProject");
		$mailer = new MockMailer();
		
		Email::sendAddedToProject($adminUserModel, $userUserModel, $projectModel, $mailer);
		
		// What's in the mailer?
		$expectedFrom = array('no-reply@scriptureforge.org' => 'ScriptureForge');
		$expectedTo = array($userUserModel->email => $userUserModel->name);
		$this->assertPattern('/NameOfUser/', $mailer->body); // TODO: IJH - need to check these are in the right order.
		$this->assertPattern('/NameOfAdmin/', $mailer->body);
		$this->assertPattern('/NameOfProject/', $mailer->body);
		$this->assertEqual($expectedFrom, $mailer->from);
		$this->assertEqual($expectedTo, $mailer->to);
		
	}
}

?>