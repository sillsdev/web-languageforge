<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\Communicate\Communicate;
use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Shared\Dto\CreateSimpleDto;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UserModelWithPassword;
use Api\Model\Shared\UserTypeaheadModel;
use Palaso\Utilities\CodeGuard;
use Symfony\Component\HttpFoundation\Session\Session;
use Api\Library\Shared\UrlHelper;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Command\ProjectCommands;

class UserCommands
{
    /**
     * @param string $id
     * @return array
     */
    public static function readUser($id)
    {
        $user = new UserModel($id);

        return JsonEncoder::encode($user);
    }

    /**
     * System Admin: Ban User
     * @param $id
     * @throws \Exception
     * @return string $userId of banned user
     */
    public static function banUser($id)
    {
        CodeGuard::checkEmptyAndThrow($id, "id");

        $user = new UserModel($id);
        $user->active = false;
        return $user->write();
    }

    /**
     * System Admin: Update User
     * @param array $params - user model fields to update
     * @return string $userId
     */
    public static function updateUser($params)
    {
        $user = new UserModel($params["id"]);

        $checkUsername = "";
        $checkEmail = "";
        if (array_key_exists("username", $params)) {
            $checkUsername = UserCommands::sanitizeInput($params["username"]);
            $params["username"] = $checkUsername;
        }
        if (array_key_exists("email", $params)) {
            $checkEmail = UserCommands::sanitizeInput($params["email"]);
            $params["email"] = $checkEmail;
        }

        if (UserCommands::checkUniqueIdentity($user, $checkUsername, $checkEmail) != "ok") {
            return null;
        }

        $user->setProperties(UserModel::ADMIN_ACCESSIBLE, $params);
        if (array_key_exists("siteRole", $params)) {
            $user->siteRole->exchangeArray($params["siteRole"]);
        }

        return $user->write();
    }

    /**
     * User Profile: Update User Profile
     * @param array $params - user model fields to update
     * @param string $userId
     * @param DeliveryInterface $delivery
     * @return bool|string False if update failed; $userId on update; 'login' on username change
     * @throws \Exception
     */
    public static function updateUserProfile($params, $userId, DeliveryInterface $delivery = null)
    {
        $params["id"] = $userId;
        $user = new UserModel($userId);

        $checkUsername = "";
        $checkEmail = "";
        $isNewUsername = false;
        $isNewEmail = false;
        if (array_key_exists("username", $params)) {
            $checkUsername = UserCommands::sanitizeInput($params["username"]);
            $params["username"] = $checkUsername;
            $isNewUsername = $user->username != $params["username"];
        }
        if (array_key_exists("email", $params)) {
            $checkEmail = UserCommands::sanitizeInput($params["email"]);
            $params["email"] = $checkEmail;
            $isNewEmail = $user->email != $params["email"];
        }

        // don't allow the following keys to be persisted
        if (array_key_exists("role", $params)) {
            unset($params["role"]);
        }

        $result = UserCommands::checkUniqueIdentity($user, $checkUsername, $checkEmail);
        if ($result == "ok") {
            $user->setProperties(UserModel::USER_PROFILE_ACCESSIBLE, $params);
            $userId = $user->write();
            if ($isNewEmail) {
                Communicate::sendVerifyEmail($user, $delivery);
            }
            if ($isNewUsername) {
                return "login";
            }
            return $userId;
        }

        return false;
    }

    /**
     * @param array $userIds
     * @return int Total number of users removed.
     */
    public static function deleteAccounts($userIds, $currentId)
    {
        CodeGuard::checkTypeAndThrow($userIds, "array");
        $count = 0;
        foreach ($userIds as $userId) {
            CodeGuard::checkTypeAndThrow($userId, "string");
            self::deleteAccount($userId, $currentId);
            $count++;
        }

        return $count;
    }

    /**
     * @param $userId
     * @return int 0 or 1 successful removal
     * @throws \Exception
     */
    public static function deleteAccount($userId, $currentUserId)
    {
        $user = new UserModelWithPassword($userId);

        // Makes sure this user is not an owner on any projects
        foreach ($user->projects->refs as $id) {
            $project = new ProjectModel($id->asString());
            if ($project->ownerRef->asString() == $userId) {
                throw new \Exception(
                    "The user owns one or more projects. Before account deletion, this user's projects must either be transfered to new owners or deleted."
                );
            }
        }

        // Makes sure the user doing the action has the right privileges
        if ($user->role != SystemRoles::SYSTEM_ADMIN && $userId != $currentUserId) {
            throw new \Exception("The current user does not have sufficient privileges to delete the target account.");
        }

        // Deactivates account and removes personal information from the user model.
        // Will now use the user's id instead of name and username when displaying historical activity.
        $user->active = false;
        $user->password = null;
        $user->username = $user->id->asString();
        $user->name = $user->id->asString();
        $user->languageDepotUsername = null;
        $user->email = null;
        $user->mobile_phone = null;
        $user->age = null;
        $user->gender = null;
        $default_avatar = "anonymoose.png";
        $user->avatar_ref = $default_avatar;
        $user->write();

        // Removes the user from each project the user used to be in
        foreach ($user->projects->refs as $projectIdObject) {
            $projectId = $projectIdObject->asString();
            ProjectCommands::removeUsers($projectId, [$userId]);
        }
    }

