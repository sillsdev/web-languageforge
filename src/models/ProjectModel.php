<?php

namespace models;

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
	public function __construct($id = '')
	{
		$this->id = new Id();
		$this->users = new ReferenceList();
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
	 */
	public function addUser($userId) {
		$this->users->_addRef($userId);
	}
	
	
	/**
	 * Removes the $userId from this project.
	 * @param string $userId
	 */
	public function removeUser($userId) {
		//$userModel = new UserModel($userId);
		$this->users->_removeRef($userId);
		//$userModel->projects->_removeRef($this->id);
	}

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id->asString());
		$userList->read();
		return $userList;
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
	 * @var ReferenceList
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
				array('users' => array('$in' => array(MongoMapper::mongoID($userId)))),
				array('projectname')
		);
	}

}


?>