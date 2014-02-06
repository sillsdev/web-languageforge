<?php

namespace models;

use models\mapper\ArrayOf;

use libraries\palaso\CodeGuard;
use models\rights\Realm;
use models\rights\Roles;
use models\rights\ProjectRoleModel;
use models\mapper\MapOf;
use models\mapper\MongoMapper;
use models\mapper\MongoStore;
use models\mapper\ReferenceList;
use models\mapper\Id;
use models\UserList_ProjectModel;
use models\sms\SmsSettings;

require_once(APPPATH . '/models/ProjectModel.php');

class ProjectModelMongoMapper extends \models\mapper\MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new ProjectModelMongoMapper(SF_DATABASE, 'projects');
		}
		return $instance;
	}
	
	public function drop($databaseName) {
		if (MongoStore::hasDB($databaseName)) {
			$db = MongoStore::connect($databaseName);
			$db->drop();
		}
	}
}

class ProjectModel extends \models\mapper\MapperModel
{
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->users = new MapOf(function($data) {
			return new ProjectRoleModel();
		});
		$this->userProperties = new ProjectUserPropertiesSettings();
		parent::__construct(ProjectModelMongoMapper::instance(), $id);
	}
	
	/**
	 * @param string $domainName
	 * @return \models\ProjectModel
	 */
	public static function createFromDomain($domainName) {
		$projectCode = self::domainToProjectCode($domainName);
		$project = new ProjectModel();
		if (!$project->readByProperty('projectCode', $projectCode)) {
			return null;
		}
		return $project;
	}
	
	/**
	 * Reads the model from the mongo collection
	 * Ensures that the required pick lists exist even if not present in the database
	 * @param string $id
	 * @see MapperModel::read()
	 */
	public function read($id) {
		$result = parent::read($id);
		$this->userProperties->ensurePickListsExist();
		return $result;
	}
	
	
	/**
	 * @param string $domainName
	 * @return string
	 */
	public static function domainToProjectCode($domainName) {
		$uriParts = explode('.', $domainName);
		if ($uriParts[0] == 'www' || $uriParts[0] == 'dev') {
			array_shift($uriParts);
		}
		$projectCode = $uriParts[0];
		if ($projectCode == 'scriptureforge' || $projectCode == 'languageforge') {
			return 'default';
		}
		return $projectCode;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see \models\mapper\MapperModel::databaseName()
	 */
	public function databaseName() {
		$name = strtolower($this->projectname);
		$name = str_replace(' ', '_', $name);
		return 'sf_' . $name;
	}

	/**
	 * Removes this project from the collection.
	 * User references to this project are also removed
	 */
	public function remove() {
		foreach ($this->users->data as $userId => $roleObj) {
			$user = new UserModel($userId);
			$user->removeProject($this->id->asString());
			$user->write();
		}
		ProjectModelMongoMapper::instance()->drop($this->databaseName());
		ProjectModelMongoMapper::instance()->remove($this->id->asString());
	}
	
	/**
	 * Adds the $userId as a member of this project.
	 * @param string $userId
	 * @param string $role The role the user has in this project.
	 * @see Roles;
	 */
	public function addUser($userId, $role) {
		$mapper = ProjectModelMongoMapper::instance();
//		$ProjectModelMongoMapper::mongoID($userId)
		$model = new ProjectRoleModel();
		$model->role = $role;
		$this->users->data[$userId] = $model; 
	}
	
	/**
	 * Removes the $userId from this project.
	 * @param string $userId
	 */
	public function removeUser($userId) {
		unset($this->users->data[$userId]);
	}
	
	/**
	 * 
	 * @param string $userId
	 * @return bool
	 */
	public function userIsMember($userId) {
		return 	key_exists($userId, $this->users->data);
	}

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id->asString());
		$userList->read();
		for ($i = 0, $l = count($userList->entries); $i < $l; $i++) {
			$userId = $userList->entries[$i]['id'];
			if (!key_exists($userId, $this->users->data)) {
				$projectId = $this->id->asString();
				//error_log("User $userId is not a member of project $projectId");
				continue;
			}
			$userList->entries[$i]['role'] = $this->users->data[$userId]->role;
		}
 		return $userList;
	}
	
	/**
	 * Returns true if the given $userId has the $right in this project.
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public function hasRight($userId, $right) {
		$hasRight = false;
		if (key_exists($userId, $this->users->data)) {
			$hasRight = Roles::hasRight(Realm::PROJECT, $this->users->data[$userId]->role, $right);
		}
		return $hasRight;
	}
	
	/**
	 * Returns the rights array for the $userId role.
	 * @param string $userId
	 * @return array
	 */
	public function getRightsArray($userId) {
		CodeGuard::checkTypeAndThrow($userId, 'string');
		if (!key_exists($userId, $this->users->data)) {
			$result = array();
		} else {
			$role = $this->users->data[$userId]->role;
			$result = Roles::getRightsArray(Realm::PROJECT, $role);
		}
		return $result;
	}
	
	/**
	 * @var Id
	 */
	public $id;
	
	/**
	 * @var string
	 */
	public $projectname;
	
	/**
	 * @var string
	 */
	public $language;
	
	/**
	 * @var MapOf<ProjectRoleModel>
	 */
	public $users;
	
	/**
	 * A string representing exactly this project from external sources. Typically some part of the URL.
	 * @var string
	 */
	public $projectCode;
	
	/**
	 * Flag to indicated if this project is featured on the website 
	 * @var boolean
	 */
	public $featured;

	/**
	 * @var ProjectUserPropertiesSettings
	 */
	public $userProperties;
}

/**
 * This class is separate from the ProjectModel to protect the smsSettings and emailSettings which are managed
 * by the site administrator only.
 */
class ProjectSettingsModel extends ProjectModel
{
	public function __construct($id = '') {
		$this->smsSettings = new SmsSettings();
		$this->emailSettings = new EmailSettings();
		parent::__construct($id);
	}

	/**
	 * @var SmsSettings
	 */
	public $smsSettings;

	/**
	 * @var EmailSettings
	 */
	public $emailSettings;

}

/**
 * 
 * List of projects in the system
 *
 */
class ProjectListModel extends \models\mapper\MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			ProjectModelMongoMapper::instance(),
			array(),
			array('projectname', 'language')
		);
	}
}

/**
 * List of projects of which a user is a member
 * 
 */
class ProjectList_UserModel extends \models\mapper\MapperListModel
{

	public function __construct() {
		parent::__construct(ProjectModelMongoMapper::instance());
	}
	
	/**
	 * Reads all projects
	 */
	function readAll() {
		$query = array();
		$fields = array('projectname');
		return $this->_mapper->readList($this, $query, $fields);
	}
	
	/**
	 * Reads all projects in which the given $userId is a member.
	 * @param string $userId
	 */
	function readUserProjects($userId) {
		$query = array('users.' . $userId => array('$exists' => true));
		$fields = array('projectname');
		return $this->_mapper->readList($this, $query, $fields);
	}
	

}

?>