<?php

namespace models;

use libraries\sf\ReferenceList;

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
}

class ProjectModel extends \libraries\sf\MapperModel
{
	public function __construct($id = NULL)
	{
		$this->users = new ReferenceList();
		parent::__construct(ProjectModelMongoMapper::instance(), $id);
	}

	/**
	 * Removes this project from the collection.
	 * User references to this project are also removed
	 * @param string $id
	 */
	public static function remove($id)
	{
		// CJH not convinced that this should be part of the model
		//$this->users->removeOtherRefs($id, 'UserModel', 'projects');
		ProjectModelMongoMapper::instance()->remove($id);
	}
	
	
	/**
	 * Adds the $userId as a member of this project.
	 * You do NOT need to call write() as this method calls it for you
	 * @param string $userId
	 */
	public function addUser($userId) {
		//$userModel = new UserModel($userId);
		$this->users->_addRef($userId);
		//$userModel->projects->_addRef($this->id);
	}
	
	
	/**
	 * Removes the $userId from this project.
	 * You do NOT need to call write() as this method calls it for you
	 * @param string $userId
	 */
	public function removeUser($userId) {
		//$userModel = new UserModel($userId);
		$this->users->_removeRef($userId);
		//$userModel->projects->_removeRef($this->id);
	}

	public function listUsers() {
		$userList = new UserList_ProjectModel($this->id);
		$userList->read();
		return $userList;
	}
	
	/**
	 * @var string
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

class ProjectList_UserModel extends \libraries\sf\MapperListModel
{

	public function __construct($userId)
	{
		parent::__construct(
				ProjectModelMongoMapper::instance(),
				array('users' => array('$in' => array(new \MongoId($userId)))),
				array('projectname')
		);
	}

}


?>