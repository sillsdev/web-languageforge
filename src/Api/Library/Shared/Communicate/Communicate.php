<?php

namespace Api\Library\Shared\Communicate;

use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Communicate\Sms\SmsQueue;
use Api\Library\Shared\Website;
use Api\Model\MessageModel;
use Api\Model\ProjectModel;
use Api\Model\ProjectSettingsModel;
use Api\Model\UserModel;
use Api\Model\UserProfileModel;
use Api\Model\UnreadMessageModel;

class Communicate
{
    /**
     *
     * @param array $users array<UserModel>
     * @param ProjectSettingsModel $project
     * @param string $subject
     * @param string $smsTemplate
     * @param string $emailTemplate
     * @param DeliveryInterface|null $delivery
     * @return string
     */
    public static function communicateToUsers($users, $project, $subject, $smsTemplate, $emailTemplate, DeliveryInterface $delivery = null)
    {
        // store message in database
        $messageModel = new MessageModel($project);
        $messageModel->subject = $subject;
        $messageModel->content = $emailTemplate;
        $messageId = $messageModel->write();

        foreach ($users as $user) {
            self::communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, $delivery);
            $unreadModel = new UnreadMessageModel($user->id->asString(), $project->id->asString());
            $unreadModel->markUnread($messageId);
            $unreadModel->write();
        }
        SmsQueue::processQueue($project->databaseName());