    /**
     * @return UserListModel
     */
    public static function listUsers()
    {
        $list = new UserListModel();
        $list->read();

        $projectListModel = new ProjectListModel();
        $projectListModel->read();
        $projectList = [];
        foreach ($projectListModel->entries as $p) {
            $projectList[$p["id"]] = $p;
        }

        foreach ($list->entries as $key => $item) {
            if (array_key_exists("projects", $item)) {
                $projectIds = $item["projects"];
                $list->entries[$key]["projects"] = [];
                foreach ($projectIds as $id) {
                    if (array_key_exists((string) $id, $projectList)) {
                        $list->entries[$key]["projects"][] = $projectList[(string) $id];
                    }
                }
            }
        }

        // Default sort on username (currently needed to sort on Site Admin because MongoDB doesn't do case insensitive sorts)
        usort($list->entries, function ($a, $b) {
            $sortOn = "username";
            if (array_key_exists($sortOn, $a) && array_key_exists($sortOn, $b)) {
                return strtolower($a[$sortOn]) > strtolower($b[$sortOn]) ? 1 : -1;
            } else {
                return 0;
            }
        });

        return $list;
    }

    /**
     * @param string $term
     * @param string $projectIdToExclude
     * @return UserTypeaheadModel
     */
    public static function userTypeaheadList($term, $projectIdToExclude = "")
    {
        $list = new UserTypeaheadModel($term, $projectIdToExclude);
        $list->read();

        return $list;
    }

    /**
     * @param string $userId
     * @param string $newPassword
     * @param string $currentUserId
     * @throws \Exception
     * @return string $userId
     */
    public static function changePassword($userId, $newPassword, $currentUserId)
    {
        if ($userId != $currentUserId) {
            $currentUserModel = new UserModel($currentUserId);
            if (
                !SiteRoles::hasRight($currentUserModel->siteRole, Domain::USERS + Operation::EDIT) &&
                !SystemRoles::hasRight($currentUserModel->role, Domain::USERS + Operation::EDIT)
            ) {
                throw new UserUnauthorizedException();
            }
        }
        $user = new UserModelWithPassword($userId);
        $user->changePassword($newPassword);
        return $user->write();
    }

    /**
     * Utility to sanitize user input:
     * - lowercase the characters
     * - replace spaces with periods.
     * @param $field
     * @return string
     */
    public static function sanitizeInput($field)
    {
        return strtolower(str_replace(" ", ".", $field));
    }

    /**
     * Utility to check if user is updating to a unique set of username and email
     * @param UserModel|UserModelWithPassword $user
     * @param string $updatedUsername
     * @param string $updatedEmail
     * @return string
     */
    public static function checkUniqueIdentity($user, $updatedUsername = "", $updatedEmail = "")
    {
        $result = "ok";
        $updatedUsername = UserCommands::sanitizeInput($updatedUsername);
        $updatedEmail = UserCommands::sanitizeInput($updatedEmail);
        $anotherUser = new UserModel();

        // Check for unique non-blank updated username
        if (
            !empty($updatedUsername) &&
            $user->username != $updatedUsername &&
            $anotherUser->readByUserName($updatedUsername)
        ) {
            $result = "usernameExists";
        }

        // Check for unique updated email address
        if (!empty($updatedEmail) && $user->email != $updatedEmail && $anotherUser->readByEmail($updatedEmail)) {
            if ($result == "usernameExists") {
                $result = "usernameAndEmailExists";
            } else {
                $result = "emailExists";
            }
        }

        return $result;
    }

    /**
     * System Admin: Create a user with default site role.
     * @param array $params
     * @return bool|string userId of the new user
     * @throws \Exception
     */
    public static function createUser($params)
    {
        $captchaInfo = [];
        $captchaInfo["code"] = $params["captcha"] = "captcha";
        if (self::register($params, $captchaInfo) == "login") {
            $user = new UserModel();
            $user->readByUsernameOrEmail($params["email"]);
            return $user->id->asString();
        }
        return false;
    }

