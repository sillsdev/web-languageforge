<?php

require_once(APPPATH . 'libraries/mongo/Mongo_store.php');

class Project_model_MongoMapper extends MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new Project_model_MongoMapper(SF_DATABASE, 'projects');
		}
		return $instance;
	}
}

class Project_model extends MapperModel
{
	public function __construct($id = NULL)
	{
		$this->users = array();
		parent::__construct(Project_model_MongoMapper::instance(), $id);
	}

	/**
	 * Removes this project from the collection.
	 * @param string $id
	 */
	public static function remove($id)
	{
		Project_model_MongoMapper::instance()->remove($id);
	}
	
	/**
	 * Adds the $userId as a member of this project.
	 * Does not add the reciprocal relationship.
	 * @param string $userId
	 * @see Project_model::addUser
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
		$userModel = new User_model($userId);
		$userModel->_addProject($this->id);
		$userModel->write();
	}
	
	/**
	 * Removes the $userId from this project.
	 * Does not remove the reciprocal relationship.
	 * @param string $userId
	 * @see Project_model::removeUser
	 */
	public function _removeUser($userId) {
		assert(is_array($this->users));
		if (!in_array($userId, $this->users)) {
			throw new Exception("User '$userId' is not a member of project '$this->id'");
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
		$userModel = new User_model($userId);
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

class Project_list_model extends MapperListModel
{
	public function __construct()
	{
		parent::__construct(
			Project_model_MongoMapper::instance(),
			array(),
			array('projectname', 'language')
		);
	}
}

?>