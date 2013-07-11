<?php

namespace models;

use libraries\sf\MongoStore;

require_once(APPPATH . '/models/ProjectModel.php');

class ProjectModelMongoMapper extends \libraries\sf\MongoMapper
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

class ProjectModel extends \libraries\sf\MapperModel
{
	public function __construct($id = NULL)
	{
		$this->users = array();
		parent::__construct(ProjectModelMongoMapper::instance(), $id);
	}
	
	public function databaseName() {
		$name = strtolower($this->projectname);
		$name = str_replace(' ', '_', $name);
		return 'sf_' . $name;
	}

	/**
	 * Removes this project from the collection.
	 */
	public function remove()
	{
		ProjectModelMongoMapper::instance()->drop($this->databaseName());
		ProjectModelMongoMapper::instance()->remove($this->id);
	}
	
	/**
	 * Adds the $userId as a member of this project.
	 * Does not add the reciprocal relationship.
	 * @param string $userId
	 * @see ProjectModel::addUser
	 */
	public function _addUser($userId) {
		assert(is_array($this->users));
		if (in_array($userId, $this->users)) {
			return;
		}
		$this->users[] = $userId;
	}
	
	/**
	 * Adds the $userId as a member of this project.
	 * Note that you still need to call write() to persist the model. 
	 * @param string $userId
	 */
	public function addUser($userId) {
		$this->_addUser($userId);
		$userModel = new UserModel($userId);
		$userModel->_addProject($this->id);
		$userModel->write();
	}
	
	/**
	 * Removes the $userId from this project.
	 * Does not remove the reciprocal relationship.
	 * @param string $userId
	 * @see ProjectModel::removeUser
	 */
	public function _removeUser($userId) {
		assert(is_array($this->users));
		if (!in_array($userId, $this->users)) {
			return;
// 			throw new \Exception("User '$userId' is not a member of project '$this->id'");
		}
		$this->users = array_diff($this->users, array($userId));
	}
	
	/**
	 * Removes the $userId from this project.
	 * Note that you still need to call write() to persist the model. 
	 * @param string $userId
	 */
	public function removeUser($userId) {
		$this->_removeUser($userId);
		$userModel = new UserModel($userId);
		$userModel->_removeProject($this->id);
		$userModel->write();
	}

	public function listUsers() {
		$userList = new User_list_projects_model($this->id);
		$userList->read();
		return $userList;
	}
	
	public $id;
	
	public $projectname;
	public $language;
	
	public $users;
	
	// What else needs to be in the model?
	
}

class ProjectListModel extends \libraries\sf\MapperListModel
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

class ProjectListUsersModel extends \libraries\sf\MapperListModel
{

	public function __construct($userId)
	{
		parent::__construct(
				ProjectModelMongoMapper::instance(),
				array('users' => array('$in' => array($userId))),
				array('projectname')
		);
	}

}


?>