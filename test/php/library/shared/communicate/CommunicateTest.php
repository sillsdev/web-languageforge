<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Communicate\Communicate;
use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Website;
use Api\Model\Shared\MessageModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadMessageModel;
use PHPUnit\Framework\TestCase;

class MockCommunicateDelivery implements DeliveryInterface
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

class CommunicateTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
    }

    public function testCommunicateToUser_NoFromAddress_Exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('\'email from address\' should not evaluate to false');

        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $project->emailSettings->fromAddress = '';
        $subject = 'TestSubject';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        // nothing runs in the current test function after an exception. IJH 2016-07
    }

    public function testCommunicateToUser_NoToAddress_Exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('\'email to address\' should not evaluate to false');

        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', '');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $project->emailSettings->fromAddress = 'from@example.com';
        $subject = 'TestSubject';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        // nothing runs in the current test function after an exception. IJH 2016-07
    }

    public function testCommunicateToUser_SendEmail_PropertiesToFromMessageOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $project->emailSettings->fromAddress = 'projectName@scriptureforge.org';
        $project->emailSettings->fromName = 'Scripture Forge ProjectName';
        $subject = 'TestSubject';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        // What's in the delivery?
        $expectedFrom = array($project->emailSettings->fromAddress => $project->emailSettings->fromName);
        $expectedTo = array($user->email => $user->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertEquals($subject, $delivery->subject);
        $this->assertEquals($emailTemplate, $delivery->content);
    }

    public function testCommunicateToUser_SendSms_PropertiesToFromMessageProviderInfoOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_SMS;
        $user->mobile_phone = '+66837610205';
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $project->smsSettings->fromNumber = '13852904211';
        $project->smsSettings->accountId = 'ACc03c2767c2c9c138bde0aa0b30ac9d6e';
        $project->smsSettings->authToken = 'be77f02cd3b6b13d3b42d8a64050fd35';
        $subject = '';
        $smsTemplate = 'Test message';
        $emailTemplate = '';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        // What's in the delivery?
        $expectedTo = $user->mobile_phone;
        $expectedFrom = $project->smsSettings->fromNumber;
        $expectedProviderInfo = $project->smsSettings->accountId . '|' . $project->smsSettings->authToken;
        $this->assertEquals($expectedTo, $delivery->smsModel->to);
        $this->assertEquals($expectedFrom, $delivery->smsModel->from);
        $this->assertEquals($smsTemplate, $delivery->smsModel->message);
        $this->assertEquals(SmsModel::SMS_TWILIO, $delivery->smsModel->provider);  // expected to be set by default
        $this->assertEquals($expectedProviderInfo, $delivery->smsModel->providerInfo);
    }

    public function testCommunicateToUsers_SendEmail_BroadcastMessageStoredAndUnread()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $project->emailSettings->fromAddress = 'projectName@scriptureforge.org';
        $project->emailSettings->fromName = 'Scripture Forge ProjectName';
        $subject = 'TestSubject';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUsers(array($user), $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        $unread = new UnreadMessageModel($userId, $project->id->asString());
        $messageIds = $unread->unreadItems();
        $this->assertCount(1, $messageIds);

        $messageId = $messageIds[0];
        $message = new MessageModel($project, $messageId);
        $this->assertEquals($subject, $message->subject);
        $this->assertEquals($emailTemplate, $message->content);
    }

    public function testSendSignup_NoDefaultProject_PropertiesToFromBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();
        $website = Website::get('scriptureforge.org');

        Communicate::sendVerifyEmail($user, $website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertNotRegExp('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertRegExp('/Name/', $delivery->content);
        $this->assertRegExp('/' . $user->validationKey . '/', $delivery->content);
        $this->assertNotRegExp('/' . SF_TESTPROJECT . '/', $delivery->content);
    }

    public function testSendSignup_WithProject_PropertiesToFromBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'test_project';
        $project->write();
        $delivery = new MockCommunicateDelivery();
        $website = Website::get('scriptureforge.org');
        $website->defaultProjectCode = 'test_project';

        Communicate::sendVerifyEmail($user, $website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedTo = array($user->email => $user->name);
        $this->assertRegExp('/' . self::$environ->website->name . '/', $delivery->from[$senderEmail]);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . self::$environ->website->name . '/', $delivery->subject);
        $this->assertRegExp('/Name/', $delivery->content);
        $this->assertRegExp('/' . $user->validationKey . '/', $delivery->content);
    }

    public function testSendInvite_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $inviterUserId = self::$environ->createUser('inviterUser', 'Inviter User', 'inviter@example.com');
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = self::$environ->createUser('touser', 'To Name', '');
        $toUser = new UserModel($toUserId);
        $toUser->email = 'toname+test@example.com';
        $toUser->write();
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendInvite($inviterUser, $toUser, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($toUser->email => $toUser->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . self::$environ->website->name . ' invitation/', $delivery->subject);
        $this->assertRegExp('/Inviter User/', $delivery->content);
        $this->assertRegExp('/' . self::$environ->website->domain . '\/public\/signup#!\/\?e=' .
            urlencode($toUser->email) . '/', $delivery->content);
        $this->assertRegExp('/The ' . self::$environ->website->name . ' Team/', $delivery->content);
    }

    public function testSendNewUserInProject_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $toUserId = self::$environ->createUser('touser', 'To Name', 'toname@example.com');
        $toUser = new UserModel($toUserId);
        $newUserName = 'newusername';
        $newUserPassword = 'password';
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendNewUserInProject($toUser, $newUserName, $newUserPassword, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($toUser->email => $toUser->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/To Name/', $delivery->content);
        $this->assertRegExp('/' . $newUserName . '/', $delivery->content);
        $this->assertRegExp('/' . $newUserPassword . '/', $delivery->content);
    }

    public function testSendAddedToProject_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $inviterUserId = self::$environ->createUser('inviterUser', 'Inviter User', 'inviter@example.com');
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = self::$environ->createUser('touser', 'To Name', 'toname@example.com');
        $toUser = new UserModel($toUserId);
        $project = self::$environ->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($inviterUserId, self::$environ->website->userDefaultSiteRole);
        $project->write();
        $inviterUser->addProject($project->id->asString());
        $inviterUser->write();

        Communicate::sendAddedToProject($inviterUser, $toUser, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($toUser->email => $toUser->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/To Name.*\n*Inviter User/', $delivery->content);
    }

    public function testSendForgotPasswordVerification_PropertiesFromToBodyOk()
    {
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendForgotPasswordVerification($user, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . self::$environ->website->name . '/', $delivery->subject);
        $this->assertNotRegExp('/<p>/', $delivery->content);
        $this->assertRegExp('/Name/', $delivery->content);
        $this->assertRegExp('/' . $user->resetPasswordKey . '/', $delivery->content);
        $this->assertRegExp('/<p>/', $delivery->htmlContent);
        $this->assertRegExp('/Name/', $delivery->htmlContent);
        $this->assertRegExp('/' . $user->resetPasswordKey . '/', $delivery->htmlContent);
    }

    public function testSendJoinRequestConfirmation_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestConfirmation($user, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertRegExp('/' . self::$environ->website->name . '/', $delivery->subject);
        $this->assertRegExp('/have requested/', $delivery->content);
        $this->assertRegExp('/' . SF_TESTPROJECT . '/', $delivery->content);
    }

    public function testSendJoinRequest_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $adminId = self::$environ->createUser('admin', 'Admin', 'admin@example.com');
        $admin = new UserModel($adminId);
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($adminId, self::$environ->website->userDefaultSiteRole);
        $project->write();
        $admin->addProject($project->id->asString());
        $admin->write();

        Communicate::sendJoinRequest($user, $admin, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($admin->email => $admin->name);
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . $user->name . '/', $delivery->subject);
        $this->assertRegExp('/' . self::$environ->website->domain . '\/app\/usermanagement/', $delivery->content);
    }

    public function testSendJoinRequestAccepted_PropertiesFromToBodyOk()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestAccepted($user, $project, self::$environ->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . self::$environ->website->domain;
        $expectedFrom = array($senderEmail => self::$environ->website->name);
        $expectedTo = array($user->email => $user->name);
        $expectedLink = self::$environ->website->domain . '\/app\/' . self::$environ->project->appName;
        $this->assertEquals($expectedFrom, $delivery->from);
        $this->assertEquals($expectedTo, $delivery->to);
        $this->assertRegExp('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertRegExp('/' . self::$environ->website->name . '/', $delivery->subject);
        $this->assertRegExp('/' . SF_TESTPROJECT . '/', $delivery->content);
        $this->assertRegExp('/has been accepted/', $delivery->content);
        $this->assertRegExp("/$expectedLink/", $delivery->content);
    }
}
