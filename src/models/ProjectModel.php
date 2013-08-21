<?php

namespace models;

use libraries\palaso\CodeGuard;

use models\rights\Realm;
use models\rights\Roles;
use models\rights\ProjectRoleModel;
use models\mapper\MapOf;
use models\mapper\MongoMapper;
use models\mapper\MongoStore;
use models\mapper\ReferenceList;
use models\mapper\Id;

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
		parent::__construct(ProjectModelMongoMapper::instance(), $id);
	}
	
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
		ProjectModelMongoMapper::instance()->drop($this->databaseName());
		ProjectModelMongoMapper::instance()->remove($this->id->asString());
	}
	
	/**
	 * Adds the $userId as a member of this project.
	 * @param string $userId
	 * @param string $role The role the user has in this project. Defaults to Roles::USER
	 * @see Roles;
	 */
	public function addUser($userId, $role = Roles::USER) {
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

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id->asString());
		$userList->read();
		return $userList;
	}
	
	/**
	 * Returns true if the given $userId has the $right in this project.
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public function hasRight($userId, $right) {
		$role = $this->users->data[$userId]->role;
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
	
	// What else needs to be in the model?
	
}

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

class ProjectList_UserModel extends \models\mapper\MapperListModel
{

	public function __construct($userId)
	{
		parent::__construct(
				ProjectModelMongoMapper::instance(),
				array('users.' . $userId => array('$exists' => true)),
				array('projectname')
		);
	}

}


?>