    /**
     * Project Manager: Create a user with only username, add user to project if in context,
     * creating user gets email of new user credentials
     * @param string $username
     * @param string $projectId
     * @param string $currentUserId
     * @throws \Exception
     * @return array
     */
    public static function createSimple($username, $projectId, $currentUserId)
    {
        $user = new UserModel();
        $username = UserCommands::sanitizeInput($username);
        $user->name = $username;
        if (UserCommands::checkUniqueIdentity($user, $username, "") == "ok") {
            $user->username = $username;
            $user->role = SystemRoles::USER;
            $user->siteRole[UrlHelper::getHostname()] = SiteRoles::PROJECT_CREATOR;
            $user->active = true;
            $userId = $user->write();

            // Make 7 digit password
            $characters = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            $password = "";
            while (strlen($password) < 7) {
                $password .= substr($characters, rand() % strlen($characters), 1);
            }
            $userWithPassword = new UserModelWithPassword($userId);
            $userWithPassword->setPassword($password);
            $userWithPassword->write();

            ProjectCommands::updateUserRole($projectId, $userId, ProjectRoles::CONTRIBUTOR);
            $toUser = new UserModel($currentUserId);
            $project = new ProjectModel($projectId);
            Communicate::sendNewUserInProject($toUser, $user->username, $password, $project);

            $dto = new CreateSimpleDto($userId, $password);

            return $dto->encode();
        } else {
            throw new \Exception("This username is already associated with another account");
        }
    }

    /**
     * Public: Register a new user and activate them if they already exist on a new site.
     *
     * @param array $params (email, name, password, captcha)
     * @param array $captchaInfo
     * @param DeliveryInterface $delivery
     * @return string {captchaFail, login, emailNotAvailable}
     * @throws \Exception
     */
    public static function register($params, $captchaInfo, DeliveryInterface $delivery = null)
    {
        $email = self::sanitizeInput($params["email"]);
        CodeGuard::checkEmptyAndThrow($email, "email");

        if (strtolower($captchaInfo["code"]) != strtolower($params["captcha"])) {
            return "captchaFail";
        }

        if (UserModel::userExists($email)) {
            $user = new UserModelWithPassword();
            $user->readByProperty("email", $email);
            if ($user->isInvited) {
                $user->setPassword($params["password"]);
                $user->name = $params["name"];
                $user->setUniqueUsernameFromString($params["name"]);
                $user->isInvited = false;
                $user->active = true;
                $user->write();

                Communicate::sendWelcomeToWebsite($user, $delivery);
                Communicate::sendVerifyEmail($user, $delivery);
                return "login";
            } elseif ($user->verifyPassword($params["password"])) {
                return "login";
            }
            return "emailNotAvailable";
        }

        $user = new UserModel();
        $user->email = $user->emailPending = $email;
        $user->active = true;
        $user->name = $params["name"];
        $user->setUniqueUsernameFromString($params["name"]);
        if (isset($params["avatar_ref"])) {
            $user->avatar_ref = $params["avatar_ref"];
        }
        $user->role = SystemRoles::USER;
        $user->siteRole[UrlHelper::getHostname()] = SiteRoles::PROJECT_CREATOR;
        $userId = $user->write();

        // Write the password
        $userPassword = new UserModelWithPassword($userId);
        $userPassword->setPassword($params["password"]);
        $userPassword->write();

        Communicate::sendWelcomeToWebsite($user, $delivery);
        Communicate::sendVerifyEmail($user, $delivery);
        return "login";
    }

    /**
     * Public: Register a new user who has already authenticated with OAuth.
     *
     * @param array $params (email, username, name, ?avatar_ref)
     * @param DeliveryInterface $delivery
     * @throws \Exception
     * @return string {login, usernameNotAvailable}
     */
    public static function registerOAuthUser($params, DeliveryInterface $delivery = null)
    {
        $email = self::sanitizeInput($params["email"]);
        CodeGuard::checkEmptyAndThrow($email, "email");
        $username = self::sanitizeInput($params["username"]);
        CodeGuard::checkEmptyAndThrow($username, "username");

        if (UserModel::userExists($username)) {
            return "usernameNotAvailable";
        }

        $user = new UserModel();
        $user->email = $email;
        $user->active = true;
        $user->name = $params["name"];
        $user->username = $username;
        if (isset($params["avatar_ref"])) {
            $user->avatar_ref = $params["avatar_ref"];
        }
        $user->role = SystemRoles::USER;
        $user->siteRole[UrlHelper::getHostname()] = SiteRoles::PROJECT_CREATOR;
        $userId = $user->write();

        // NO password for users registered with OAuth

        Communicate::sendWelcomeToWebsite($user, $delivery);
        Communicate::sendVerifyEmail($user, $delivery);
        return "login";
    }

