<?php

namespace models;

use models\mapper\ArrayOf;

use libraries\shared\palaso\CodeGuard;
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
	
	public function __construct($id = '') {
		$this->id = new Id();
		$this->users = new MapOf(function($data) {
			return new ProjectRoleModel();
		});
		$this->userProperties = new ProjectUserPropertiesSettings();
		$this->themeName = 'default';
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
			$projectCode = '';
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
		foreach ($this->users as $userId => $roleObj) {
			$user = new UserModel($userId);
			$user->removeProject($this->id->asString());
			$user->write();
		}
		$this->rrmdir($this->getAssetsFolderPath());
		
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
	
	/**
	 * 
	 * @param string $userId
	 * @return bool
	 */
	public function userIsMember($userId) {
		return 	key_exists($userId, $this->users);
	}

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id->asString());
		$userList->read();
		for ($i = 0, $l = count($userList->entries); $i < $l; $i++) {
			$userId = $userList->entries[$i]['id'];
			if (!key_exists($userId, $this->users)) {
				$projectId = $this->id->asString();
				//error_log("User $userId is not a member of project $projectId");
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
		$hasRight = false;
		if (key_exists($userId, $this->users)) {
			$hasRight = Roles::hasRight(Realm::PROJECT, $this->users[$userId]->role, $right);
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
		if (!key_exists($userId, $this->users)) {
			$result = array();
		} else {
			$role = $this->users[$userId]->role;
			$result = Roles::getRightsArray(Realm::PROJECT, $role);
		}
		return $result;
	}

	/**
	 * @return string
	 */
	public function getViewsPath() {
		return 'views/' . $this->siteName . '/' . $this->themeName;
	}
	
	/**
	 * @return string
	 */
	public function getAssetsFolderPath() {
		return APPPATH . 'assets/' . $this->siteName . '/' . $this->appName. '/' . $this->databaseName();
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
	 * Web app interface language code
	 * @var string
	 */
	public $interfaceLanguageCode;
	
	/**
	 * @var string
	 */
	// TODO move this to a subclass cjh 2014-02
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
	
	/**
	 * specifies the theme name for this project e.g. jamaicanpsalms || default
	 * @var string
	 */
	public $themeName;
	
	/**
	 * Specifies which site this project belongs to.  e.g. scriptureforge || languageforge  cf. Website class
	 * @var string
	 */
	public $siteName;
	
	/**
	 *  specifies the angular app this project is associated with e.g. sfchecks || lexicon  (note: these apps are site specific)
	 * @var string
	 */
	public $appName;
	
	private function rrmdir($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype($dir."/".$object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object);
				}
			}
			reset($objects);
			rmdir($dir);
		}
	}
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

?>