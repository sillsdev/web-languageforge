<?php

namespace models\commands;

use models\shared\rights\SiteRoles;

use libraries\scriptureforge\sfchecks\Communicate;
use libraries\scriptureforge\sfchecks\Email;
use libraries\scriptureforge\sfchecks\IDelivery;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use Palaso\Utilities\CodeGuard;
use libraries\shared\AuthHelper;
use libraries\shared\Website;
use models\shared\dto\CreateSimpleDto;
use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\PasswordModel;
use models\ProjectModel;
use models\UserModel;
use models\UserModelWithPassword;
use models\UserProfileModel;

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
     * User Create/Update
     * @param array $params - user model fields to update
     */
    public static function updateUser($params)
    {
        $user = new UserModel();
        if ($params['id']) {
            $user->read($params['id']);
        }
        UserCommands::assertUniqueIdentity($user, $params['username'], $params['email']);
        JsonDecoder::decode($user, $params);
        $result = $user->write();

        return $result;
    }

    /**
     * User Profile Update
     * @param array $params - user model fields to update
     * @param string $userId
     * @return string $userId
     */
    public static function updateUserProfile($params, $userId)
    {
        $params['id'] = $userId;
        $user = new UserProfileModel($userId);

        // don't allow the following keys to be persisted
        if (array_key_exists('role', $params)) {
            unset($params['role']);
        }
        // TODO 07-2014 DDW Need to revalidate any email updates
        if (array_key_exists('email', $params)) {
            unset($params['email']);
        }
        if (array_key_exists('username', $params)) {
            unset($params['username']);
        }
        JsonDecoder::decode($user, $params);
        $result = $user->write();

        return $result;
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
            $userModel = new \models\UserModel($userId);
            $userModel->remove();
            $count++;
        }

        return $count;
    }

    /**
     *
     * @return \models\UserListModel
     */
    public static function listUsers()
    {
        $list = new \models\UserListModel();
        $list->read();

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
     *
     * @param string $term
     * @param string $projectIdToExclude
     * @param Website website
     * @return \models\UserTypeaheadModel
     */
    public static function userTypeaheadList($term, $projectIdToExclude = '', $website)
    {
        $list = new \models\UserTypeaheadModel($term, $projectIdToExclude, $website);
        $list->read();

        return $list;
    }

    /**
     *
     * @param string $userId
     * @param string $newPassword
     * @param string $currentUserId
     * @throws \Exception
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
        $user->write();
    }

    /**
     * Utility to check if user is updating to a unique set of username and email.
     * @param UserModel $user
     * @param string $updatedUsername
     * @param string $updatedEmail
     * @return IdentityCheck
     */
    public static function checkUniqueIdentity($user, $updatedUsername = '', $updatedEmail = '', $website = '')
    {
        $identityCheck = self::checkIdentity($updatedUsername, $updatedEmail, $website);

        // Check for new username or unique non-blank updated username
        /*if ((!$identityCheck->usernameExists) ||

            (($identityCheck->usernameExists) &&
            ($updatedUsername) &&
            ($user->username != $updatedUsername))) {
            $identityCheck->usernameMatchesAccount = false;
        }*/
        if ($user->username == $updatedUsername) {
            $identityCheck->usernameMatchesAccount = true;
        } else {
            $identityCheck->usernameMatchesAccount = false;
        }

        // Override if emails match.  checkIdentity doesn't have enough information to
        // know current user email and updated email are the same
        if ($user->email == $updatedEmail) {
            $identityCheck->emailMatchesAccount = true;
        } else {
            $identityCheck->emailMatchesAccount = false;
        }

        return $identityCheck;
    }

    /**
     * Utility to assert user is updating to a unique set of username and email
     * @param UserModel $user
     * @param string $updatedUsername
     * @param string $updatedEmail
     * @throws \Exception
     */
    private static function assertUniqueIdentity($user, $updatedUsername = '', $updatedEmail = '', $website = '')
    {
        $identityCheck = self::checkUniqueIdentity($user, $updatedUsername, $updatedEmail, $website);

        // Check for unique non-blank updated username
        if (($identityCheck->usernameExists) &&
            (!$identityCheck->usernameMatchesAccount)) {
            throw new \Exception('This username is already associated with another account');
        }

        // Check for unique updated email address
        if (($identityCheck->emailExists) &&
            (!$identityCheck->emailMatchesAccount)){
            throw new \Exception('This email is already associated with another account');
        }
    }

    /**
     * Utility to check if a username already exists and if an email address matches the account
     * @param string $username
     * @param string $email
     * @param Website $website
     * @return IdentityCheck
     */
    public static function checkIdentity($username, $email = '', $website = null)
    {
        $identityCheck = new IdentityCheck();
        $user = new UserModel();
        $emailUser = new UserModel();
        $identityCheck->usernameExists = $user->readByUserName($username);
        // This utility assumes username matches the account
        $identityCheck->usernameMatchesAccount = true;
        if ($website) {
            $identityCheck->allowSignupFromOtherSites = $website->allowSignupFromOtherSites;
            if ($identityCheck->usernameExists) {
                $identityCheck->usernameExistsOnThisSite = $user->hasRoleOnSite($website);
            }
        }
        if ($email) {
            $identityCheck->emailExists = $emailUser->readByProperty('email', $email);
        }
        $identityCheck->emailIsEmpty = empty($user->email);
        if (! $identityCheck->emailIsEmpty  && ! empty($email)) {
            $identityCheck->emailMatchesAccount = ($user->email === $email);
        }

        return $identityCheck;
    }

    /**
     * Activate a user on the specified site and validate email if it was empty, otherwise login
     * @param string $username
     * @param string $password
     * @param Website $website
     * @param CI_Controller $controller
     * @param IDelivery $delivery
     * @return string|boolean $userId|false otherwise
     */
    public static function activate($username, $password, $email, $website, $controller, IDelivery $delivery = null)
    {
        CodeGuard::checkEmptyAndThrow($username, 'username');
        CodeGuard::checkEmptyAndThrow($password, 'password');
        CodeGuard::checkEmptyAndThrow($email, 'email');
        CodeGuard::checkNullAndThrow($website, 'website');
        $identityCheck = self::checkIdentity($username, $email, $website);
        if ($website->allowSignupFromOtherSites &&
                $identityCheck->usernameExists && ! $identityCheck->usernameExistsOnThisSite &&
                ($identityCheck->emailIsEmpty || $identityCheck->emailMatchesAccount)) {
            $user = new PasswordModel();
            if ($user->readByProperty('username', $username)) {
                if ($user->verifyPassword($password)) {
                    $user = new UserModel($user->id->asString());
                    $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
                    if ($identityCheck->emailIsEmpty) {
                        $user->emailPending = $email;
                    }
                    $userId = $user->write();

                    // if website has a default project then add them to that project
                    $project = ProjectModel::getDefaultProject($website);
                    if ($project) {
                        $project->addUser($user->id->asString(), ProjectRoles::CONTRIBUTOR);
                        $user->addProject($project->id->asString());
                        $project->write();
                        $user->write();
                    }

                    if ($identityCheck->emailIsEmpty) {
                        Communicate::sendSignup($user, $website, $delivery);
                    }
                    if ($identityCheck->emailMatchesAccount) {
                        if (! $controller->ion_auth) {
                            $controller->load->library('ion_auth');
                        }
                        $auth = new AuthHelper($controller->ion_auth, $controller->session);

                        return $auth->login($website, $username, $password);
                    }

                    return AuthHelper::result(AuthHelper::LOGIN_SUCCESS, '', '');
                }
            }
        }

        return false;
    }

    /**
     * Create a user with only username and default site role.
     * @param string $params
     * @param Website $website
     * @return boolean|string
     */
    public static function createUser($params, $website)
    {
        $user = new \models\UserModelWithPassword();
        JsonDecoder::decode($user, $params);
        UserCommands::assertUniqueIdentity($user, $params['username'], $params['email'], $website);
        $user->setPassword($params['password']);
        $user->siteRole[$website->domain] = $website->userDefaultSiteRole;

        return $user->write();
    }

    /**
     * Create a user with only username, add user to project if in context, creating user gets email of new user credentials
     * @param string $userName
     * @param string $projectId
     * @param string $currentUserId
     * @param Website $website
     * @return CreateSimpleDto
     */
    public static function createSimple($userName, $projectId, $currentUserId, $website)
    {
        $user = new UserModel();
        $user->name = $userName;
        $user->username = strtolower(str_replace(' ', '.', $user->name));
        $user->role = SystemRoles::USER;
        $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
        $user->active = true;
        $userId = $user->write();

        // Make 4 digit password
        $characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        $password = '';
        while (strlen($password) < 4) {
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

    /**
     * Register a new user
     * @param array $params
     * @param string $captcha_info
     * @param Website $website
     * @param IDelivery $delivery
     * @throws \Exception
     * @return string $userId
     */
    public static function register($params, $captcha_info, $website, IDelivery $delivery = null)
    {
        if (strtolower($captcha_info['code']) != strtolower($params['captcha'])) {
            return false;  // captcha does not match
        }

        $user = new UserModel();
        JsonDecoder::decode($user, $params);
        UserCommands::assertUniqueIdentity($user, $params['username'], $params['email'], $website);
        $user->active = false;
        $user->role = SystemRoles::USER;
        $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
        if (!$user->emailPending) {
            if (!$user->email) {
                throw new \Exception("Error: no email set for user signup.");
            }
            $user->emailPending = $user->email;
            $user->email = '';
        }
        $userId = $user->write();

        // Write the password
        $userPassword = new UserModelWithPassword($userId);
        $userPassword->setPassword($params['password']);
        $userPassword->write();

        // if website has a default project then add them to that project
        $project = ProjectModel::getDefaultProject($website);
        if ($project) {
            $project->addUser($user->id->asString(), ProjectRoles::CONTRIBUTOR);
            $user->addProject($project->id->asString());
            $project->write();
            $user->write();
        }

        Communicate::sendSignup($user, $website, $delivery);

        return $userId;
    }

    public static function getCaptchaSrc($controller)
    {
        $controller->load->library('captcha');
        $captcha_config = array(
            'png_backgrounds' => array(APPPATH . 'images/shared/captcha/captcha_bg.png'),
            'fonts' => array(FCPATH.'/images/shared/captcha/times_new_yorker.ttf'),
            'characters' => 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',
        );
        $captcha_info = $controller->captcha->main($captcha_config);
        $controller->session->set_userdata('captcha_info', $captcha_info);

        return $captcha_info['image_src'];
    }

    /**
    * Sends an email to invite emailee to join the project
    * @param string $projectId
    * @param string $inviterUserId
    * @param Website $website
    * @param string $toEmail
    * @param IDelivery $delivery
    * @throws \Exception
    * @return string $userId
    */
    public static function sendInvite($projectId, $inviterUserId, $website, $toEmail, IDelivery $delivery = null)
    {
        $newUser = new UserModel();
        $inviterUser = new UserModel($inviterUserId);
        $project = new ProjectModel($projectId);
        $newUser->emailPending = $toEmail;

        // Check if email already exists in an account
        $identityCheck = UserCommands::checkIdentity('', $toEmail, $website);
        if ($identityCheck->emailExists) {
            $newUser->readByProperty('email', $toEmail);
        }

        // Make sure the user exists on the site
        if (!$newUser->hasRoleOnSite($website)) {
            $newUser->siteRole[$website->domain] = $website->userDefaultSiteRole;
        }

        // Determine if user is already a member of the project
        if ($project->userIsMember($newUser->id->asString())) {
            return $newUser->id;
        }

        // Add the user to the project
        $newUser->addProject($project->id->asString());
        $userId = $newUser->write();
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        if (!$identityCheck->emailExists) {
            // Email communication with new user
            Communicate::sendInvite($inviterUser, $newUser, $project, $website, $delivery);
        } else {
            // Tell existing user they're now part of the project
            Communicate::sendAddedToProject($inviterUser, $newUser, $project, $website, $delivery);
        }

        return $userId;
    }

    /**
     *
     * @param  string $validationKey
     * @return array
     */
    public static function readForRegistration($validationKey)
    {
        $user = new \models\UserModelBase();
        if (!$user->readByProperty('validationKey', $validationKey)) {
            return array();
        }
        if (!$user->validate(false)) {
            throw new \Exception("Sorry, your registration link has expired.");
        }

        return JsonEncoder::encode($user);
    }

    /**
    *
    * @param string $validationKey
    * @param array $params
    * @param Website $website
    */
    public static function updateFromRegistration($validationKey, $params, $website)
    {
        $user = new \models\UserModelWithPassword();
        if ($user->readByProperty('validationKey', $validationKey)) {
            if ($user->validate()) {
                $params['id'] = $user->id->asString();
                JsonDecoder::decode($user, $params);
                $user->setPassword($params['password']);
                $user->validate();
                $user->role = SystemRoles::USER;
                $user->siteRole[$website->domain] = $website->userDefaultSiteRole;
                $user->active = true;

                return $user->write();
            } else {
                throw new \Exception("Sorry, your registration link has expired.");
            }
        }
    }
}

class IdentityCheck
{
    public function __construct()
    {
        $this->usernameExists = false;
        $this->usernameExistsOnThisSite = false;
        $this->usernameMatchesAccount = false;
        $this->allowSignupFromOtherSites = false;
        $this->emailExists = false;
        $this->emailIsEmpty = true;
        $this->emailMatchesAccount = false;
    }

    /**
     * @var bool true if the username exists, false otherwise
     */
    public $usernameExists;

    /**
     * @var bool true if username exists on the supplied website
     */
    public $usernameExistsOnThisSite;

    /**
     * @var bool true if the username matches the account username
     */
    public $usernameMatchesAccount;

    /**
     * @var bool true if the supplied website allows signup from other sites
     */
    public $allowSignupFromOtherSites;

    /**
     * @var bool true if account email exists
     */
    public $emailExists;

    /**
     * @var bool true if account email is empty
     */
    public $emailIsEmpty;

    /**
     * @var bool true if email matches the account email
     */
    public $emailMatchesAccount;

}
