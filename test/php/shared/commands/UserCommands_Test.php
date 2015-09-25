<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Model\Command\UserCommands;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\PasswordModel;
use Api\Model\ProjectModel;
use Api\Model\UserModel;
use Api\Model\UserProfileModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class MockUserCommandsDelivery implements DeliveryInterface
{
    public $from;
    public $to;
    public $subject;
    public $content;
    public $htmlContent;
    public $smsModel;

    public function sendEmail($from, $to, $subject, $content, $htmlContent = '')
    {
        $this->from = $from;
        $this->to = $to;
        $this->subject = $subject;
        $this->content = $content;
        $this->htmlContent = $htmlContent;
    }

    public function sendSms($smsModel)
    {
        $this->smsModel = $smsModel;
    }
}

class TestUserCommands extends UnitTestCase
{

    public function __construct() {
        $this->environ = new MongoTestEnvironment();
        $this->environ->clean();
        $this->save = array();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var MongoTestEnvironment
     */
    private $environ;

    /**
     * Data storage between tests
     *
     * @var array <unknown>
     */
    private $save;

    public function testDeleteUsers_NoThrow()
    {
        $this->environ->clean();

        $userId = $this->environ->createUser('somename', 'Some Name', 'somename@example.com');

        UserCommands::deleteUsers(array($userId));
    }

    public function testUpdateUserProfile_SetLangCode_LangCodeSet()
    {
        $this->environ->clean();

        // setup parameters
        $userId = $this->environ->createUser('username', 'name', 'name@example.com');
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
        $this->environ->clean();

        $userId = $this->environ->createUser('jsmith', 'joe smith','');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', $this->environ->website);

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
        $this->environ->clean();

        $userId = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');
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
        $this->environ->clean();

        $user1Id = $this->environ->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user1Id);
        $originalWebsite = clone $this->environ->website;
        $this->environ->website->domain = 'default.local';
        $user2Id = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'zed@example.com', $originalWebsite);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);

        // cleanup so following tests are OK
        $this->environ->website->domain = $originalWebsite->domain;
    }

    public function testCheckUniqueIdentity_userExistsWithEmail_UsernameExistsEmailDoesNotMatchEmpty()
    {
        $this->environ->clean();

        $userId = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', $this->environ->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_doesNotExist_UsernameDoesNotExist()
    {
        $this->environ->clean();

        $userId = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'zed@example.com', $this->environ->website);
        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_emailExist_UsernameDoesNotExist()
    {
        $this->environ->clean();

        $userId = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'joe@smith.com', $this->environ->website);

        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExist()
    {
        $this->environ->clean();

        $user1Id = $this->environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($user1Id);
        $user2Id = $this->environ->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user2Id);

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'joe@smith.com', $this->environ->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCreateSimple_CreateUser_PasswordAndJoinProject()
    {
        $this->environ->clean();

        // setup parameters: username and project
        $userName = 'username';
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $currentUserId = $this->environ->createUser('test1', 'test1', 'test@test.com');

        // create user
        $dto = UserCommands::createSimple($userName, $projectId, $currentUserId, $this->environ->website);

        // read from disk
        $user = new UserModel($dto['id']);
        $sameProject = new ProjectModel($projectId);

        // user created and password created, user joined to project
        $this->assertEqual($user->username, "username");
        $this->assertEqual(strlen($dto['password']), 4);
        $projectUser = $sameProject->listUsers()->entries[0];
        $this->assertEqual($projectUser['username'], "username");
        $userProject = $user->listProjects($this->environ->website->domain)->entries[0];
        $this->assertEqual($userProject['projectName'], SF_TESTPROJECT);
    }

    public function testRegister_WithProjectCode_UserInProjectAndProjectHasUser()
    {
        // todo: implement this - register within a project context
    }

    public function testRegister_NoProjectCode_UserInNoProjects()
    {
        $this->environ->clean();

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

        $userId = UserCommands::register($params, $captcha_info, $this->environ->website, $delivery);

        $user = new UserModel($userId);
        $this->assertEqual($user->username, $params['username']);
        $this->assertEqual($user->listProjects($this->environ->website->domain)->count, 0);
    }

    public function testReadForRegistration_ValidKey_ValidUserModel()
    {
        $this->environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(7);
        $user->write();
        $params = UserCommands::readForRegistration($key);
        $this->assertEqual($params['email'], 'user@user.com');
    }

    public function testReadForRegistration_KeyExpired_Exception()
    {
        $this->environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(1);
        $date = $user->validationExpirationDate;
        $date->sub(new DateInterval('P2D'));
        $user->validationExpirationDate = $date;
        $user->write();
        $this->expectException();
        $this->environ->inhibitErrorDisplay();

        UserCommands::readForRegistration($key);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testReadForRegistration_KeyExpired_Exception
    public function testReadForRegistration_KeyExpired_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testReadForRegistration_invalidKey_noValidUser()
    {
        $this->environ->clean();

        $params = UserCommands::readForRegistration('bogus key');
        $this->assertEqual($params, array());
    }

    public function testUpdateFromRegistration_ValidKey_UserUpdatedAndKeyConsumed()
    {
        $this->environ->clean();

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
        UserCommands::updateFromRegistration($key, $userArray, $this->environ->website);

        $user = new UserModel($userId);

        $this->assertEqual($user->username, 'joe');
        $this->assertEqual($user->email, 'user@user.com');
        $this->assertNotEqual($user->emailPending, 'user@user.com');
        $this->assertEqual($user->validationKey, '');
    }

    public function testUpdateFromRegistration_InvalidKey_UserNotUpdatedAndKeyNotConsumed()
    {
        $this->environ->clean();

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
        UserCommands::updateFromRegistration('bogus key', $userArray, $this->environ->website);

        $user = new UserModel($userId);

        $this->assertNotEqual($user->username, 'joe');
        $this->assertEqual($user->validationKey, $key);
    }

    public function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed()
    {
        $this->environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(1);
        $date = $user->validationExpirationDate;
        $date->sub(new DateInterval('P2D'));
        $user->validationExpirationDate = $date;
        $userId = $user->write();

        // save data for rest of this test
        $this->save['userId'] = $userId;

        $userArray = array(
            'id'       => '',
            'username' => 'joe',
            'name'     => 'joe user',
            'password' => 'password'
        );
        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        UserCommands::updateFromRegistration($key, $userArray, $this->environ->website);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed
    public function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();

        $user = new UserModel($this->save['userId']);

        $this->assertEqual($user->username, '');
    }

    public function testSendInvite_SendInvite_PropertiesFromToBodyOk()
    {
        $this->environ->clean();

        $inviterUserId = $this->environ->createUser("inviteruser", "Inviter Name", "inviter@example.com");
        $toEmail = 'someone@example.com';
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, $this->environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUserId);

        $senderEmail = 'no-reply@' . $this->environ->website->domain;
        $expectedFrom = array($senderEmail => $this->environ->website->name);
        $expectedTo = array($toUser->emailPending => $toUser->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/Inviter Name/', $delivery->content);
        $this->assertPattern('/Test Project/', $delivery->content);
        $this->assertPattern('/' . $toUser->validationKey . '/', $delivery->content);
    }

    public function testChangePassword_SystemAdminChangeOtherUser_Succeeds()
    {
        $this->environ->clean();

        $adminModel = new Api\Model\UserModel();
        $adminModel->username = 'admin';
        $adminModel->role = SystemRoles::SYSTEM_ADMIN;
        $adminId = $adminModel->write();
        $userModel = new Api\Model\UserModel();
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
