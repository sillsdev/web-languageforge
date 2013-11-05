<?php

use libraries\sfchecks\IDelivery;
use models\commands\UserCommands;
use models\ProjectModel;
use models\mapper\JsonDecoder;
use models\UserModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class MockDelivery implements IDelivery {
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
		$delivery = new MockDelivery();
		
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
		$delivery = new MockDelivery();
		
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
		$e->inhibitErrorDisplay();
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
		$e->inhibitErrorDisplay();
		$this->expectException();
		UserCommands::updateFromRegistration($key, $userArray);
		
		$user = new UserModel($userId);
		
		$this->assertEqual($user->username, '');
		$this->assertEqual($user->validationKey, '');
	}
}

?>