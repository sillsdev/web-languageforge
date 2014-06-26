<?php

use libraries\scriptureforge\sfchecks\IDelivery;
use libraries\shared\Website;
use models\commands\UserCommands;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\shared\dto\CreateSimpleDto;
use models\ProjectModel;
use models\UserModel;
use models\UserProfileModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
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
		
		UserCommands::deleteUsers(array($userId), 'bogus auth userid');
	}
	
	function testUpdateUserProfile_SetLangCode_LangCodeSet() {
		$e = new MongoTestEnvironment();
		$e->clean();

		// setup parameters
		$userId = $e->createUser('username', 'name', 'name@example.com');
		$params = array(
			'id' => '',
			'interfaceLanguageCode' => 'th'
		);
		
		$newUserId = UserCommands::updateUserProfile($params, $userId);
		
		// user profile updated
		$user = new UserProfileModel($newUserId);
		$this->assertEqual($user->interfaceLanguageCode, 'th');
		$this->assertEqual($userId, $newUserId);
	}
	
	function testCreateSimple_CreateUser_PasswordAndJoinProject() {
		$e = new MongoTestEnvironment();
		$e->clean();

		// setup parameters: username and project
		$userName = 'username';
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$currentUserId = $e->createUser('test1', 'test1', 'test@test.com');
		
		// create user
		$dto = UserCommands::createSimple($userName, $projectId, $currentUserId, $e->website);
		
		// read from disk
		$user = new UserModel($dto['id']);
		$sameProject = new ProjectModel($projectId);
		
		// user created and password created, user joined to project
		$this->assertEqual($user->username, "username");
		$this->assertEqual(strlen($dto['password']), 4);
		$projectUser = $sameProject->listUsers()->entries[0];
		$this->assertEqual($projectUser['username'], "username");
		$userProject = $user->listProjects($e->website->domain)->entries[0];
		$this->assertEqual($userProject['projectName'], SF_TESTPROJECT);
	}
	
	function testRegister_WithProjectCode_UserInProjectAndProjectHasUser() {
		// todo: implement this - register within a project context
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
		
		$userId = UserCommands::register($params, $captcha_info, $e->website, $delivery);
		
		$user = new UserModel($userId);
		$this->assertEqual($user->username, $params['username']);
		$this->assertEqual($user->listProjects($e->website->domain)->count, 0);
	}
	
	function testReadForRegistration_ValidKey_ValidUserModel() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user = new UserModel();
		$user->emailPending = 'user@user.com';
		$key = $user->setValidation(7);
		$user->write();
		$params = UserCommands::readForRegistration($key);
		$this->assertEqual($params['email'], 'user@user.com');
	}
	
	function testReadForRegistration_KeyExpired_Throws() {
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
	
	function testUpdateFromRegistration_ValidKey_UserUpdatedAndKeyConsumed() {
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
	
	function testUpdateFromRegistration_InvalidKey_UserNotUpdatedAndKeyNotConsumed() {
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
	
	function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed() {
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
	
	function testSendInvite_SendInvite_PropertiesFromToBodyOk() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$inviterUserId = $e->createUser("inviteruser", "Inviter Name", "inviter@example.com");
		$toEmail = 'someone@example.com';
		$project = $e->createProject(SF_TESTPROJECT);
		$project->projectCode = 'someProjectCode';
		$project->write();
		$delivery = new MockUserCommandsDelivery();
	
		$toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, $e->website, $toEmail, $delivery);
	
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
}

?>