    public static function calculateUniqueUsernameFromString($usernameBase)
    {
        $user = new UserModel();
        $user->setUniqueUsernameFromString($usernameBase);
        return $user->username;
    }

    public static function getCaptchaData(Session $session)
    {
        srand(microtime(true) * 100);
        $captchaData = [
            "items" => [
                [
                    "name" => "Blue Square",
                    "imgSrc" => "/Site/views/shared/image/captcha/kajrtakzl.png",
                ],
                [
                    "name" => "Yellow Circle",
                    "imgSrc" => "/Site/views/shared/image/captcha/ljfhadgur.png",
                ],
                [
                    "name" => "Red Triangle",
                    "imgSrc" => "/Site/views/shared/image/captcha/poietymnv.png",
                ],
            ],
            "expectedItemName" => "Yellow Circle",
        ];
        $captchaInfo = ["code" => 1];
        $index = rand(0, count($captchaData["items"]) - 1);
        $captchaInfo["code"] = $index;
        $session->set("captcha_info", $captchaInfo);
        $captchaData["expectedItemName"] = $captchaData["items"][$index]["name"];
        foreach ($captchaData["items"] as &$item) {
            unset($item["name"]);
        }

        return $captchaData;
    }

    /**
     * Sends an email to $toEmail to join the site.
     * @param string $projectId
     * @param string $invitingUserId
     * @param string $toEmail
     * @param DeliveryInterface $delivery
     * @throws \Exception
     * @return string $userId or empty if not sent
     */
    public static function sendInvite(
        $projectId,
        $invitingUserId,
        $toEmail,
        DeliveryInterface $delivery = null,
        $roleKey = null
    ) {
        $invitedUserId = "";
        $invitingUser = new UserModel($invitingUserId);
        $project = new ProjectModel($projectId);
        $toEmail = UserCommands::sanitizeInput($toEmail);
        if ($roleKey === null) {
            $roleKey = ProjectRoles::CONTRIBUTOR;
        }

        $invitedUser = new UserModel();
        if (!$invitedUser->readByEmail($toEmail)) {
            $invitedUser->email = $toEmail;
            $invitedUser->emailPending = $toEmail;
            $invitedUser->role = SystemRoles::USER;
            $invitedUser->isInvited = true;
            $invitedUser->write();
        }

        if ($invitedUser->emailPending) {
            Communicate::sendInvite($invitingUser, $invitedUser, $project, $delivery);
            $invitedUserId = $invitedUser->id->asString();
        }

        // Verify authority of $invitingUser to invite someone of this role
        $userIsAuthorized = false;
        $invitingUserRole = $project->users[$invitingUserId]->role;
        $authorizedRoles = [ProjectRoles::MANAGER];
        if ($roleKey == ProjectRoles::MANAGER) {
            $userIsAuthorized = in_array($invitingUserRole, $authorizedRoles);
        }
        $authorizedRoles[] = ProjectRoles::CONTRIBUTOR;
        if ($roleKey == ProjectRoles::CONTRIBUTOR) {
            $userIsAuthorized = in_array($invitingUserRole, $authorizedRoles);
        }
        $authorizedRoles[] = LexRoles::OBSERVER_WITH_COMMENT;
        if ($roleKey == LexRoles::OBSERVER_WITH_COMMENT) {
            $userIsAuthorized = in_array($invitingUserRole, $authorizedRoles);
        }
        $authorizedRoles[] = LexRoles::OBSERVER;
        if ($roleKey == LexRoles::OBSERVER) {
            $userIsAuthorized = in_array($invitingUserRole, $authorizedRoles);
        }

        $invitees = $project->listInvitees();
        $members = $project->listUsers();

        $userIsAuthorized =
            $userIsAuthorized &&
            ($invitingUserRole === ProjectRoles::MANAGER ||
                ($project->allowSharing && $project->userIsMember($invitingUserId)));

        if (!$userIsAuthorized) {
            throw new \Exception("User does not have permission to invite someone of that role (or invalid roleKey).");
        }

        // Add the user to the project, if they are not already a member
        if (!$project->userIsMember($invitedUser->id->asString())) {
            $invitedUser->addProject($project->id->asString());
            $invitedUserId = $invitedUser->write();
            $project->addUser($invitedUserId, $roleKey);
            $project->write();
            Communicate::sendAddedToProject($invitingUser, $invitedUser, $project, $delivery);
        }

        return $invitedUserId;
    }
}
