<?php

use libraries\scriptureforge\sfchecks\IDelivery;
use libraries\shared\Website;
use models\commands\UserCommands;
use models\mapper\Id;
use models\shared\rights\SystemRoles;
use models\PasswordModel;
use models\ProjectModel;
use models\UserModel;
use models\UserProfileModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class MockUserCommandsDelivery implements IDelivery
{
    public $from;
    public $to;
    public $subject;
    public $content;
    public $smsModel;

    public function sendEmail($from, $to, $subject, $content)
    {
        $this->from = $from;
        $this->to = $to;
        $this->subject = $subject;
        $this->content = $content;
    }

    public function sendSms($smsModel)
    {
        $this->smsModel = $smsModel;
    }

}

class TestUserCommands extends UnitTestCase
{
    public function testDeleteUsers_NoThrow()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('somename', 'Some Name', 'somename@example.com');

        UserCommands::deleteUsers(array($userId), 'bogus auth userid');
    }

    public function testUpdateUserProfile_SetLangCode_LangCodeSet()
    {
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

    public function testCheckIdentity_userDoesNotExistNoEmail_defaults()
    {
        $identityCheck = UserCommands::checkIdentity('', '', null);

        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->allowSignupFromOtherSites);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExistsNoEmail_UsernameExistsEmailEmpty()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith','');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', $e->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->allowSignupFromOtherSites);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExistsWithEmail_UsernameExistsEmailMatches()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', 'joe@smith.com', null);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExistsWithEmail_UsernameExistsEmailDoesNotMatch()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $user1Id = $e->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user1Id);
        $originalWebsite = clone $e->website;
        $e->website->domain = 'default.local';
        $user2Id = $e->createUser('jsmith', 'joe smith','joe@smith.com');

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'zed@example.com', $originalWebsite);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);

        // cleanup so following tests are OK
        $e->website->domain = $originalWebsite->domain;
    }

    public function testCheckUniqueIdentity_userExistsWithEmail_UsernameExistsEmailDoesNotMatchEmpty()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', $e->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_doesNotExist_UsernameDoesNotExist()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'zed@example.com', $e->website);
        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_emailExist_UsernameDoesNotExist()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'joe@smith.com', $e->website);

        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExist()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $user1Id = $e->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($user1Id);
        $user2Id = $e->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user2Id);

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'joe@smith.com', $e->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCreateSimple_CreateUser_PasswordAndJoinProject()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        // setup parameters: username and project
        $userName = 'username';
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

    public function testRegister_WithProjectCode_UserInProjectAndProjectHasUser()
    {
        // todo: implement this - register within a project context
    }

    public function testRegister_NoProjectCode_UserInNoProjects()
    {
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

    public function testReadForRegistration_ValidKey_ValidUserModel()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(7);
        $user->write();
        $params = UserCommands::readForRegistration($key);
        $this->assertEqual($params['email'], 'user@user.com');
    }

    public function testReadForRegistration_KeyExpired_Throws()
    {
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

    public function testReadForRegistration_invalidKey_noValidUser()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $params = UserCommands::readForRegistration('bogus key');
        $this->assertEqual($params, array());
    }

    public function testUpdateFromRegistration_ValidKey_UserUpdatedAndKeyConsumed()
    {
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
        UserCommands::updateFromRegistration($key, $userArray, $e->website);

        $user = new UserModel($userId);

        $this->assertEqual($user->username, 'joe');
        $this->assertEqual($user->email, 'user@user.com');
        $this->assertNotEqual($user->emailPending, 'user@user.com');
        $this->assertEqual($user->validationKey, '');
    }

    public function testUpdateFromRegistration_InvalidKey_UserNotUpdatedAndKeyNotConsumed()
    {
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
        UserCommands::updateFromRegistration('bogus key', $userArray, $e->website);

        $user = new UserModel($userId);

        $this->assertNotEqual($user->username, 'joe');
        $this->assertEqual($user->validationKey, $key);
    }

    public function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed()
    {
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
        UserCommands::updateFromRegistration($key, $userArray, $e->website);

        $user = new UserModel($userId);

        $this->assertEqual($user->username, '');
        $this->assertEqual($user->validationKey, '');
    }

    public function testSendInvite_SendInvite_PropertiesFromToBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $inviterUserId = $e->createUser("inviteruser", "Inviter Name", "inviter@example.com");
        $toEmail = 'someone@example.com';
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, $e->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUserId);

        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($toUser->emailPending => $toUser->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/Inviter Name/', $delivery->content);
        $this->assertPattern('/Test Project/', $delivery->content);
        $this->assertPattern('/' . $toUser->validationKey . '/', $delivery->content);
    }

    public function testChangePassword_SystemAdminChangeOtherUser_Succeeds()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $adminModel = new models\UserModel();
        $adminModel->username = 'admin';
        $adminModel->role = SystemRoles::SYSTEM_ADMIN;
        $adminId = $adminModel->write();
        $userModel = new models\UserModel();
        $userModel->username = 'user';
        $userModel->role = SystemRoles::NONE;
        $userId = $userModel->write();

        $this->assertNotEqual($adminId, $userId);
        UserCommands::changePassword($userId, 'somepass', $adminId);
        $passwordModel = new PasswordModel($userId);
        $result = $passwordModel->verifyPassword('somepass');
        $this->assertTrue($result, 'Could not verify changed password');
    }
}
