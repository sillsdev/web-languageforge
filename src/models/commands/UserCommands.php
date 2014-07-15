<?php

namespace models\commands;

use libraries\scriptureforge\sfchecks\Communicate;
use libraries\scriptureforge\sfchecks\Email;
use libraries\scriptureforge\sfchecks\IDelivery;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use libraries\shared\palaso\CodeGuard;
use libraries\shared\palaso\JsonRpcServer;
use libraries\shared\Website;
use models\scriptureforge\dto\ProjectSettingsDto;
use models\shared\dto\ActivityListDto;
use models\shared\dto\CreateSimpleDto;
use models\shared\dto\RightsHelper;
use models\shared\dto\UserProfileDto;
use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\commands\ActivityCommands;
use models\commands\ProjectCommands;
use models\commands\QuestionCommands;
use models\commands\TextCommands;
use models\commands\UserCommands;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\mapper\MongoStore;
use models\sms\SmsSettings;
use models\AnswerModel;
use models\PasswordModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionModel;
use models\UnreadMessageModel;
use models\UserModel;
use models\UserModelWithPassword;
use models\UserProfileModel;

class UserCommands {
	
	/**
	 * @param string $id
	 * @return array
	 */
	public static function readUser($id) {
		$user = new UserModel($id);
		return JsonEncoder::encode($user);
	}
	
	/**
	 * User Create/Update
	 * @param array $params - user model fields to update
	 */
	public static function updateUser($params) {
		$user = new UserModel();
		if ($params['id']) {
			$user->read($params['id']);
		}
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
	public static function updateUserProfile($params, $userId) {
		$params['id'] = $userId;
		$user = new UserProfileModel($userId);
		
		// don't allow the following keys to be persisted
		if (array_key_exists('role', $params)) {
			unset($params['role']);
		}
		JsonDecoder::decode($user, $params);
		$result = $user->write();
		return $result;
	}

	/**
	 * @param array $userIds
	 * @return int Total number of users removed.
	 */
	public static function deleteUsers($userIds) {
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
	public static function listUsers() {
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
	 * @return \models\UserTypeaheadModel
	 */
	public static function userTypeaheadList($term, $projectIdToExclude = '') {
		$list = new \models\UserTypeaheadModel($term, $projectIdToExclude);
		$list->read();
		return $list;
	}
	
	/**
	 * 
	 * @param string $userId
	 * @param string $newPassword
	 * @throws \Exception
	 */
	public static function changePassword($userId, $newPassword, $currUserId) {
		if ($userId != $currUserId && !RightsHelper::hasSiteRight($currUserId, Domain::USERS + Operation::EDIT)) {
			throw new UserUnauthorizedException();
		}
		$user = new PasswordModel($userId);
		$user->changePassword($newPassword);
		$user->write();
	}
	
	/**
	 * @param string $username
	 * @param string $email
	 * @param Website $website
	 * @return IdentityCheck
	 */
	public static function checkIdentity($username, $email = '', $website = null) {
		$identityCheck = new IdentityCheck();
		$user = new UserModel();
		$emailUser = new UserModel();
		$identityCheck->usernameExists = $user->readByUserName($username);
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
	 * Activate a user on the specified site and validate email
	 * @param string $username
	 * @param string $password
	 * @param Website $website
	 * @return string|boolean $userId|false otherwise
	 */
	public static function activate($username, $password, $email, $website, IDelivery $delivery = null) {
		CodeGuard::checkEmptyAndThrow($username, 'username');
		CodeGuard::checkEmptyAndThrow($password, 'password');
		CodeGuard::checkEmptyAndThrow($email, 'email');
		CodeGuard::checkNullAndThrow($website, 'website');
		if ($website->allowSignupFromOtherSites) {
			$user = new PasswordModel();
			if ($user->readByProperty('username', $username)) {
				if ($user->verifyPassword($password)) {
					$user = new UserModel($user->id->asString());
					$user->emailPending = $email;
					$user->siteRole[$website->domain] = $website->userDefaultSiteRole;
					$userId = $user->write();
			
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
	public static function createUser($params, $website) {
		$user = new \models\UserModelWithPassword();
		JsonDecoder::decode($user, $params);
		$identityCheck = self::checkIdentity($user->username);
		if ($identityCheck->usernameExists) {
			return false;
		}
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
	public static function createSimple($userName, $projectId, $currentUserId, $website) {
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
		Communicate::sendNewUserInProject($toUser, $user->username, $password, $website, $project);

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
	public static function register($params, $captcha_info, $website, IDelivery $delivery = null) {
		if (strtolower($captcha_info['code']) != strtolower($params['captcha'])) {
			return false;  // captcha does not match
		}
		
		$user = new UserModel();
		JsonDecoder::decode($user, $params);
		$identityCheck = self::checkIdentity($user->username);
		if ($identityCheck->usernameExists) {
			return false;
		}
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
	
	public static function getCaptchaSrc($controller) {
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
    * @param string $toEmail
    * @param Website $website
    * @param IDelivery $delivery
    */
	public static function sendInvite($projectId, $inviterUserId, $website, $toEmail, IDelivery $delivery = null) {
		$newUser = new UserModel();
		$inviterUser = new UserModel($inviterUserId);
		$project = new ProjectModel($projectId);
		$newUser->emailPending = $toEmail;
		$newUser->addProject($project->id->asString());
		$userId = $newUser->write();
		$project->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$project->write();
		Communicate::sendInvite($inviterUser, $newUser, $project, $website, $delivery);
		return $userId;
    }
    
    /**
     * 
     * @param string $validationKey
     * @return array
     */
	public static function readForRegistration($validationKey) {
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
	public static function updateFromRegistration($validationKey, $params, $website) {
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

class IdentityCheck {

	public function __construct() {
		$this->usernameExists = false;
		$this->usernameExistsOnThisSite = false;
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
	
?>