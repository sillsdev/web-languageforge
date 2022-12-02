<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Communicate\Communicate;
use Api\Model\Shared\MessageModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadMessageModel;
use Api\Model\Shared\Rights\SiteRoles;
use PHPUnit\Framework\TestCase;

class MockCommunicateDelivery implements DeliveryInterface
{
    public $from;
    public $to;
    public $subject;
    public $content;
    public $htmlContent;
    public $smsModel;

    public function sendEmail($from, $to, $subject, $content, $htmlContent = "")
    {
        $this->from = $from;
        $this->to = $to;
        $this->subject = $subject;
        $this->content = $content;
        $this->htmlContent = $htmlContent;
    }
}

class CommunicateTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
    }

    public function testSendSignup_NoDefaultProject_PropertiesToFromBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendVerifyEmail($user, $delivery);

        // What's in the delivery?
        $expectedTo = [$user->email => $user->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertNotRegExp("/" . SF_TESTPROJECT . "/", $delivery->subject);
        $this->assertRegExp("/Name/", $delivery->content);
        $this->assertRegExp("/" . $user->validationKey . "/", $delivery->content);
        $this->assertNotRegExp("/" . SF_TESTPROJECT . "/", $delivery->content);
    }

    public function testSendSignup_WithProject_PropertiesToFromBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = "test_project";
        $project->write();
        $delivery = new MockCommunicateDelivery();

        Communicate::sendVerifyEmail($user, $delivery);

        // What's in the delivery?
        $expectedTo = [$user->email => $user->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/Language Forge/", $delivery->subject);
        $this->assertRegExp("/Name/", $delivery->content);
        $this->assertRegExp("/" . $user->validationKey . "/", $delivery->content);
    }

    public function testSendInvite_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $inviterUserId = self::$environ->createUser("inviterUser", "Inviter User", "inviter@example.com");
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = self::$environ->createUser("touser", "To Name", "");
        $toUser = new UserModel($toUserId);
        $toUser->email = "toname+test@example.com";
        $toUser->write();
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendInvite($inviterUser, $toUser, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$toUser->email => $toUser->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/Inviter User/", $delivery->content);
        $this->assertRegExp("/\/public\/signup#!\/\?e=" . urlencode($toUser->email) . "/", $delivery->content);
        $this->assertRegExp("/The Language Forge Team/", $delivery->content);
    }

    public function testSendNewUserInProject_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $toUserId = self::$environ->createUser("touser", "To Name", "toname@example.com");
        $toUser = new UserModel($toUserId);
        $newUserName = "newusername";
        $newUserPassword = "password";
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendNewUserInProject($toUser, $newUserName, $newUserPassword, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$toUser->email => $toUser->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/To Name/", $delivery->content);
        $this->assertRegExp("/" . $newUserName . "/", $delivery->content);
        $this->assertRegExp("/" . $newUserPassword . "/", $delivery->content);
    }

    public function testSendAddedToProject_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $inviterUserId = self::$environ->createUser("inviterUser", "Inviter User", "inviter@example.com");
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = self::$environ->createUser("touser", "To Name", "toname@example.com");
        $toUser = new UserModel($toUserId);
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($inviterUserId, SiteRoles::PROJECT_CREATOR);
        $project->write();
        $inviterUser->addProject($project->id->asString());
        $inviterUser->write();

        Communicate::sendAddedToProject($inviterUser, $toUser, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$toUser->email => $toUser->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/To Name.*\n*Inviter User/', $delivery->content);
    }

    public function testSendForgotPasswordVerification_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendForgotPasswordVerification($user, $delivery);

        // What's in the delivery?
        $expectedTo = [$user->email => $user->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertNotRegExp("/<p>/", $delivery->content);
        $this->assertRegExp("/Name/", $delivery->content);
        $this->assertRegExp("/" . $user->resetPasswordKey . "/", $delivery->content);
        $this->assertRegExp("/<p>/", $delivery->htmlContent);
        $this->assertRegExp("/Name/", $delivery->htmlContent);
        $this->assertRegExp("/" . $user->resetPasswordKey . "/", $delivery->htmlContent);
    }

    public function testSendJoinRequestConfirmation_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestConfirmation($user, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$user->email => $user->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/" . SF_TESTPROJECT . "/", $delivery->subject);
        $this->assertRegExp("/have requested/", $delivery->content);
        $this->assertRegExp("/" . SF_TESTPROJECT . "/", $delivery->content);
    }

    public function testSendJoinRequest_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $adminId = self::$environ->createUser("admin", "Admin", "admin@example.com");
        $admin = new UserModel($adminId);
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($adminId, SiteRoles::PROJECT_CREATOR);
        $project->write();
        $admin->addProject($project->id->asString());
        $admin->write();

        Communicate::sendJoinRequest($user, $admin, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$admin->email => $admin->name];
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/" . $user->name . "/", $delivery->subject);
    }

    public function testSendJoinRequestAccepted_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestAccepted($user, $project, $delivery);

        // What's in the delivery?
        $expectedTo = [$user->email => $user->name];
        $expectedLink = "\/app\/" . self::$environ->project->appName;
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp("/" . SF_TESTPROJECT . "/", $delivery->subject);
        $this->assertRegExp("/" . SF_TESTPROJECT . "/", $delivery->content);
        $this->assertRegExp("/has been accepted/", $delivery->content);
        $this->assertRegExp("/$expectedLink/", $delivery->content);
    }
}