        return $messageId;
    }

    /**
     *
     * @param UserProfileModel $user
     * @param ProjectSettingsModel $project
     * @param string $subject
     * @param string $smsTemplate
     * @param string $emailTemplate
     * @param DeliveryInterface $delivery
     */
    public static function communicateToUser($user, $project, $subject, $smsTemplate, $emailTemplate, DeliveryInterface $delivery = null)
    {
        // Prepare the email message if required
        if ($user->communicate_via == UserModel::COMMUNICATE_VIA_EMAIL || $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH) {
            $from = array($project->emailSettings->fromAddress => $project->emailSettings->fromName);
            $to = array($user->email => $user->name);
            $vars = array(
                    'user' => $user,
                    'project' => $project
            );
            $template = CommunicateHelper::templateFromString($emailTemplate);
            $content = $template->render($vars);

            CommunicateHelper::deliverEmail($from, $to, $subject, $content, $delivery);
        }

        // Prepare the sms message if required
        if ($project->smsSettings->hasValidCredentials()) {
            if ($user->communicate_via == UserModel::COMMUNICATE_VIA_SMS || $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH) {
                $databaseName = $project->databaseName();
                $sms = new SmsModel($databaseName);
                $sms->providerInfo = $project->smsSettings->accountId . '|' . $project->smsSettings->authToken;
                $sms->to = $user->mobile_phone;
                $sms->from = $project->smsSettings->fromNumber;
                $vars = array(
                    'user' => $user,
                    'project' => $project
                );
                $template = CommunicateHelper::templateFromString($smsTemplate);
                $sms->message = $template->render($vars);

                CommunicateHelper::deliverSMS($sms, $delivery);
            }
        }
    }

    /**
     * Send an email to validate a user when they sign up.
     * @param UserModel $userModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendSignup($userModel, $website, DeliveryInterface $delivery = null)
    {
        $userModel->setValidation(7);
        $userModel->write();

        $to = array($userModel->emailPending => $userModel->name);

        $subject = $website->name . ' account signup validation';

        $vars = array(
                'user' => $userModel,
                'link' => $website->baseUrl() . '/validate/' . $userModel->validationKey,
                'website' => $website,
        );

        self::sendTemplateEmail($to, $subject, 'SignupValidate.html.twig', $vars, $website, $delivery);
    }

    /**
     *
     * @param UserModel $inviterUserModel
     * @param UserModel $toUserModel
     * @param ProjectModel $projectModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendInvite($inviterUserModel, $toUserModel, $projectModel, $website, DeliveryInterface $delivery = null)
    {
        $toUserModel->setValidation(7);
        $toUserModel->write();

        $to = array($toUserModel->emailPending => $toUserModel->name);

        $subject = $website->name . ' account signup validation';

        $vars = array(
            'user' => $inviterUserModel,
            'project' => $projectModel,
            'link' => $website->baseUrl() . '/registration#/?v=' . $toUserModel->validationKey,
        );

        self::sendTemplateEmail($to, $subject, 'InvitationValidate.html.twig', $vars, $website, $delivery);
    }

    /**
     *
     * @param UserModel $toUserModel
     * @param string $newUserName
     * @param string $newUserPassword
     * @param ProjectModel $project
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendNewUserInProject($toUserModel, $newUserName, $newUserPassword, $project, $website, DeliveryInterface $delivery = null)
    {
        $to = array($toUserModel->email => $toUserModel->name);

        $subject = $website->name . ' new user login for project ' . $project->projectName;

        $vars = array(
                'user' => $toUserModel,
                'newUserName' => $newUserName,
                'newUserPassword' => $newUserPassword,
                'website' => $website,
                'project' => $project
        );

        self::sendTemplateEmail($to, $subject, 'NewUserInProject.html.twig', $vars, $website, $delivery);
    }

    /**
     * Notify existing user they've been added to a project
     * @param UserModel $inviterUserModel
     * @param UserModel $toUserModel
     * @param ProjectModel $projectModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendAddedToProject($inviterUserModel, $toUserModel, $projectModel, $website, DeliveryInterface $delivery = null)
    {
        $to = array($toUserModel->email => $toUserModel->name);

        $subject = 'You\'ve been added to the project ' . $projectModel->projectName . ' on ' . $website->name;

        $vars = array(
            'toUser' => $toUserModel,
            'inviterUser' => $inviterUserModel,
            'project' => $projectModel
        );

        self::sendTemplateEmail($to, $subject, 'AddedToProject.html.twig', $vars, $website, $delivery);
    }

    /**
     *
     * @param UserModel $user
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendForgotPasswordVerification($user, $website, DeliveryInterface $delivery = null)
    {
        $user->setForgotPassword(7);
        $user->write();

        $to = array($user->email => $user->name);

        $subject = $website->name . ' Forgotten Password Verification';

        $vars = array(
            'user' => $user,
            'link' => $website->baseUrl() . '/auth/reset_password/' . $user->resetPasswordKey,
            'website' => $website,
        );

        self::sendTemplateEmail($to, $subject, 'ForgotPasswordVerification.html.twig', $vars, $website, $delivery);
    }

    /**
     *
     * @param UserModel $user
     * @param ProjectModel $projectModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequestConfirmation($user, $projectModel, $website, DeliveryInterface $delivery = null)
    {
        $user->setValidation(7);
        $user->write();

        $to = array($user->email => $user->name);

        $subject = 'You\'ve submitted a join request to the project ' . $projectModel->projectName . ' on ' . $website->name;

        $vars = array(
            'user' => $user,
            'project' => $projectModel,
        );

        self::sendTemplateEmail($to, $subject, 'JoinRequestConfirmation.html.twig', $vars, $website, $delivery);
    }

    /**
     *
     * @param UserModel $user
     * @param UserModel $admin
     * @param ProjectModel $projectModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequest($user, $admin, $projectModel, $website, DeliveryInterface $delivery = null)
    {
        $user->setValidation(7);
        $user->write();

        $to = array($admin->email => $admin->name);
    
        $subject = $user->name . ' join request';
    
        $vars = array(
            'user' => $user,
            'admin' => $admin,
            'project' => $projectModel,
            'link' => $website->baseUrl() . '/app/usermanagement/' . $projectModel->id->asString() . '#/joinRequests',
        );

        self::sendTemplateEmail($to, $subject, 'JoinRequest.html.twig', $vars, $website, $delivery);
    }
    
    /**
     *
     * @param UserModel $user
     * @param ProjectModel $projectModel
     * @param Website $website
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequestAccepted($user, $projectModel, $website, DeliveryInterface $delivery = null)
    {
        $to = array($user->email => $user->name);
        $subject = 'You\'ve submitted a join request to the project ' . $projectModel->projectName . ' on ' . $website->name;

        $vars = array(
            'user' => $user,
            'project' => $projectModel,
            'link' => $website->baseUrl() . '/app/semdomtrans/' . $projectModel->id->asString() . '#/edit',
        );

        self::sendTemplateEmail($to, $subject, 'JoinRequestAccepted.html.twig', $vars, $website, $delivery);
    }

    private static function sendTemplateEmail($to, $subject, $templateName, $vars, $website, DeliveryInterface $delivery = null)
    {
        $senderEmail = 'no-reply@' . $website->domain;
        $from = array($senderEmail => $website->name);

        $templateFile = $website->base . '/theme/' . $website->theme . '/email/en/' .$templateName;
        if (! file_exists($templateFile)) {
            $templateFile = $website->base . '/theme/default/email/en/' . $templateName;
        }
        $template = CommunicateHelper::templateFromFile($templateFile);
        $html = $template->render($vars);

        CommunicateHelper::deliverEmail(
            $from,
            $to,
            $subject,
            $html,
            $delivery
        );
    }
}
