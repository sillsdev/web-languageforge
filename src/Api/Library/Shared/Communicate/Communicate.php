<?php

namespace Api\Library\Shared\Communicate;

use Api\Library\Shared\Communicate\Sms\SmsModel;
use Api\Library\Shared\Communicate\Sms\SmsQueue;
use Api\Library\Shared\UrlHelper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ProjectSettingsModel;
use Api\Model\Shared\MessageModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadMessageModel;
use Palaso\Utilities\CodeGuard;

class Communicate
{
    /**
     * @param array $users array<UserModel>
     * @param ProjectSettingsModel $project
     * @param string $subject
     * @param string $smsTemplate
     * @param string $emailTemplate
     * @param string $htmlEmailTemplate
     * @param DeliveryInterface|null $delivery
     * @return string
     */
    public static function communicateToUsers(
        $users,
        $project,
        $subject,
        $smsTemplate,
        $emailTemplate,
        $htmlEmailTemplate = "",
        DeliveryInterface $delivery = null
    ) {
        // store message in database
        $messageModel = new MessageModel($project);
        $messageModel->subject = $subject;
        $messageModel->content = $emailTemplate;
        $messageId = $messageModel->write();

        foreach ($users as $user) {
            self::communicateToUser(
                $user,
                $project,
                $subject,
                $smsTemplate,
                $emailTemplate,
                $htmlEmailTemplate,
                $delivery
            );
            $unreadModel = new UnreadMessageModel($user->id->asString(), $project->id->asString());
            $unreadModel->markUnread($messageId);
            $unreadModel->write();
        }
        SmsQueue::processQueue($project->databaseName());

        return $messageId;
    }

    /**
     * @param UserModel $user
     * @param ProjectSettingsModel $project
     * @param string $subject
     * @param string $smsTemplate
     * @param string $emailTemplate
     * @param string $htmlEmailTemplate
     * @param DeliveryInterface $delivery
     */
    public static function communicateToUser(
        $user,
        $project,
        $subject,
        $smsTemplate,
        $emailTemplate,
        $htmlEmailTemplate = "",
        DeliveryInterface $delivery = null
    ) {
        // Prepare the email message if required
        if (
            $user->communicate_via == UserModel::COMMUNICATE_VIA_EMAIL ||
            $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH
        ) {
            CodeGuard::checkNotFalseAndThrow($project->emailSettings->fromAddress, "email from address");
            CodeGuard::checkNotFalseAndThrow($user->email, "email to address");
            $from = [$project->emailSettings->fromAddress => $project->emailSettings->fromName];
            $to = [$user->email => $user->name];
            $vars = [
                "user" => $user,
                "project" => $project,
            ];
            $template = CommunicateHelper::templateFromString($emailTemplate);
            $content = $template->render($vars);
            $htmlContent = "";
            if ($htmlEmailTemplate) {
                $template = CommunicateHelper::templateFromString($emailTemplate);
                $htmlContent = $template->render($vars);
            }

            CommunicateHelper::deliverEmail($from, $to, $subject, $content, $htmlContent, $delivery);
        }

        // Prepare the sms message if required
        if ($project->smsSettings->hasValidCredentials()) {
            if (
                $user->communicate_via == UserModel::COMMUNICATE_VIA_SMS ||
                $user->communicate_via == UserModel::COMMUNICATE_VIA_BOTH
            ) {
                $databaseName = $project->databaseName();
                $sms = new SmsModel($databaseName);
                $sms->providerInfo = $project->smsSettings->accountId . "|" . $project->smsSettings->authToken;
                $sms->to = $user->mobile_phone;
                $sms->from = $project->smsSettings->fromNumber;
                $vars = [
                    "user" => $user,
                    "project" => $project,
                ];
                $template = CommunicateHelper::templateFromString($smsTemplate);
                $sms->message = $template->render($vars);

                CommunicateHelper::deliverSMS($sms, $delivery);
            }
        }
    }

