<?php

namespace models;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\ReferenceList;
use models\rights\Realm;
use models\rights\Roles;

require_once(APPPATH . '/models/ProjectModel.php');

class UserModel extends \models\mapper\MapperModel
{
	
	const COMMUNICATE_VIA_SMS   = 'sms';
	const COMMUNICATE_VIA_EMAIL = 'email';
	const COMMUNICATE_VIA_BOTH  = 'both';
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->projects = new ReferenceList();
		$this->validationDate = new \DateTime();
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
		
		// Default Values for User
		if (!$this->avatar_ref) {
			$default_avatar = "/images/avatar/anonymoose.png";
			$this->avatar_ref = $default_avatar;
		}
		if (!$this->communicate_via) {
			$this->communicate_via = self::COMMUNICATE_VIA_EMAIL;
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
	 *	Adds the user as a member of $projectId
	 *  You do must call write() as both the user model and the project model!!!
	 * @param string $projectId
	 */
	public function addProject($projectId) {
		//$projectModel = new ProjectModel($projectId);
		$this->projects->_addRef($projectId);
		//$projectModel->users->_addRef($this->id);
	}
	
	/**
	 *	Removes the user as a member of $projectId
	 *  You must call write() on both the user model and the project model!!!
	 * @param string $projectId
	 */
	public function removeProject($projectId) {
		//$projectModel = new ProjectModel($projectId);
		$this->projects->_removeRef($projectId);
		//$projectModel->users->_removeRef($this->id);
	}
	
	public function listProjects() {
		$projectList = new ProjectList_UserModel();
		$projectList->readUserProjects($this->id->asString());
		return $projectList;
	}
	
	
	/**
	 * Returns true if the given $userId has the $right in this site.
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public function hasRight($right) {
		$result = Roles::hasRight(Realm::SITE, $this->role, $right);
		return $result;
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
	public $validationDate;
	
	/**
	 * @var string
	 * @see Roles
	 */
	public $role;
	
	//public $groups;
	
	/**
	 * @var string
	 */
	public $avatar_shape;
	
	/**
	 * @var string
	 */
	public $avatar_color;
	
	public $avatar_ref;

	/**
	 * @var bool
	 */
	public $active;
	
	/**
	 * @var int
	 */
	public $created_on;	
	
	public $last_login; // read only field
	
	/**
	 * @var ReferenceList
	 */
	public $projects;
	
	/**
	 * @var string
	 */
	public $mobile_phone;
	/**
	 * @var string - possible values are "email", "sms" or "both"
	 */
	public $communicate_via;
	/**
	 * @var string
	 */
	public $age;
	/**
	 * @var string
	 */
	public $gender;
	/**
	 * @var string
	 */
	public $city;
	/**
	 * @var string
	 */
	public $preferred_bible_version;
	/**
	 * @var string
	 */
	public $religious_affiliation;
	/**
	 * @var string
	 */
	public $study_group;
	/**
	 * @var string
	 */
	public $feedback_group;
}

class UserListModel extends \models\mapper\MapperListModel
{

	public function __construct()
	{
		parent::__construct(
			UserModelMongoMapper::instance(),
			array('name' => array('$regex' => '')),
			array('username', 'email', 'name', 'avatar_ref', 'role')
		);
	}
	
}

class UserTypeaheadModel extends \models\mapper\MapperListModel
{
	public function __construct($term)
	{
		parent::__construct(
				UserModelMongoMapper::instance(),
				array('name' => array('$regex' => $term, '$options' => '-i')),
				array('username', 'email', 'name', 'avatarRef')
		);
	}	
	
}




?>
