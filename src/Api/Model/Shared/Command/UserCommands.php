<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\Communicate\Communicate;
use Api\Library\Shared\Communicate\DeliveryInterface;
use Api\Library\Shared\Website;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Shared\Dto\CreateSimpleDto;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\PasswordModel;
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
use Site\Controller\Auth;
use Symfony\Component\HttpFoundation\Session\Session;

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
        CodeGuard::checkEmptyAndThrow($id, 'id');

        $user = new UserModel($id);
        $user->active = false;
        return $user->write();
    }

    /**
     * System Admin: Update User
     * @param array $params - user model fields to update
     * @param Website $website
     * @return string $userId
     */
    public static function updateUser($params, $website)
    {
        $user = new UserModel($params['id']);

        if (array_key_exists('username', $params)) {
            $params['username'] = UserCommands::sanitizeInput($params['username']);
        }
        if (array_key_exists('email', $params)) {
            $params['email'] = UserCommands::sanitizeInput($params['email']);
        }

        if (UserCommands::checkUniqueIdentity($user, $params['username'], $params['email']) == 'ok') {
            $user->setProperties(UserModel::ADMIN_ACCESSIBLE, $params);

            if (!$user->hasRoleOnSite($website) && $website->allowSignupFromOtherSites) {
                $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
            }
            return $user->write();
        }
    }

    /**
     * User Profile: Update User Profile
     * @param array $params - user model fields to update
     * @param string $userId
     * @param Website $website
     * @param DeliveryInterface $delivery
     * @return bool|string False if update failed; $userId on update; 'login' on username/email change
     */
    public static function updateUserProfile($params, $userId, $website, DeliveryInterface $delivery = null)
    {
        $params['id'] = $userId;
        if (array_key_exists('username', $params)) {
            $params['username'] = UserCommands::sanitizeInput($params['username']);
        }
        if (array_key_exists('email', $params)) {
            $params['email'] = UserCommands::sanitizeInput($params['email']);
        }

        $user = new UserModel($userId);

        // don't allow the following keys to be persisted
        if (array_key_exists('role', $params)) {
            unset($params['role']);
        }

        $result =  UserCommands::checkUniqueIdentity($user, $params['username'], $params['email']);
        if ($result == 'ok') {
            $newCredential = (($user->username != $params['username']) || ($user->email != $params['email']));
            $user->setProperties(UserModel::USER_PROFILE_ACCESSIBLE, $params);
            $userId = $user->write();
            if ($newCredential) {
                Communicate::sendVerifyEmail($user, $website, $delivery);
                return 'login';
            }
            return $userId;
        }

        return false;
    }

    /**
     * @param array $userIds
     * @return int Total number of users removed.
     */
    public static function deleteUsers($userIds)
    {
        CodeGuard::checkTypeAndThrow($userIds, 'array');
        $count = 0;
        foreach ($userIds as $userId) {
            CodeGuard::checkTypeAndThrow($userId, 'string');
            $userModel = new UserModel($userId);
            $userModel->remove();
            $count++;
        }

        return $count;
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
        $projectList = array();
        foreach ($projectListModel->entries as $p) {
            $projectList[$p['id']] = $p;
        }

        foreach ($list->entries as $key => $item) {
            if (array_key_exists('projects', $item)) {
                $projectIds = $item['projects'];
                $list->entries[$key]['projects'] = array();
                foreach ($projectIds as $id) {
                    $list->entries[$key]['projects'][] = $projectList[(string)$id];
                }
            }
        }

        // Default sort on username (currently needed to sort on Site Admin because MongoDB doesn't do case insensitive sorts)
        usort($list->entries, function ($a, $b) {
            $sortOn = 'username';
            if (array_key_exists($sortOn, $a) &&
                array_key_exists($sortOn, $b)
            ) {
                return (strtolower($a[$sortOn]) > strtolower($b[$sortOn])) ? 1 : -1;
            } else {
                return 0;
            }
        });

        return $list;
    }

    /**
     * @param string $term
     * @param string $projectIdToExclude
     * @param Website website
     * @return UserTypeaheadModel
     */
    public static function userTypeaheadList($term, $projectIdToExclude = '', $website)
    {
        $list = new UserTypeaheadModel($term, $projectIdToExclude, $website);
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
            if (!SiteRoles::hasRight($currentUserModel->siteRole, Domain::USERS + Operation::EDIT) &&
                !SystemRoles::hasRight($currentUserModel->role, Domain::USERS + Operation::EDIT)
            ) {
                throw new UserUnauthorizedException();
            }
        }
        $user = new PasswordModel($userId);
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
        return strtolower(str_replace(' ', '.', $field));
    }

    /**
     * Utility to check if user is updating to a unique set of username and email
     * @param UserModel|UserModelWithPassword $user
     * @param string $updatedUsername
     * @param string $updatedEmail
     * @return string
     */
    public static function checkUniqueIdentity($user, $updatedUsername = '', $updatedEmail = '')
    {
        $result = 'ok';
        $updatedUsername = UserCommands::sanitizeInput($updatedUsername);
        $updatedEmail = UserCommands::sanitizeInput($updatedEmail);
        $anotherUser = new UserModel();

        // Check for unique non-blank updated username
        if (!empty($updatedUsername) &&
            ($user->username != $updatedUsername) &&
            $anotherUser->readByUserName($updatedUsername)) {
            $result = 'usernameExists';
        }

        // Check for unique updated email address
        if (!empty($updatedEmail) &&
            ($user->email != $updatedEmail) &&
            $anotherUser->readByEmail($updatedEmail)) {
            if ($result == 'usernameExists') {
                $result = 'usernameAndEmailExists';
            } else {
                $result = 'emailExists';
            }
        }

        return $result;
    }

    /**
     * System Admin: Create a user with default site role.
     * @param string $params
     * @param Website $website
     * @return bool|string userId of the new user
     */
    public static function createUser($params, $website)
    {
        $captchaInfo = array();
        $captchaInfo['code'] = $params['captcha'] = 'captcha';
        if (self::register($params, $website, $captchaInfo) == 'login') {
          $user = new UserModel();
          $user->readByUsernameOrEmail($params['email']);
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
     * @param Website $website
     * @throws \Exception
     * @return CreateSimpleDto
     */
    public static function createSimple($username, $projectId, $currentUserId, $website)
    {
        $user = new UserModel();
        $username = UserCommands::sanitizeInput($username);
        $user->name = $username;
        if (UserCommands::checkUniqueIdentity($user, $username, '', $website) == 'ok') {
            $user->username = $username;
            $user->role = SystemRoles::USER;
            $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
            $user->active = true;
            $userId = $user->write();

            // Make 7 digit password
            $characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
            $password = '';
            while (strlen($password) < 7) {
                $password .= substr($characters, rand() % (strlen($characters)), 1);
            }
            $userWithPassword = new UserModelWithPassword($userId);
            $userWithPassword->setPassword($password);
            $userWithPassword->write();

            ProjectCommands::updateUserRole($projectId, $userId, ProjectRoles::CONTRIBUTOR);
            $toUser = new UserModel($currentUserId);
            $project = new ProjectModel($projectId);
            Communicate::sendNewUserInProject($toUser, $user->username, $password, $project, $website);

            $dto = new CreateSimpleDto($userId, $password);

            return $dto->encode();
        }
        else {
            throw new \Exception('This username is already associated with another account');
        }
    }

    /**
     * Public: Register a new user and activate them if they already exist on a new site.
     *
     * @param array $params (email, name, password, captcha)
     * @param Website $website
     * @param string $captchaInfo
     * @param DeliveryInterface $delivery
     * @throws \Exception
     * @return string {captchaFail, login, emailNotAvailable}
     */
    public static function register($params, $website, $captchaInfo, DeliveryInterface $delivery = null)
    {
        $email = self::sanitizeInput($params['email']);
        CodeGuard::checkEmptyAndThrow($email, 'email');

        if (strtolower($captchaInfo['code']) != strtolower($params['captcha'])) {
            return "captchaFail";
        }

        if (UserModel::userExists($email)) {
            $user = new PasswordModel();
            $user->readByProperty('email', $email);
            if (!$user->passwordExists()) {
                // Write the password and names for invited users
                $userPassword = new UserModelWithPassword($user->id->asString());
                $userPassword->setPassword($params['password']);
                $userId = $userPassword->write();

                $user = new UserModel($userId);
                $user->name = $params['name'];
                $user->setUniqueUsernameFromString($params['name']);
                $user->active = true;
                $userId = $user->write();

                Communicate::sendWelcomeToWebsite($user, $website, $delivery);
                Communicate::sendVerifyEmail($user, $website, $delivery);
                return "login";
            } else if ($user->verifyPassword($params['password'])) {
                $userId = $user->id->asString();
                $user = new UserModel($userId);
                if ($user->hasRoleOnSite($website)) {
                    return "login";
                } else {
                    if ($website->allowSignupFromOtherSites) {
                        $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
                        $user->write();

                        UserCommands::addUserToDefaultProject($user->id->asString(), $website);
                        Communicate::sendWelcomeToWebsite($user, $website, $delivery);
                        return "login";
                    }
                }
            }
            return "emailNotAvailable";
        }

        $user = new UserModel();
        $user->email = $user->emailPending = $email;
        $user->active = true;
        $user->name = $params['name'];
        $user->setUniqueUsernameFromString($params['name']);
        $user->role = SystemRoles::USER;
        $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
        $userId = $user->write();

        // Write the password
        $userPassword = new UserModelWithPassword($userId);
        $userPassword->setPassword($params['password']);
        $userPassword->write();

        UserCommands::addUserToDefaultProject($userId, $website);
        Communicate::sendWelcomeToWebsite($user, $website, $delivery);
        Communicate::sendVerifyEmail($user, $website, $delivery);
        return "login";
    }

    /**
     * @param string $userId
     * @param Website $website
     */
    public static function addUserToDefaultProject($userId, Website $website) {
        $user = new UserModel($userId);
        $project = ProjectModel::getDefaultProject($website);
        if ($project) {
            $project->addUser($user->id->asString(), ProjectRoles::CONTRIBUTOR);
            $user->addProject($project->id->asString());
            $project->write();
            $user->write();
        }
    }


    public static function getCaptchaData(Session $session)
    {
        srand(microtime() * 100);
        $captchaData = array(
            'items' => array(
                array(
                    'name' => 'Blue Square',
                    'imgSrc' => '/Site/views/shared/image/captcha/kajrtakzl.png'
                ),
                array(
                    'name' => 'Yellow Circle',
                    'imgSrc' => '/Site/views/shared/image/captcha/ljfhadgur.png'
                ),
                array(
                    'name' => 'Red Triangle',
                    'imgSrc' => '/Site/views/shared/image/captcha/poietymnv.png'
                )
            ),
            'expectedItemName' => 'Yellow Circle',
        );
        $captchaInfo = array(
            'code' => 1
        );
        $index = rand(0, count($captchaData['items']) - 1);
        $captchaInfo['code'] = $index;
        $session->set('captcha_info', $captchaInfo);
        $captchaData['expectedItemName'] = $captchaData['items'][$index]['name'];
        foreach ($captchaData['items'] as &$item) {
            unset($item['name']);
        }

        return $captchaData;
    }

    /**
     * Sends an email to $toEmail to join the site.
     * @param string $projectId
     * @param string $inviterUserId
     * @param Website $website
     * @param string $toEmail
     * @param DeliveryInterface $delivery
     * @throws \Exception
     * @return string $userId
     */
    public static function sendInvite(
        $projectId,
        $inviterUserId,
        $website,
        $toEmail,
        DeliveryInterface $delivery = null
    ) {
        $inviterUser = new UserModel($inviterUserId);
        $project = new ProjectModel($projectId);
        $toEmail = UserCommands::sanitizeInput($toEmail);

        $newUser = new UserModel();
        if (!$newUser->readByEmail($toEmail)) {
            $newUser->email = $toEmail;
            $newUser->emailPending = $toEmail;
            $newUser->role = SystemRoles::USER;
            Communicate::sendInvite($inviterUser, $newUser, $project, $website, $delivery);
        }

        // Make sure the user exists on the site
        if (!$newUser->hasRoleOnSite($website)) {
            $newUser->siteRole[$website->domain] = $website->userDefaultSiteRole;
        }

        // Add the user to the project, if they are not already a member
        if (!$project->userIsMember($newUser->id->asString())) {
            $newUser->addProject($project->id->asString());
            $userId = $newUser->write();
            $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
            $project->write();
            Communicate::sendAddedToProject($inviterUser, $newUser, $project, $website, $delivery);
        }

        return $newUser->write();
    }


    /**
     * Sends an email to request joining of the project
     * @param string $projectId
     * @param string $userId
     * @param Website $website
     * @param DeliveryInterface $delivery
     * @throws \Exception
     * @return string $userId
     */
    public static function sendJoinRequest($projectId, $userId, $website, DeliveryInterface $delivery = null)
    {
        $newUser = new UserModel($userId);
        $project = new ProjectModel();
        $project->read($projectId['id']);

        // Make sure the user exists on the site
        if (!$newUser->hasRoleOnSite($website)) {
            $newUser->siteRole[$website->domain] = $website->userDefaultSiteRole;
        }

        // Determine if user is already a member of the project
        if ($project->userIsMember($newUser->id->asString())) {
            return $newUser->id;
        }

        // Add the user to the project
        $project->createUserJoinRequest($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $admin = new UserModel($project->ownerRef->asString());
        if ($admin->email != '') {
            Communicate::sendJoinRequest($newUser, $admin, $project, $website, $delivery);
            Communicate::sendJoinRequestConfirmation($newUser, $project, $website, $delivery);
        }

        return $admin;
    }

    /**
     * @param string $projectId
     * @param string $userId
     * @param Website $website
     * @param ProjectRoles $role
     * @param DeliveryInterface $delivery
     * @return IdReference|UserModel
     */
    public static function acceptJoinRequest($projectId, $userId, $website, $role, DeliveryInterface $delivery = null)
    {
        $newUser = new UserModel($userId);
        $project = new ProjectModel();
        $project->read($projectId);

        ProjectCommands::updateUserRole($projectId, $userId, $role);

        // Make sure the user exists on the site
        if (!$newUser->hasRoleOnSite($website)) {
            $newUser->siteRole[$website->domain] = $website->userDefaultSiteRole;
        }

        // Determine if user is already a member of the project
        if ($project->userIsMember($newUser->id->asString())) {
            return $newUser->id;
        }

        $admin = new UserModel($project->ownerRef->asString());
        if ($admin->email != '') {
            Communicate::sendJoinRequestAccepted($newUser, $project, $website, $delivery);
        }

        return $admin;
    }
}