    /**
     * Send an email to validate a user when they sign up.
     * @param UserModel $userModel
     * @param DeliveryInterface $delivery
     */
    public static function sendVerifyEmail($userModel, DeliveryInterface $delivery = null)
    {
        $userModel->setValidation(7);
        $userModel->write();

        $to = [$userModel->email => $userModel->name];
        $subject = "Language Forge account signup validation";
        $vars = [
            "user" => $userModel,
            "link" => UrlHelper::baseUrl() . "/validate/" . $userModel->validationKey,
        ];

        self::sendTemplateEmail($to, $subject, "SignupValidate", $vars, $delivery);
    }

    /**
     * @param UserModel $userModel
     * @param DeliveryInterface|null $delivery
     */
    public static function sendWelcomeToWebsite($userModel, DeliveryInterface $delivery = null)
    {
        $to = [$userModel->email => $userModel->name];
        $subject = "Welcome to Language Forge";
        $vars = [
            "user" => $userModel,
            "link" => UrlHelper::baseUrl(),
        ];

        self::sendTemplateEmail($to, $subject, "WelcomeToWebsite", $vars, $delivery);
    }

    /**
     * @param UserModel $inviterUserModel
     * @param UserModel $toUserModel
     * @param ProjectModel $projectModel
     * @param DeliveryInterface $delivery
     */
    public static function sendInvite(
        $inviterUserModel,
        $toUserModel,
        $projectModel,
        DeliveryInterface $delivery = null
    ) {
        $toUserModel->setValidation(7);
        $toUserModel->write();

        $to = [$toUserModel->email => $toUserModel->name];
        $subject = "Language Forge invitation";
        $vars = [
            "user" => $inviterUserModel,
            "project" => $projectModel,
            "link" => self::calculateSignupUrl($toUserModel->email),
        ];

        self::sendTemplateEmail($to, $subject, "InvitationValidate", $vars, $delivery);
    }

    /**
     * @param UserModel $toUserModel
     * @param string $newUserName
     * @param string $newUserPassword
     * @param ProjectModel $project
     * @param DeliveryInterface $delivery
     */
    public static function sendNewUserInProject(
        $toUserModel,
        $newUserName,
        $newUserPassword,
        $project,
        DeliveryInterface $delivery = null
    ) {
        $to = [$toUserModel->email => $toUserModel->name];
        $subject = "Language Forge new user login for project " . $project->projectName;
        $vars = [
            "user" => $toUserModel,
            "newUserName" => $newUserName,
            "newUserPassword" => $newUserPassword,
            "project" => $project,
        ];

        self::sendTemplateEmail($to, $subject, "NewUserInProject", $vars, $delivery);
    }

    /**
     * Notify existing user they've been added to a project
     * @param UserModel $inviterUserModel
     * @param UserModel $toUserModel
     * @param ProjectModel $projectModel
     * @param DeliveryInterface $delivery
     */
    public static function sendAddedToProject(
        $inviterUserModel,
        $toUserModel,
        $projectModel,
        DeliveryInterface $delivery = null
    ) {
        $to = [$toUserModel->email => $toUserModel->name];
        $subject = 'You\'ve been added to the project ' . $projectModel->projectName . " on Language Forge";
        $vars = [
            "toUser" => $toUserModel,
            "inviterUser" => $inviterUserModel,
            "link" => UrlHelper::baseUrl() . "/app/lexicon/" . $projectModel->id->asString(),
            "project" => $projectModel,
        ];

        self::sendTemplateEmail($to, $subject, "AddedToProject", $vars, $delivery);
    }

