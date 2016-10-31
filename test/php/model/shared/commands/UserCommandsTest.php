<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\PasswordModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserProfileModel;
//use PHPUnit\Framework\TestCase;

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

class UserCommandsTest extends PHPUnit_Framework_TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    /** @var mixed[] Data storage between tests */
    private static $save;

    public static function setUpBeforeClass()
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
        self::$save = [];
    }

    public function testDeleteUsers_NoThrow()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('somename', 'Some Name', 'somename@example.com');

        UserCommands::deleteUsers(array($userId));
    }

    public function testUpdateUserProfile_SetLangCode_LangCodeSet()
    {
        self::$environ->clean();

        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $params = array(
            'id' => '',
            'interfaceLanguageCode' => 'th'
        );

        $newUserId = UserCommands::updateUserProfile($params, $userId);

        // user profile updated
        $user = new UserProfileModel($newUserId);
        $this->assertEquals('th', $user->interfaceLanguageCode);
        $this->assertEquals($newUserId, $userId);
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
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', self::$environ->website);

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
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
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
        self::$environ->clean();

        $user1Id = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user1Id);
        $originalWebsite = clone self::$environ->website;
        self::$environ->website->domain = 'default.local';
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'zed@example.com', $originalWebsite);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);

        // cleanup so following tests are OK
        self::$environ->website->domain = $originalWebsite->domain;
    }

    public function testCheckUniqueIdentity_userExistsWithEmail_UsernameExistsEmailDoesNotMatchEmpty()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', self::$environ->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertTrue($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_doesNotExist_UsernameDoesNotExist()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'zed@example.com', self::$environ->website);
        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertFalse($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_emailExist_UsernameDoesNotExist()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $identityCheck = UserCommands::checkUniqueIdentity($joeUser, 'zedUser', 'joe@smith.com', self::$environ->website);

        $this->assertFalse($identityCheck->usernameExists);
        $this->assertFalse($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertTrue($identityCheck->emailIsEmpty);
        $this->assertTrue($identityCheck->emailMatchesAccount);
    }

    public function testCheckUniqueIdentity_userExist()
    {
        self::$environ->clean();

        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        new UserModel($user1Id);
        $user2Id = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $zedUser = new UserModel($user2Id);

        $identityCheck = UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'joe@smith.com', self::$environ->website);

        $this->assertTrue($identityCheck->usernameExists);
        $this->assertTrue($identityCheck->usernameExistsOnThisSite);
        $this->assertFalse($identityCheck->usernameMatchesAccount);
        $this->assertTrue($identityCheck->emailExists);
        $this->assertFalse($identityCheck->emailIsEmpty);
        $this->assertFalse($identityCheck->emailMatchesAccount);
    }

    public function testCreateSimple_CreateUser_PasswordAndJoinProject()
    {
        self::$environ->clean();

        // setup parameters: username and project
        $userName = 'username';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $currentUserId = self::$environ->createUser('test1', 'test1', 'test@test.com');

        // create user
        $dto = UserCommands::createSimple($userName, $projectId, $currentUserId, self::$environ->website);

        // read from disk
        $user = new UserModel($dto['id']);
        $sameProject = new ProjectModel($projectId);

        // user created and password created, user joined to project
        $this->assertEquals('username', $user->username);
        $this->assertEquals(4, strlen($dto['password']));
        $projectUser = $sameProject->listUsers()->entries[0];
        $this->assertEquals('username', $projectUser['username']);
        $userProject = $user->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $userProject['projectName']);
    }

    public function testRegister_WithProjectCode_UserInProjectAndProjectHasUser()
    {
        // todo: implement this - register within a project context
    }

    public function testRegister_NoProjectCode_UserInNoProjects()
    {
        self::$environ->clean();

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

        $userId = UserCommands::register($params, $captcha_info, self::$environ->website, $delivery);

        $user = new UserModel($userId);
        $this->assertEquals($params['username'], $user->username);
        $this->assertEquals(0, $user->listProjects(self::$environ->website->domain)->count);
    }

    public function testReadForRegistration_ValidKey_ValidUserModel()
    {
        self::$environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(7);
        $user->write();
        $params = UserCommands::readForRegistration($key);
        $this->assertEquals('user@user.com', $params['email']);
    }

    /**
     * @expectedException Exception
     */
    public function testReadForRegistration_KeyExpired_Exception()
    {
        self::$environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(1);
        $date = $user->validationExpirationDate;
        $date->sub(new DateInterval('P2D'));
        $user->validationExpirationDate = $date;
        $user->write();
        self::$environ->inhibitErrorDisplay();

        UserCommands::readForRegistration($key);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testReadForRegistration_KeyExpired_Exception
    public function testReadForRegistration_KeyExpired_RestoreErrorDisplay()
    {
        // restore error display after last test
        self::$environ->restoreErrorDisplay();
    }

    public function testReadForRegistration_invalidKey_noValidUser()
    {
        self::$environ->clean();

        $params = UserCommands::readForRegistration('bogus key');
        $this->assertEquals([], $params);
    }

    public function testUpdateFromRegistration_ValidKey_UserUpdatedAndKeyConsumed()
    {
        self::$environ->clean();

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
        UserCommands::updateFromRegistration($key, $userArray, self::$environ->website);

        $user = new UserModel($userId);

        $this->assertEquals('joe', $user->username);
        $this->assertEquals('user@user.com', $user->email);
        $this->assertNotEquals('user@user.com', $user->emailPending);
        $this->assertEquals('', $user->validationKey);
    }

    public function testUpdateFromRegistration_InvalidKey_UserNotUpdatedAndKeyNotConsumed()
    {
        self::$environ->clean();

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
        UserCommands::updateFromRegistration('bogus key', $userArray, self::$environ->website);

        $user = new UserModel($userId);

        $this->assertNotEquals('joe', $user->username);
        $this->assertEquals($key, $user->validationKey);
    }

    /**
     * @expectedException Exception
     */
    public function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed()
    {
        self::$environ->clean();

        $user = new UserModel();
        $user->emailPending = 'user@user.com';
        $key = $user->setValidation(1);
        $date = $user->validationExpirationDate;
        $date->sub(new DateInterval('P2D'));
        $user->validationExpirationDate = $date;
        $userId = $user->write();

        // save data for rest of this test
        self::$save['userId'] = $userId;

        $userArray = array(
            'id'       => '',
            'username' => 'joe',
            'name'     => 'joe user',
            'password' => 'password'
        );
        self::$environ->inhibitErrorDisplay();

        UserCommands::updateFromRegistration($key, $userArray, self::$environ->website);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    /**
     * @depends testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed
     */
    public function testUpdateFromRegistration_ExpiredKey_UserNotUpdatedAndKeyConsumed_RestoreErrorDisplay()
    {
        // restore error display after last test
        self::$environ->restoreErrorDisplay();

        $user = new UserModel(self::$save['userId']);

        $this->assertEquals('', $user->username);
    }

    public function testSendInvite_SendInvite_PropertiesFromToBodyOk()
    {
        self::$environ->clean();

        $inviterUserId = self::$environ->createUser("inviteruser", "Inviter Name", "inviter@example.com");
        $toEmail = 'someone@example.com';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, self::$environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUserId);

        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($toUser->emailPending => $toUser->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/Inviter Name/', $delivery->content);
        $this->assertRegExp('/Test Project/', $delivery->content);
        $this->assertRegExp('/' . $toUser->validationKey . '/', $delivery->content);
    }

    public function testChangePassword_SystemAdminChangeOtherUser_Succeeds()
    {
        self::$environ->clean();

        $adminModel = new UserModel();
        $adminModel->username = 'admin';
        $adminModel->role = SystemRoles::SYSTEM_ADMIN;
        $adminId = $adminModel->write();
        $userModel = new UserModel();
        $userModel->username = 'user';
        $userModel->role = SystemRoles::NONE;
        $userId = $userModel->write();

        $this->assertNotEquals($userId, $adminId);
        UserCommands::changePassword($userId, 'somepass', $adminId);
        $passwordModel = new PasswordModel($userId);
        $result = $passwordModel->verifyPassword('somepass');
        $this->assertTrue($result, 'Could not verify changed password');
    }
}
