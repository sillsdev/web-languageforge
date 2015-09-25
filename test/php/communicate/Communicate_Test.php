<?php

use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Communicate\Communicate;
use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Website;
use Api\Model\MessageModel;
use Api\Model\UserModel;
use Api\Model\UserProfileModel;
use Api\Model\UnreadMessageModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

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

class TestCommunicate extends UnitTestCase
{
    public function testCommunicateToUser_SendEmail_PropertiesToFromMessageOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserProfileModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
        $subject = 'TestSubject';
        $project->emailSettings->fromAddress = 'projectName@scriptureforge.org';
        $project->emailSettings->fromName = 'Scripture Forge ProjectName';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        // What's in the delivery?
        $expectedFrom = array($project->emailSettings->fromAddress => $project->emailSettings->fromName);
        $expectedTo = array($user->email => $user->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertEqual($subject, $delivery->subject);
        $this->assertEqual($emailTemplate, $delivery->content);

    }

    public function testCommunicateToUser_SendSms_PropertiesToFromMessageProviderInfoOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserProfileModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_SMS;
        $user->mobile_phone = '+66837610205';
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
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
        $this->assertEqual($expectedTo, $delivery->smsModel->to);
        $this->assertEqual($expectedFrom, $delivery->smsModel->from);
        $this->assertEqual($smsTemplate, $delivery->smsModel->message);
        $this->assertEqual(SmsModel::SMS_TWILIO, $delivery->smsModel->provider);  // expected to be set by default
        $this->assertEqual($expectedProviderInfo, $delivery->smsModel->providerInfo);

    }

    public function testCommunicateToUsers_SendEmail_BroadcastMessageStoredAndUnread()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->communicate_via = UserModel::COMMUNICATE_VIA_EMAIL;
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
        $subject = 'TestSubject';
        $project->emailSettings->fromAddress = 'projectName@scriptureforge.org';
        $project->emailSettings->fromName = 'Scripture Forge ProjectName';
        $smsTemplate = '';
        $emailTemplate = 'TestMessage';
        $delivery = new MockCommunicateDelivery();

        Communicate::communicateToUsers(array($user), $project, $subject, $smsTemplate, $emailTemplate, '', $delivery);

        $unread = new UnreadMessageModel($userId, $project->id->asString());
        $messageIds = $unread->unreadItems();
        $this->assertEqual(count($messageIds), 1);

        $messageId = $messageIds[0];
        $message = new MessageModel($project, $messageId);
        $this->assertEqual($message->subject, $subject);
        $this->assertEqual($message->content, $emailTemplate);
    }

    public function testSendSignup_NoDefaultProject_PropertiesToFromBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();
        $website = Website::get('scriptureforge.org');

        Communicate::sendSignup($user, $website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($user->emailPending => $user->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertNoPattern('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertPattern('/Name/', $delivery->content);
        $this->assertPattern('/' . $user->validationKey . '/', $delivery->content);
        $this->assertNoPattern('/' . SF_TESTPROJECT . '/', $delivery->content);
    }

    public function testSendSignup_WithProject_PropertiesToFromBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->projectCode = 'test_project';
        $project->write();
        $delivery = new MockCommunicateDelivery();
        $website = Website::get('scriptureforge.org');
        $website->defaultProjectCode = 'test_project';

        Communicate::sendSignup($user, $website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedTo = array($user->emailPending => $user->name);
        $this->assertPattern('/' . $e->website->name . '/', $delivery->from[$senderEmail]);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/' . $e->website->name . '/', $delivery->subject);
        $this->assertPattern('/Name/', $delivery->content);
        $this->assertPattern('/' . $user->validationKey . '/', $delivery->content);
    }

    public function testSendInvite_PropertiesFromToBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $inviterUserId = $e->createUser('inviterUser', 'Inviter User', 'inviter@example.com');
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = $e->createUser('touser', 'To Name', '');
        $toUser = new UserModel($toUserId);
        $toUser->emailPending = 'toname@example.com';
        $toUser->write();
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendInvite($inviterUser, $toUser, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($toUser->emailPending => $toUser->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/account signup validation/', $delivery->subject);
        $this->assertPattern('/Inviter User/', $delivery->content);
        $this->assertPattern('/' . $e->website->domain . '\/registration/', $delivery->content);
    }

    public function testSendNewUserInProject_PropertiesFromToBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $toUserId = $e->createUser('touser', 'To Name', 'toname@example.com');
        $toUser = new UserModel($toUserId);
        $newUserName = 'newusername';
        $newUserPassword = 'password';
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendNewUserInProject($toUser, $newUserName, $newUserPassword, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($toUser->email => $toUser->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/To Name/', $delivery->content);
        $this->assertPattern('/' . $newUserName . '/', $delivery->content);
        $this->assertPattern('/' . $newUserPassword . '/', $delivery->content);
    }

    public function testSendAddedToProject_PropertiesFromToBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $inviterUserId = $e->createUser('inviterUser', 'Inviter User', 'inviter@example.com');
        $inviterUser = new UserModel($inviterUserId);
        $toUserId = $e->createUser('touser', 'To Name', 'toname@example.com');
        $toUser = new UserModel($toUserId);
        $project = $e->createProjectSettings(SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($inviterUserId, $e->website->userDefaultSiteRole);
        $project->write();
        $inviterUser->addProject($project->id->asString());
        $inviterUser->write();

        Communicate::sendAddedToProject($inviterUser, $toUser, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($toUser->email => $toUser->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/To Name.*\n*Inviter User/', $delivery->content);
    }

    public function testSendForgotPasswordVerification_PropertiesFromToBodyOk()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendForgotPasswordVerification($user, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/' . $e->website->name . '/', $delivery->subject);
        $this->assertNoPattern('/<p>/', $delivery->content);
        $this->assertPattern('/Name/', $delivery->content);
        $this->assertPattern('/' . $user->resetPasswordKey . '/', $delivery->content);
        $this->assertPattern('/<p>/', $delivery->htmlContent);
        $this->assertPattern('/Name/', $delivery->htmlContent);
        $this->assertPattern('/' . $user->resetPasswordKey . '/', $delivery->htmlContent);
    }

    public function testSendJoinRequestConfirmation_PropertiesFromToBodyOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestConfirmation($user, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertPattern('/' . $e->website->name . '/', $delivery->subject);
        $this->assertPattern('/have requested/', $delivery->content);
        $this->assertPattern('/' . SF_TESTPROJECT . '/', $delivery->content);
    }

    public function testSendJoinRequest_PropertiesFromToBodyOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();
        $adminId = $e->createUser('admin', 'Admin', 'admin@example.com');
        $admin = new UserModel($adminId);
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();
        $project->addUser($adminId, $e->website->userDefaultSiteRole);
        $project->write();
        $admin->addProject($project->id->asString());
        $admin->write();

        Communicate::sendJoinRequest($user, $admin, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($admin->email => $admin->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/' . $user->name . '/', $delivery->subject);
        $this->assertPattern('/' . $e->website->domain . '\/app\/usermanagement/', $delivery->content);
    }

    public function testSendJoinRequestAccepted_PropertiesFromToBodyOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $delivery = new MockCommunicateDelivery();

        Communicate::sendJoinRequestAccepted($user, $project, $e->website, $delivery);

        // What's in the delivery?
        $senderEmail = 'no-reply@' . $e->website->domain;
        $expectedFrom = array($senderEmail => $e->website->name);
        $expectedTo = array($user->email => $user->name);
        $this->assertEqual($expectedFrom, $delivery->from);
        $this->assertEqual($expectedTo, $delivery->to);
        $this->assertPattern('/' . SF_TESTPROJECT . '/', $delivery->subject);
        $this->assertPattern('/' . $e->website->name . '/', $delivery->subject);
        $this->assertPattern('/' . SF_TESTPROJECT . '/', $delivery->content);
        $this->assertPattern('/has been accepted/', $delivery->content);
        $this->assertPattern('/' . $e->website->domain . '\/app\/semdomtrans/', $delivery->content);
    }
}
