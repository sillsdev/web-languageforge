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
        $this->assertDoesNotMatchRegularExpression("/" . SF_TESTPROJECT . "/", $delivery->subject);
        $this->assertMatchesRegularExpression("/Name/", $delivery->content);
        $this->assertMatchesRegularExpression("/" . $user->validationKey . "/", $delivery->content);
        $this->assertDoesNotMatchRegularExpression("/" . SF_TESTPROJECT . "/", $delivery->content);
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
        $this->assertMatchesRegularExpression("/Language Forge/", $delivery->subject);
        $this->assertMatchesRegularExpression("/Name/", $delivery->content);
        $this->assertMatchesRegularExpression("/" . $user->validationKey . "/", $delivery->content);
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
        $this->assertMatchesRegularExpression("/Inviter User/", $delivery->content);
        $this->assertMatchesRegularExpression(
            "/\/public\/signup#!\/\?e=" . urlencode($toUser->email) . "/",
            $delivery->content
        );
        $this->assertMatchesRegularExpression("/The Language Forge Team/", $delivery->content);
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
        $this->assertMatchesRegularExpression("/To Name/", $delivery->content);
        $this->assertMatchesRegularExpression("/" . $newUserName . "/", $delivery->content);
        $this->assertMatchesRegularExpression("/" . $newUserPassword . "/", $delivery->content);
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
        $this->assertMatchesRegularExpression('/To Name.*\n*Inviter User/', $delivery->content);
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
        $this->assertDoesNotMatchRegularExpression("/<p>/", $delivery->content);
        $this->assertMatchesRegularExpression("/Name/", $delivery->content);
        $this->assertMatchesRegularExpression("/" . $user->resetPasswordKey . "/", $delivery->content);
        $this->assertMatchesRegularExpression("/<p>/", $delivery->htmlContent);
        $this->assertMatchesRegularExpression("/Name/", $delivery->htmlContent);
        $this->assertMatchesRegularExpression("/" . $user->resetPasswordKey . "/", $delivery->htmlContent);
    }
}
