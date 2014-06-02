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

class ProjectModel extends \models\mapper\MapperModel
{
	const PROJECT_LIFT = 'dictionary';
	const PROJECT_FLEX = 'flex';
	
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
		// TODO Remove. Can't create projects this way in LF. CP 2013-12
		$projectDomain = self::domainToProjectDomain($domainName);
		$project = new ProjectModel();
		if (!$project->readByProperty('projectDomain', $projectDomain)) {
			return null;
		}
		return $project;
	}
	
	// REVIEWED CP 2013-12: Ok. This is a 'constructor' function.
	/**
	 * Create project (constructor)
	 * @param string $projectName
	 * @param string $languageCode
	 * @param string $projectType
	 * @return ProjectModel
	 */
	public static function create($projectName, $languageCode, $projectType = ProjectModel::PROJECT_LIFT) {
		$projectModel = new ProjectModel();
		$projectModel->languageCode = $languageCode;
		$projectModel->projectName = $projectName;
		$projectModel->projectType = $projectType;
		$projectModel->projectSlug = self::makeProjectSlug($languageCode, $projectName, $projectType);
		return $projectModel;
	}
	
	/**
	 * Makes the immutable project id
	 * @param string $languageCode
	 * @param string $projectName
	 * @param string $projectType
	 * @return string 
	 */
	public static function makeProjectSlug($languageCode, $projectName, $projectType) {
		CodeGuard::checkNotFalseAndThrow($languageCode, 'languageCode');
		CodeGuard::checkNotFalseAndThrow($projectName, 'projectName');
		CodeGuard::checkNotFalseAndThrow($projectType, 'projectType');
		$projectSlug = $languageCode . '-' . strtolower(str_replace(' ', '_', $projectName)) . '-' . $projectType;
		return $projectSlug;
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
	public static function domainToProjectDomain($domainName) {
		$uriParts = explode('.', $domainName);
		if ($uriParts[0] == 'www') {
			array_shift($uriParts);
		}
		return $uriParts[0];
	}
	
	/**
	 * (non-PHPdoc)
	 * @see \models\mapper\MapperModel::databaseName()
	 */
	public function databaseName() {
		if (!$this->projectSlug) {
			$this->projectSlug = self::makeProjectSlug($this->languageCode, $this->projectName, $this->projectType);
		}
		return 'lf_' . $this->projectSlug;
	}
	
	/**
	 * Removes this project from the collection.
	 * User references to this project are also removed
	 */
	public function remove() {
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
		$this->users[$userId] = $model; 
	}
	
	/**
	 * Removes the $userId from this project.
	 * @param string $userId
	 */
	public function removeUser($userId) {
		unset($this->users[$userId]);
	}

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id->asString());
		$userList->read();
		for ($i = 0, $l = count($userList->entries); $i < $l; $i++) {
			$userId = $userList->entries[$i]['id'];
			if (!key_exists($userId, $this->users)) {
				$projectId = $this->id->asString();
				error_log("User $userId is not a member of project $projectId");
				continue;
			}
			$userList->entries[$i]['role'] = $this->users[$userId]->role;
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
		$role = $this->users[$userId]->role;
		$result = Roles::hasRight(Realm::PROJECT, $role, $right);
		return $result;
	}
	
	/**
	 * Returns the rights array for the $userId role.
	 * @param string $userId
	 * @return array
	 */
	public function getRightsArray($userId) {
		CodeGuard::checkTypeAndThrow($userId, 'string');
		if (!key_exists($userId, $this->users)) {
			$result = array();
		} else {
			$role = $this->users[$userId]->role;
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
	public $projectType;
	
	/**
	 * @var string
	 * // TODO Rename. $projectName.
	 */
	public $projectName;
	
	/**
	 * @var string
	 */
	public $languageCode;
	
	/**
	 * @var MapOf<ProjectRoleModel>
	 */
	public $users;
	
	/**
	 * A string representing exactly this project from external sources. Typically some part of the URL, just a partial domain, not necessarily FQDN.
	 * @var string
	 */
	public $projectDomain;
	
	/**
	 * The immutable project id, used by databaseName.
	 * @var string
	 */
	public $projectSlug;
	
	/**
	 * Flag to indicated if this project is featured on the website 
	 * @var boolean
	 */
	public $featured;

	/**
	 * @var ProjectUserPropertiesSettings
	 */
	public $userProperties;

	/**
	 * @var string
	 */
	public $title;

}

/**
 * This class is separate from the ProjectModel to protect the smsSettings and emailSettings which are managed
 * by the site administrator only.
 */
class ProjectSettingsModel extends ProjectModel
{
	public function __construct($id = '') {
		$this->emailSettings = new EmailSettings();
		parent::__construct($id);
	}

	/**
	 * @var EmailSettings
	 */
	public $emailSettings;

}

?>
