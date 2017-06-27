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
        self::$save = [];
    }

    protected function setUp()
    {
        self::$environ->clean();
    }

    public function testDeleteUsers_1User_1Deleted()
    {
        $userId = self::$environ->createUser('somename', 'Some Name', 'somename@example.com');
        $count = UserCommands::deleteUsers([$userId]);

        $this->assertEquals(1, $count);
    }

    public function testDeleteUsers_NoId_Exception()
    {
        $this->expectException(Exception::class);
        UserCommands::deleteUsers(null);
    }

    public function testBanUser_NoId_Exception()
    {
        $this->expectException(Exception::class);
        UserCommands::banUser(null);
    }

    public function testBanUser_BadId_Exception()
    {
        $this->expectException(Exception::class);
        UserCommands::banUser('notAnId');
    }

    public function testBanUser_UserNotActive()
    {
        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $user = new UserModel($userId);
        $this->assertTrue($user->active);

        $userId = UserCommands::banUser($userId);

        $user = new UserModel($userId);
        $this->assertFalse($user->active);
    }

    public function testUpdateUserProfile_OtherUsername_FalseNoUpdate()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $params = [
            'id' => $zedId,
            'username' => 'jsmith',
            'email' => 'zed@example.com',
            'avatar_ref' => 'joe.png'
        ];
        $zed = new UserModel($zedId);
        $this->assertEquals($zed->avatar_ref, $zed->username . '.png');

        $this->assertFalse(UserCommands::updateUserProfile($params, $zedId, self::$environ->website));
        $zed = new UserModel($zedId);
        $this->assertNotEquals($params['avatar_ref'], $zed->avatar_ref);
    }

    public function testUpdateUserProfile_OtherEmail_FalseNoUpdate()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $params = [
            'id' => $zedId,
            'username' => 'zedUser',
            'email' => 'joe@smith.com'
        ];
        $zed = new UserModel($zedId);
        $this->assertEquals('zed@example.com', $zed->email);

        $this->assertFalse(UserCommands::updateUserProfile($params, $zedId, self::$environ->website));
        $zed = new UserModel($zedId);
        $this->assertNotEquals($params['email'], $zed->email);
    }

    public function testUpdateUserProfile_OtherUsernameOtherEmail_False()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        self::$environ->createUser('janedoe', 'jane doe', 'jane@doe.com');
        $params = [
            'id' => $zedId,
            'username' => 'janedoe',
            'email' => 'joe@smith.com'
        ];

        $this->assertFalse(UserCommands::updateUserProfile($params, $zedId, self::$environ->website));
        $zed = new UserModel($zedId);
        $this->assertNotEquals($params['username'], $zed->username);
        $this->assertNotEquals($params['email'], $zed->email);
    }

    public function testUpdateUserProfile_NewEmail_IdEmailChanged()
    {
        $zedId = self::$environ->createUser('zeduser', 'zed user','zed@example.com');
        $params = [
            'id' => $zedId,
            'username' => 'zeduser',
            'email' => 'joe@smith.com'
        ];
        $status = UserCommands::updateUserProfile($params, $zedId, self::$environ->website);
        $this->assertEquals($zedId, $status );
        $zed = new UserModel($zedId);
        $this->assertEquals('zeduser', $zed->username);
        $this->assertEquals('joe@smith.com', $zed->email);
    }

    public function testUpdateUserProfile_NewUsernameEmail_LoginUsernameEmailChanged()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        $params = [
            'id' => $zedId,
            'username' => 'jsmith',
            'email' => 'joe@smith.com'
        ];
        $status = UserCommands::updateUserProfile($params, $zedId, self::$environ->website);
        $this->assertEquals('login', $status );
        $zed = new UserModel($zedId);
        $this->assertEquals('jsmith', $zed->username);
        $this->assertEquals('joe@smith.com', $zed->email);
    }

    public function testUpdateUserProfile_SetLangCode_LangCodeSet()
    {
        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $params = [
            'id' => $userId,
            'username' => 'username',
            'email' => 'name@example.com',
            'interfaceLanguageCode' => 'th'
        ];

        $newUserId = UserCommands::updateUserProfile($params, $userId, self::$environ->website);

        // user profile updated
        $user = new UserModel($newUserId);
        $this->assertEquals('th', $user->interfaceLanguageCode);
        $this->assertEquals($newUserId, $userId);
    }

    public function testCheckUniqueIdentity_selfUsername_OK()
    {
        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, 'jsmith', ''));
    }

    public function testCheckUniqueIdentity_selfEmail_OK()
    {
        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, '', 'joe@smith.com'));
    }

    public function testCheckUniqueIdentity_selfUsernameWithEmail_OK()
    {
        $userId = self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        $joeUser = new UserModel($userId);

        $this->assertEquals('ok', UserCommands::checkUniqueIdentity($joeUser, 'jsmith', 'joe@smith.com'));
    }

    public function testCheckUniqueIdentity_otherUsername_UsernameExists()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameExists', UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'zed@example.com'));
    }

    public function testCheckUniqueIdentity_otherEmail_EmailExists()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('emailExists', UserCommands::checkUniqueIdentity($zedUser, 'zedUser', 'joe@smith.com'));
    }

    public function testCheckUniqueIdentity_otherUsernameEmail_UsernameAndEmailExists()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');
        self::$environ->createUser('janedoe', 'jane doe', 'jane@doe.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameAndEmailExists', UserCommands::checkUniqueIdentity($zedUser, 'jsmith', 'jane@doe.com'));
    }

    public function testCheckUniqueIdentity_otherCaseUsername_UsernameExists()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('usernameExists', UserCommands::checkUniqueIdentity($zedUser, 'JSMITH', 'zed@example.com'));
    }

    public function testCheckUniqueIdentity_otherCaseEmail_EmailExists()
    {
        $zedId = self::$environ->createUser('zedUser', 'zed user','zed@example.com');
        self::$environ->createUser('jsmith', 'joe smith','joe@smith.com');

        $zedUser = new UserModel($zedId);

        $this->assertEquals('emailExists', UserCommands::checkUniqueIdentity($zedUser, 'zedUser', 'JOE@SMITH.COM'));
    }

    public function testCreateUser_NewUser_NotFalse()
    {
        // setup parameters
        $params = [
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password'
        ];

        $this->assertNotFalse('login', UserCommands::createUser($params, self::$environ->website));
    }

    public function testCreateUser_SameUser_SameID()
    {
        $params = [
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password'
        ];
        $userId = UserCommands::createUser($params, self::$environ->website);
        $this->assertEquals($userId, UserCommands::createUser($params, self::$environ->website));
    }

    public function testCreateUser_EmailInUse_False()
    {
        // setup parameters
        $params = [
            'name' => 'user 1',
            'email' => 'name@example.com',
            'password' => 'password'
        ];
        UserCommands::createUser($params, self::$environ->website);
        $params['password'] = 'differentPassword';

        $this->assertFalse(UserCommands::createUser($params, self::$environ->website));
    }

    public function testCreateSimple_CreateUser_PasswordAndJoinProject()
    {
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

        // setup parameters: name and project
        $name = 'User Name';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $currentUserId = self::$environ->createUser('test1', 'test1', 'test@test.com');

        // create user
        UserCommands::createSimple($name, $projectId, $currentUserId, self::$environ->website);

        // create user again
        UserCommands::createSimple($name, $projectId, $currentUserId, self::$environ->website);
    }

    // TODO: Register within a project context
    public function testRegister_WithProjectCode_UserInProjectAndProjectHasUser()
    {
        $this->markTestIncomplete('TODO: implement this');
    }

    public function testRegister_NoProjectCode_UserInNoProjects()
    {
        $validCode = 'validCode';
        $params = [
                'id' => '',
                'username' => 'someusername',
                'name' => 'Some Name',
                'email' => 'someone@example.com',
                'password' => 'somepassword',
                'captcha' => $validCode
        ];
        $captcha_info = ['code' => $validCode];

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
        $validCode = 'validCode';
        $invalidCode = 'invalidCode';
        $params = [
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => 'someone@example.com',
            'password' => 'somepassword',
            'captcha' => $invalidCode
        ];
        $captcha_info = ['code' => $validCode];

        $delivery = new MockUserCommandsDelivery();
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'captchaFail');
    }

    public function testRegister_EmailInUsePasswordExists_EmailNotAvailable()
    {
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
        $params = [
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => $takenEmail,
            'password' => 'somepassword',
            'captcha' => $validCode
        ];
        $captcha_info = ['code' => $validCode];
        $delivery = new MockUserCommandsDelivery();

        // Attempt to register
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'emailNotAvailable');
    }

    public function testRegister_EmailInUseNoPassword_Login()
    {
        // setup parameters: user 'test1'
        $takenEmail = 'test@test.com';
        self::$environ->createUser('test1', 'test1', $takenEmail);

        $validCode = 'validCode';
        $params = [
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => $takenEmail,
            'password' => 'somepassword',
            'captcha' => $validCode
        ];
        $captcha_info = ['code' => $validCode];
        $delivery = new MockUserCommandsDelivery();

        // Attempt to register
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'login');
    }

    public function testRegister_NewUser_Login()
    {
        $validCode = 'validCode';
        $params = [
            'id' => '',
            'username' => 'anotherusername',
            'name' => 'Another Name',
            'email' => 'another@example.com',
            'password' => 'anotherpassword',
            'captcha' => $validCode
        ];
        $captcha_info = ['code' => $validCode];
        self::$environ->createUser('someusername', 'Some Name', 'someone@example.com');

        $delivery = new MockUserCommandsDelivery();
        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals($result, 'login');
    }

    public function testRegister_CrossSiteEnabled_UserHasSiteRole()
    {
        $validCode = 'validCode';
        $params = [
            'id' => '',
            'username' => 'jsmith',
            'name' => 'joe smith',
            'email' => 'joe@smith.com',
            'password' => 'somepassword',
            'captcha' => $validCode
        ];
        $website = Website::get(self::CROSS_SITE_DOMAIN);
        $captcha_info = ['code' => $validCode];
        $delivery = new MockUserCommandsDelivery();
        // Register user to default website
        UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);
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
        $inviterUserId = self::$environ->createUser("inviteruser", "Inviter Name", "inviter@example.com");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $validCode = 'validCode';
        $captcha_info = ['code' => $validCode];
        $params = [
            'id' => '',
            'username' => 'jsmith',
            'name' => 'joe smith',
            'email' => 'joe@smith.com',
            'password' => 'somepassword',
            'captcha' => $validCode
        ];

        $toUserId = UserCommands::sendInvite($project->id->asString(), $inviterUserId, self::$environ->website, $params['email'], $delivery);
        $joeUser = new UserModel($toUserId);
        $this->assertEquals($joeUser->active, null);
        $this->assertNull($joeUser->active);

        UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $joeUser = new UserModel($toUserId);
        $this->assertTrue($joeUser->active);
    }

    public function testSendInvite_SendInvite_PropertiesFromToBodyOk()
    {
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
        $expectedFrom = [$senderEmail => self::$environ->website->name];
        $expectedTo = [$toUser->emailPending => $toUser->name];
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/Inviter Name/', $delivery->content);
        $this->assertRegExp('/Test Project/', $delivery->content);
    }

    public function testChangePassword_SystemAdminChangeOtherUser_Succeeds()
    {
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