    /**
     * @param UserModel $user
     * @param DeliveryInterface $delivery
     */
    public static function sendForgotPasswordVerification($user, DeliveryInterface $delivery = null)
    {
        $user->setForgotPassword(7);
        $user->write();

        $to = [$user->email => $user->name];
        $subject = "Language Forge Forgotten Password Verification";
        $vars = [
            "user" => $user,
            "link" => UrlHelper::baseUrl() . "/auth/reset_password/" . $user->resetPasswordKey,
        ];

        self::sendTemplateEmail($to, $subject, "ForgotPasswordVerification", $vars, $delivery);
    }

    /**
     * @param UserModel $user
     * @param ProjectModel $projectModel
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequestConfirmation($user, $projectModel, DeliveryInterface $delivery = null)
    {
        $user->setValidation(7);
        $user->write();

        $to = [$user->email => $user->name];
        $subject =
            'You\'ve submitted a join request to the project ' . $projectModel->projectName . " on Language Forge";
        $vars = [
            "user" => $user,
            "project" => $projectModel,
        ];

        self::sendTemplateEmail($to, $subject, "JoinRequestConfirmation", $vars, $delivery);
    }

    /**
     * @param UserModel $user
     * @param UserModel $admin
     * @param ProjectModel $projectModel
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequest($user, $admin, $projectModel, DeliveryInterface $delivery = null)
    {
        $user->setValidation(7);
        $user->write();

        $to = [$admin->email => $admin->name];
        $subject = $user->name . " join request";
        $vars = [
            "user" => $user,
            "admin" => $admin,
            "project" => $projectModel,
            "link" => UrlHelper::baseUrl() . "/app/usermanagement/" . $projectModel->id->asString() . "#!/joinRequests",
        ];

        self::sendTemplateEmail($to, $subject, "JoinRequest", $vars, $delivery);
    }

    /**
     * @param UserModel $user
     * @param ProjectModel $projectModel
     * @param DeliveryInterface $delivery
     */
    public static function sendJoinRequestAccepted($user, $projectModel, DeliveryInterface $delivery = null)
    {
        $to = [$user->email => $user->name];
        $subject =
            'You\'ve submitted a join request to the project ' . $projectModel->projectName . " on Language Forge";
        $vars = [
            "user" => $user,
            "project" => $projectModel,
            "link" => UrlHelper::baseUrl() . "/app/{$projectModel->appName}/" . $projectModel->id->asString(),
        ];

        self::sendTemplateEmail($to, $subject, "JoinRequestAccepted", $vars, $delivery);
    }

    private static function sendTemplateEmail($to, $subject, $templateName, $vars, DeliveryInterface $delivery = null)
    {
        $from = ["no-reply@" . UrlHelper::getHostname() => "Language Forge"];

        $templatePath = "languageforge/theme/default/email/en";
        if (!file_exists(APPPATH . "Site/views/" . "$templatePath/$templateName.twig")) {
            $templatePath = "languageforge/theme/default/email/en";
            if (!file_exists(APPPATH . "Site/views/" . "$templatePath/$templateName.twig")) {
                $templatePath = "shared/email/en";
            }
        }

        $template = CommunicateHelper::templateFromFile("$templatePath/$templateName.twig");
        $content = $template->render($vars);

        $htmlContent = "";
        if (file_exists(APPPATH . "Site/views/" . "$templatePath/$templateName.html.twig")) {
            $template = CommunicateHelper::templateFromFile("$templatePath/$templateName.html.twig");
            $htmlContent = $template->render($vars);
        }

        CommunicateHelper::deliverEmail($from, $to, $subject, $content, $htmlContent, $delivery);
    }

    /**
     * @param string $email
     * @param string $name
     * @param string $avatar
     * @return string
     */
    public static function calculateSignupUrl(string $email, string $name = null, string $avatar = null): string
    {
        $url = UrlHelper::baseUrl() . "/public/signup#!/?e=" . urlencode($email);
        if ($name) {
            $url = $url . "&n=" . urlencode($name);
        }
        if ($avatar) {
            $url = $url . "&a=" . urlencode($avatar);
        }
        return $url;
    }
}
