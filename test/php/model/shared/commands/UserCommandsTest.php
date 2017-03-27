<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Website;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\PasswordModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

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

class UserCommandsTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    /** @var mixed[] Data storage between tests */
    private static $save;

    const CROSS_SITE_DOMAIN = 'languageforge.org';

    public static function setUpBeforeClass()
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
        self::$save = [];
    }

    public function testDeleteUsers_1User_1Deleted()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('somename', 'Some Name', 'somename@example.com');

        $this->assertEquals(1, UserCommands::deleteUsers(array($userId)));
    }

    public function testDeleteUsers_NoId_Exception()
    {
        $this->expectException(Exception::class);

        self::$environ->clean();
        UserCommands::deleteUsers(null);
    }

    public function testBanUser_NoId_Exception()
    {
        $this->expectException(Exception::class);

        self::$environ->clean();

        $userId = UserCommands::banUser(null);
    }

    public function testBanUser_BadId_Exception()
    {
        $this->expectException(Exception::class);

        self::$environ->clean();

        $userId = UserCommands::banUser('notAnId');
    }

    public function testBanUser_UserNotActive()
    {
        self::$environ->clean();

        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $user = new UserModel($userId);
        $this->assertTrue($user->active);

        $userId = UserCommands::banUser($userId, '');

        $user = new UserModel($userId);
        $this->assertFalse($user->active);
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
        $user = new UserModel($newUserId);
        $this->assertEquals('th', $user->interfaceLanguageCode);
        $this->assertEquals($newUserId, $userId);
    }

    public function testCheckUniqueIdentity_selfUsername_OK()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, 'jsmith', '', null));
    }

    public function testCheckUniqueIdentity_selfEmail_OK()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, '', 'joe@smith.com', null));
    }

    public function testCheckUniqueIdentity_selfUsernameWithEmail_OK()
    {
        self::$environ->clean();

        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, 'jsmith', 'joe@smith.com', null));
    }

    public function testCheckUniqueIdentity_otherUsername_UsernameExists()
    {
        self::$environ->clean();

        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameExists', UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'zed@example.com', null));
    }

    public function testCheckUniqueIdentity_otherEmail_EmailExists()
    {
        self::$environ->clean();

        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('emailExists', UserCommands::checkUniqueIdentity($zedUser, 'zedUser', 'joe@smith.com', null));
    }

    public function testCheckUniqueIdentity_otherUsernameEmail_UsernameAndEmailExists()
    {
        self::$environ->clean();

        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $user2Id = self::$environ->createUser('janedoe', 'jane doe', 'jane@doe.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameAndEmailExists', UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'jane@doe.com', null));
    }

    public function testCheckUniqueIdentity_otherCaseUsername_UsernameExists()
    {
        self::$environ->clean();

        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameExists', UserCommands::checkUniqueIdentity($zedUser, 'JSMITH', 'zed@example.com', null));
    }

    public function testCheckUniqueIdentity_otherCaseEmail_EmailExists()
    {
        self::$environ->clean();

        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $user1Id = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('emailExists', UserCommands::checkUniqueIdentity($zedUser, 'zedUser', 'JOE@SMITH.COM', null));
    }

    public function testCreateUser_NewUser_NotFalse()
    {
        self::$environ->clean();

        // setup parameters
        $params = array(
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password');

        $this->assertNotFalse('login', UserCommands::createUser($params, self::$environ->website));
    }

    public function testCreateUser_SameUser_SameID()
    {
        self::$environ->clean();
        $params = array(
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password');
        $userId = UserCommands::createUser($params, self::$environ->website);
        $this->assertEquals($userId, UserCommands::createUser($params, self::$environ->website));
    }

    public function testCreateUser_EmailInUse_False()
    {
        self::$environ->clean();

        // setup parameters
        $params = array(
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password');
        UserCommands::createUser($params, self::$environ->website);
        $params['password'] = 'differentPassword';

        $this->assertFalse(UserCommands::createUser($params, self::$environ->website));
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
        $this->assertEquals(7, strlen($dto['password']));
        $projectUser = $sameProject->listUsers()->entries[0];
        $this->assertEquals('username', $projectUser['username']);
        $userProject = $user->listProjects(self::$environ->website->domain)->entries[0];
        $this->assertEquals(SF_TESTPROJECT, $userProject['projectName']);
    }

    public function testCreateSimple_UsernameExist_Exception()
    {
        $this->expectException(Exception::class);

        self::$environ->clean();

        // setup parameters: name and project
        $name = 'User Name';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $currentUserId = self::$environ->createUser('test1', 'test1', 'test@test.com');

        // create user
        $dto = UserCommands::createSimple($name, $projectId, $currentUserId, self::$environ->website);

        // create user again
        $dto = UserCommands::createSimple($name, $projectId, $currentUserId, self::$environ->website);
    }

    // TODO: Register within a project context
    public function testRegister_WithProjectCode_UserInProjectAndProjectHasUser()
    {
        $this->markTestIncomplete('TODO: implement this');
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

        $this->assertFalse(UserModel::userExists($params['email']));

        $delivery = new MockUserCommandsDelivery();
        UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $user = new UserModel();
        $user->readByEmail($params['email']);
        $this->assertEquals($params['email'], $user->email);
        $this->assertEquals(0, $user->listProjects(self::$environ->website->domain)->count);
    }

    public function testRegister_InvalidCaptcha_CaptchaFail()
    {
        self::$environ->clean();

        $validCode = 'validCode';
        $invalidCode = 'invalidCode';
        $params = array(
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => 'someone@example.com',
            'password' => 'somepassword',
            'captcha' => $invalidCode
        );
        $captcha_info = array('code' => $validCode);

        $delivery = new MockUserCommandsDelivery();
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'captchaFail');
    }

    public function testRegister_EmailInUsePasswordExists_EmailNotAvailable()
    {
        self::$environ->clean();

        // setup parameters: user 'test1'
        $userName = 'username';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $currentUserId = self::$environ->createUser('test1', 'test1', 'test@test.com');

        // create user 'username' with password, and assign an email address
        $dto = UserCommands::createSimple($userName, $projectId, $currentUserId, self::$environ->website);
        $user = new UserModel($dto['id']);
        $takenEmail = 'username@test.com';
        $user->email = $takenEmail;
        $user->write();

        $validCode = 'validCode';
        $params = array(
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => $takenEmail,
            'password' => 'somepassword',
            'captcha' => $validCode
        );
        $captcha_info = array('code' => $validCode);
        $delivery = new MockUserCommandsDelivery();

        // Attempt to register
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'emailNotAvailable');
    }

    public function testRegister_EmailInUseNoPassword_Login()
    {
        self::$environ->clean();

        // setup parameters: user 'test1'
        $takenEmail = 'test@test.com';
        $currentUserId = self::$environ->createUser('test1', 'test1', $takenEmail);

        $validCode = 'validCode';
        $params = array(
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => $takenEmail,
            'password' => 'somepassword',
            'captcha' => $validCode
        );
        $captcha_info = array('code' => $validCode);
        $delivery = new MockUserCommandsDelivery();

        // Attempt to register
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'login');
    }

    public function testRegister_NewUser_Login()
    {
        self::$environ->clean();

        $validCode = 'validCode';
        $params = array(
            'id' => '',
            'username' => 'anotherusername',
            'name' => 'Another Name',
            'email' => 'another@example.com',
            'password' => 'anotherpassword',
            'captcha' => $validCode
        );
        $captcha_info = array('code' => $validCode);
        $userId = self::$environ->createUser('someusername', 'Some Name', 'someone@example.com');

        $delivery = new MockUserCommandsDelivery();
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'login');

    }

    public function testRegister_CrossSiteEnabled_UserHasSiteRole()
    {
        self::$environ->clean();
        $validCode = 'validCode';
        $params = array(
            'id' => '',
            'username' => 'jsmith',
            'name' => 'joe smith',
            'email' => 'joe@smith.com',
            'password' => 'somepassword',
            'captcha' => $validCode
        );
        $website = Website::get(self::CROSS_SITE_DOMAIN);
        $captcha_info = array('code' => $validCode);
        $delivery = new MockUserCommandsDelivery();
        // Register user to default website
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);
        $joeUser = new UserModel();
        $joeUser->readByEmail('joe@smith.com');
        $this->assertFalse($joeUser->hasRoleOnSite($website));

        // Register user to cross-site
        $result = UserCommands::register($params, $website, $captcha_info, $delivery);

        $joeUser->readByEmail('joe@smith.com');
        $this->assertEquals($result, 'login');
        $this->assertTrue($joeUser->hasRoleOnSite($website));
    }

    public function testSendInvite_Register_UserActive()
    {
        self::$environ->clean();

        $inviterUserId = self::$environ->createUser("inviteruser", "Inviter Name", "inviter@example.com");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $validCode = 'validCode';
        $captcha_info = array('code' => $validCode);
        $params = array(
            'id' => '',
            'username' => 'jsmith',
            'name' => 'joe smith',
            'email' => 'joe@smith.com',
            'password' => 'somepassword',
            'captcha' => $validCode
        );

        $toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, self::$environ->website, $params['email'], $delivery);
        $joeUser = new UserModel($toUserId);
        $this->assertEquals($joeUser->active, null);
        $this->assertNull($joeUser->active);

        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $joeUser = new UserModel($toUserId);
        $this->assertTrue($joeUser->active);
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
