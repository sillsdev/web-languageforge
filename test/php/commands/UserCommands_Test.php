<?php

use libraries\sfchecks\IDelivery;
use models\commands\UserCommands;
use models\ProjectModel;
use models\mapper\JsonDecoder;
use models\UserModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockUserComamndsDelivery implements IDelivery {
	public $from;
	public $to;
	public $subject;
	public $content;
	public $smsModel;

	public function sendEmail($from, $to, $subject, $content) {
		$this->from = $from;
		$this->to = $to;
		$this->subject = $subject;
		$this->content = $content;
	}
	
	public function sendSms($smsModel) {
		$this->smsModel = $smsModel;
	}
	
}

class TestUserCommands extends UnitTestCase {

	function testDeleteUsers_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser('somename', 'Some Name', 'somename@example.com');
		
		UserCommands::deleteUsers(array($userId));
	}
	
	function testRegister_WithProjectCode_UserInProjectAndProjectHasUser() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$projectDomain = 'someprojectcode.example.com';
		$project = $e->createProject(SF_TESTPROJECT);
		$project->projectCode = ProjectModel::domainToProjectCode($projectDomain);
		$project->write();
		$validCode = 'validCode';
		$params = array(
				'id' => '',
				'username' => 'someusername',
				'name' => 'Some Name',
				'email' => 'someone@example.com',
				'password' => 'somepassword',
				'captcha' => $validCode
		);
		$captcha_info = array('code' => $validCode);
		$projectCode = $project->projectCode;
		$delivery = new MockUserComamndsDelivery();
		
		$userId = UserCommands::register($params, $captcha_info, $projectCode, $delivery);
		
		$user = new UserModel($userId);
		$this->assertEqual($user->username, $params['username']);
		$this->assertEqual($project->listUsers()->count, 1);
		$this->assertEqual($user->listProjects()->count, 1);
	}
	
	function testRegister_NoProjectCode_UserInNoProjects() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$validCode = 'validCode';
		$params = array(
				'id' => '',
				'username' => 'someusername',
				'name' => 'Some Name',
				'email' => 'someone@example.com',
				'password' => 'somepassword',
				'captcha' => $validCode
		);
		$captcha_info = array('code' => $validCode);
		$delivery = new MockUserComamndsDelivery();
		
		$userId = UserCommands::register($params, $captcha_info, '', $delivery);
		
		$user = new UserModel($userId);
		$this->assertEqual($user->username, $params['username']);
		$this->assertEqual($user->listProjects()->count, 0);
	}
	
	function testSendInvite() {
		$e = new MongoTestEnvironment();
		$e->clean();

		$fromUserId = $e->createUser("fromuser", "From Name", "from@example.com");
		$fromUser = new UserModel($fromUserId);
		$email = 'someone@example.com';
		$project = $e->createProject(SF_TESTPROJECT);
		$delivery = new MockUserComamndsDelivery();
		
		$userId = UserCommands::sendInvite($fromUser, $email, $project->id->asString(), $delivery);
		
		$user = new UserModel($userId);
//		$this->assertEqual($user->username, $params['username']);
//		$this->assertEqual($user->listProjects()->count, 0);
	}
		
}

?>