<?php

namespace models;

use models\shared\rights\SiteRoles;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MongoMapper;

use models\shared\rights\ProjectRoles;


class UserModelBase extends \models\mapper\MapperModel
{
	
	const COMMUNICATE_VIA_SMS   = 'sms';
	const COMMUNICATE_VIA_EMAIL = 'email';
	const COMMUNICATE_VIA_BOTH  = 'both';
	
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->validationExpirationDate = new \DateTime();
// 		$this->setReadOnlyProp('role');	// TODO Enhance. This currently causes API tests to fail but should be in for security. IJH 2014-03
		parent::__construct(UserModelMongoMapper::instance(), $id);
	}
	
	/**
	 *	Removes a user from the collection
	 *  Project references to this user are also removed
	 */
	public function remove() {
		UserModelMongoMapper::instance()->remove($this->id->asString());
	}
	
	public function read($id) {
		parent::read($id);
		if (!$this->communicate_via) {
			$this->communicate_via = self::COMMUNICATE_VIA_EMAIL;
		}
		if (!$this->avatar_ref) {
			$default_avatar = "/images/shared/avatar/anonymoose.png";
			$this->avatar_ref = $default_avatar;
		}
	}

	/**
	 * 
	 * @param string $username
	 * @return boolean - true if the username exists, false otherwise
	 */
	static public function userNameExists($username) {
		$user = new UserModel();
		return $user->readByUserName($username);
	}
	
	/**
	 * 
	 * @param string $username
	 * @return boolean - true of the username exists, false otherwise
	 */
	public function readByUserName($username) {
		return $this->readByProperty('username', $username);
	}
	
	
	
	/**
	 * Returns true if the given $userId has the $right in this site.
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public function hasRight($right) {
		$result = SiteRoles::hasRight($this->role, $right);
		return $result;
	}
	
	/**
	 * 
	 * @param bool $consumeKey - if true the validationKey will be destroyed upon validate()
	 * @return boolean
	 */
	public function validate($consumeKey = true) {
		if ($this->validationKey) {
			$today = new \DateTime();
			$interval = $today->diff($this->validationExpirationDate);
			
			if ($consumeKey) {
				$this->validationKey = '';
				$this->validationExpirationDate = new \DateTime();
			}
			
			if ($this->emailPending) {
				$this->email = $this->emailPending;
				$this->emailPending = '';
			}
			
			$intervalSeconds = ($interval->d * 86400) + ($interval->h * 3600) + ($interval->m * 60) + $interval->s;
			if ($intervalSeconds > 0 && $interval->invert == 0) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 
	 * @param int $days
	 * @return string - validation key
	 */
	public function setValidation($days) {
		$this->validationKey = sha1(microtime(true).mt_rand(10000,90000));
		$today = new \DateTime();
		$today->add(new \DateInterval("P${days}D"));
		$this->validationExpirationDate = $today;
		return $this->validationKey;
	}
	
	/**
	 * @var IdReference
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $name;
	
	/**
	 * @var string
	 */
	public $username;
	
	public $avatar_ref;
	
	/**
	 * 
	 * @var string
	 * An unconfirmed email address for this user
	 */
	public $emailPending;
	
	/**
	 * @var string
	 */
	public $email;
	
	/**
	 * @var string
	 */
	public $validationKey;
	
	/**
	 * @var \DateTime
	 */
	public $validationExpirationDate;
	
	/**
	 * @var string
	 * @see Roles
	 */
	public $role;
	
	//public $groups;

	/**
	 * @var bool
	 */
	public $active;
	
	/**
	 * @var string - possible values are "email", "sms" or "both"
	 */
	public $communicate_via;
	
}

?>
