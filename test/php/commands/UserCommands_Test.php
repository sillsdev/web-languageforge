<?php

use libraries\sfchecks\IDelivery;
use models\commands\UserCommands;
use models\ProjectModel;
use models\mapper\JsonDecoder;
use models\UserModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockUserCommandsDelivery implements IDelivery {
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
		$delivery = new MockUserCommandsDelivery();
		
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
		$delivery = new MockUserCommandsDelivery();
		
		$userId = UserCommands::register($params, $captcha_info, '', $delivery);
		
		$user = new UserModel($userId);
		$this->assertEqual($user->username, $params['username']);
		$this->assertEqual($user->listProjects()->count, 0);
	}
	
	function testReadForRegistration_validKey_validUserModel() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(7);
		$user->write();
		$params = UserCommands::readForRegistration($key);
		$this->assertEqual($params['email'], 'user@user.com');
	}
	
	function testReadForRegistration_keyExpired_throws() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(1);
		$date = $user->validationExpirationDate;
		$date->sub(new DateInterval('P2D'));
		$user->validationExpirationDate = $date;
		$user->write();
		$this->expectException();
		$params = UserCommands::readForRegistration($key);
	}
	
	function testReadForRegistration_invalidKey_noValidUser() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$params = UserCommands::readForRegistration('bogus key');
		$this->assertEqual($params, array());
	}
	
	function testUpdateFromRegistration_validKey_userUpdatedAndKeyConsumed() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(1);
		$userId = $user->write();
		
		$userArray = array(
			'id'       => '',
			'username' => 'joe',
			'name'     => 'joe user',
			'password' => 'password'
		);
		UserCommands::updateFromRegistration($key, $userArray);
		
		$user = new UserModel($userId);
		
		$this->assertEqual($user->username, 'joe');
		$this->assertEqual($user->email, 'user@user.com');
		$this->assertNotEqual($user->emailPending, 'user@user.com');
		$this->assertEqual($user->validationKey, '');
	}
	
	function testUpdateFromRegistration_InvalidKey_userNotUpdatedAndKeyNotConsumed() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(1);
		$userId = $user->write();
		
		$userArray = array(
			'id'       => '',
			'username' => 'joe',
			'name'     => 'joe user',
			'password' => 'password'
		);
		UserCommands::updateFromRegistration('bogus key', $userArray);
		
		$user = new UserModel($userId);
		
		$this->assertNotEqual($user->username, 'joe');
		$this->assertEqual($user->validationKey, $key);
	}
	
	function testUpdateFromRegistration_ExpiredKey_userNotUpdatedAndKeyConsumed() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(1);
		$date = $user->validationExpirationDate;
		$date->sub(new DateInterval('P2D'));
		$user->validationExpirationDate = $date;
		$userId = $user->write();
		
		$userArray = array(
			'id'       => '',
			'username' => 'joe',
			'name'     => 'joe user',
			'password' => 'password'
		);
		$this->expectException();
		UserCommands::updateFromRegistration($key, $userArray);
		
		$user = new UserModel($userId);
		
		$this->assertEqual($user->username, '');
		$this->assertEqual($user->validationKey, '');
	}
	
	function testSendInvite_SendInvite_PropertiesFromToBodyOk() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$inviterUserId = $e->createUser("inviteruser", "Inviter Name", "inviter@example.com");
		$inviterUser = new UserModel($inviterUserId);
		$toEmail = 'someone@example.com';
		$project = $e->createProject(SF_TESTPROJECT);
		$project->projectCode = 'someProjectCode';
		$project->write();
		$delivery = new MockUserCommandsDelivery();
	
		$toUserId = UserCommands::sendInvite($inviterUser, $toEmail, $project->id->asString(), $project->projectCode, $delivery);
	
		// What's in the delivery?
		$toUser = new UserModel($toUserId);
		$expectedFrom = array(SF_DEFAULT_EMAIL => SF_DEFAULT_EMAIL_NAME);
		$expectedTo = array($toUser->emailPending => $toUser->name);
		$this->assertEqual($expectedFrom, $delivery->from);
		$this->assertEqual($expectedTo, $delivery->to);
		$this->assertPattern('/Inviter Name/', $delivery->content);
		$this->assertPattern('/Test Project/', $delivery->content);
		$this->assertPattern('/' . $toUser->validationKey . '/', $delivery->content);
	}
	
	function testSendInvite_noProjectContext_throwException() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$inviterUserId = $e->createUser("inviteruser", "Inviter Name", "inviter@example.com");
		$inviterUser = new UserModel($inviterUserId);
		$toEmail = 'someone@example.com';
		$projectId = '';
		$hostName = 'someProjectCode.scriptureforge.org';
		$delivery = new MockUserCommandsDelivery();
	
		$e->inhibitErrorDisplay();
		$this->expectException(new \Exception("Cannot send invitation for unknown project 'someProjectCode'"));
		$toUserId = UserCommands::sendInvite($inviterUser, $toEmail, $projectId, $hostName, $delivery);
		$e->restoreErrorDisplay();
	}
	
	function testSendInvite_noProjectContextNoProjectCode_throwException() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$inviterUserId = $e->createUser("inviteruser", "Inviter Name", "inviter@example.com");
		$inviterUser = new UserModel($inviterUserId);
		$toEmail = 'someone@example.com';
		$projectId = '';
		$hostName = 'scriptureforge.org';
		$delivery = new MockUserCommandsDelivery();
	
		$e->inhibitErrorDisplay();
		$this->expectException(new \Exception("Sending an invitation without a project context is not supported."));
		$toUserId = UserCommands::sendInvite($inviterUser, $toEmail, $projectId, $hostName, $delivery);
		$e->restoreErrorDisplay();
	}
	
	function testAddExistingUser() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
	}
	
}

?>