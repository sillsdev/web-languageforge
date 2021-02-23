<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Website;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
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

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$save = [];
    }

    protected function setUp(): void
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
        ini_set('display_errors', '0'); // do not show xdebug stack traces in PHPUnit output
        UserCommands::deleteUsers(null);
        ini_set('display_errors', '1'); // do not show xdebug stack traces in PHPUnit output
    }

    /** @throws Exception */
    public function testBanUser_NoId_Exception()
    {
        $this->expectException(Exception::class);

        ini_set('display_errors', '0'); // do not show xdebug stack traces in PHPUnit output
        UserCommands::banUser(null);
        ini_set('display_errors', '1'); // do not show xdebug stack traces in PHPUnit output
    }

    /** @throws Exception */
    public function testBanUser_BadId_Exception()
    {
        $this->expectException(Exception::class);
        UserCommands::banUser('notAnId');
    }

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
    public function testUpdateUserProfile_SetLangCodeOnly_LangCodeSet()
    {
        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $params = [
            'interfaceLanguageCode' => 'th'
        ];

        $newUserId = UserCommands::updateUserProfile($params, $userId, self::$environ->website);

        // user profile updated
        $user = new UserModel($newUserId);
        $this->assertEquals('th', $user->interfaceLanguageCode);
        $this->assertEquals($newUserId, $userId);
    }

    /**
     * @throws Exception
     */
    public function testUpdateUserProfile_SetProjectUserProfiles_ProjectUserProfilesSet()
    {
        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        ProjectCommands::updateUserRole($projectId, $userId);
        $params = [
            'projectUserProfiles' => [
                $projectId => [
                    'city' => '',
                    'preferredBibleVersion' => '',
                    'religiousAffiliation' => '',
                    'studyGroup' => 'group1',
                    'feedbackGroup' => ''
                ]
            ]
        ];

        $newUserId = UserCommands::updateUserProfile($params, $userId, self::$environ->website);

        // user profile updated
        $user = new UserModel($newUserId);
        $this->assertCount(1, $user->projectUserProfiles);
        $this->assertEquals('group1', $user->projectUserProfiles[$projectId]->studyGroup);
        $this->assertEquals($newUserId, $userId);
    }

    public function testUpdateUser_SetLangCodeOnly_LangCodeSet()
    {
        // setup parameters
        $userId = self::$environ->createUser('username', 'name', 'name@example.com');
        $params = [
            'id' => $userId,
            'interfaceLanguageCode' => 'th'
        ];

        $newUserId = UserCommands::updateUser($params, self::$environ->website);

        // user updated
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
    public function testRegister_InviteUser_Login()
    {
        // setup parameters: user 'test1'
        $takenEmail = 'test@example.com';
        $invitedUserId = self::$environ->createUser('test1', 'test1', $takenEmail);
        $invitedUser = new UserModel($invitedUserId);
        $invitedUser->isInvited = true;
        $invitedUser->active = false;
        $invitedUser->write();

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

        $this->assertEquals('login', $result);
    }

    /** @throws Exception */
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

    /** @throws Exception */
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

    /** @throws Exception */
    public function testRegister_ExistingGoogleUser_Deny()
    {
        $gmail = 'someone@gmail.com';
        $validCode = 'validCode';
        $params = [
            'id' => '',
            'username' => 'someusername',
            'name' => 'Some Name',
            'email' => $gmail,
            'password' => 'anotherpassword',
            'captcha' => $validCode
        ];
        $captcha_info = ['code' => $validCode];
        self::$environ->createUser('someusername', 'Some Name', $gmail);
        $delivery = new MockUserCommandsDelivery();

        $result = UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $this->assertEquals('emailNotAvailable', $result);
    }

    /** @throws Exception */
    public function testSendInvite_Register_UserActive()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::MANAGER);
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

        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $params['email'], $delivery);
        $joeUser = new UserModel($toUserId);
        $this->assertEquals($joeUser->active, null);
        $this->assertNull($joeUser->active);

        UserCommands::register($params, self::$environ->website, $captcha_info, $delivery);

        $joeUser = new UserModel($toUserId);
        $this->assertTrue($joeUser->active);
    }

    /** @throws Exception */
    public function testSendInvite_InvitedUserDoesNotExist_PropertiesFromToBodyOk()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::MANAGER);
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUserId);
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = [$senderEmail => self::$environ->website->name];
        $expectedTo = [$toUser->emailPending => $toUser->name];
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/Inviting Name/', $delivery->content);
        $this->assertRegExp('/Test Project/', $delivery->content);
    }

    /** @throws Exception */
    public function testSendInvite_InvitedUserExists_PropertiesFromToBodyOk()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $someoneUserId = self::$environ->createUser('someone', 'Someone', $toEmail);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::MANAGER);
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUserId);
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = [$senderEmail => self::$environ->website->name];
        $expectedTo = [$toUser->email => $toUser->name];
        $this->assertEquals($someoneUserId, $toUserId);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/Inviting Name/', $delivery->content);
        $this->assertRegExp('/Test Project/', $delivery->content);
    }

    /** @throws Exception */
    public function testSendInvite_InvitedUserDoesNotExistAndSendInviteTwice_PropertiesFromToBodyOk()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::MANAGER);
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUser1Id = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);
        $delivery = new MockUserCommandsDelivery();
        $toUser2Id = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $toUser = new UserModel($toUser2Id);
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = [$senderEmail => self::$environ->website->name];
        $expectedTo = [$toUser->emailPending => $toUser->name];
        $this->assertEquals($toUser1Id, $toUser2Id);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/Inviting Name/', $delivery->content);
        $this->assertRegExp('/Test Project/', $delivery->content);
        $this->assertRegExp('/public\/signup#!\/\?e=' . urlencode($toUser->emailPending) . '/', $delivery->content);
    }

    /** @throws Exception */
    public function testSendInvite_InvitedUserExistsAndSendInviteTwice_EmailNotSent()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $someoneUserId = self::$environ->createUser('someone', 'Someone', $toEmail);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::MANAGER);
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUser1Id = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);
        $delivery = new MockUserCommandsDelivery();
        $toUser2Id = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery);

        // What's in the delivery?
        $this->assertEquals($someoneUserId, $toUser1Id);
        $this->assertEmpty($toUser2Id);
        $this->assertEmpty($delivery->content);
    }

    public function testSendInvite_InvitingUserLacksAuthorityToInviteManager()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::CONTRIBUTOR);
        $project->allowSharing = true;
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $this->expectException(Exception::class);
        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery, ProjectRoles::MANAGER);
    }

    public function testSendInvite_NonManagerMembersCannotShareByDefault()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::CONTRIBUTOR);
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $this->expectException(Exception::class);
        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery, ProjectRoles::CONTRIBUTOR);
    }

    public function testSendInvite_NonManagerMembersCanShareIfAllowSharingIsEnabled()
    {
        $invitingUserId = self::$environ->createUser('invitinguser', 'Inviting Name', 'inviting@example.com');
        $toEmail = 'someone@example.com';
        $someoneUserId = self::$environ->createUser('someone', 'Someone', $toEmail);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'someProjectCode';
        $project->addUser($invitingUserId, ProjectRoles::CONTRIBUTOR);
        $project->allowSharing = true;
        $project->write();
        $delivery = new MockUserCommandsDelivery();

        $toUserId = UserCommands::sendInvite($project->id->asString(), $invitingUserId, self::$environ->website, $toEmail, $delivery, ProjectRoles::CONTRIBUTOR);
        $this->assertEquals($someoneUserId, $toUserId);
    }

    /** @throws Exception */
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
        $userWithPassword = new UserModelWithPassword($userId);
        $result = $userWithPassword->verifyPassword('somepass');
        $this->assertTrue($result, 'Could not verify changed password');
    }

    public function testUserTypeaheadList_SearchForUserByUsername_OneResult()
    {
        self::$environ->createUser('bob', 'Bob', 'bob@example.com');

        $list = UserCommands::userTypeaheadList('bob', '', self::$environ->website);
        $this->assertEquals(1, $list->totalCount);
    }

    public function testUserTypeaheadList_SearchForUserByPartialEmail_NoResults()
    {
        self::$environ->createUser('bob', 'Bob', 'bob@example.com');

        $list = UserCommands::userTypeaheadList('bob@e', '', self::$environ->website);
        $this->assertEquals([], $list->entries);
    }

    public function testUserTypeaheadList_SearchForUserByCompleteEmail_OneResult()
    {
        self::$environ->createUser('bob', 'Bob', 'bob@example.com');

        $list = UserCommands::userTypeaheadList('bob@example.com', '', self::$environ->website);
        $this->assertEquals(1, $list->totalCount);
        $this->assertFalse(array_key_exists('email', $list->entries[0]), 'Email should not be returned.');
    }
}
