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
		ProjectModelMongoMapper::instance()->remove($id);
		$this->users->removeOtherRefs($id, 'UserModel', 'projects');
	}
	
	
	/**
	 * Adds the $userId as a member of this project.
	 * You do NOT need to call write() as this method calls it for you
	 * @param string $userId
	 */
	public function addUser($userId) {
		$userModel = new UserModel($userId);
		$this->users->addRef($userId, $userModel->projects, $this->id);
		
		// TODO CJH should we really do an auto-write inside this method?
		//$this->write();
		//$userModel->write();
	}
	
	
	/**
	 * Removes the $userId from this project.
	 * You do NOT need to call write() as this method calls it for you
	 * @param string $userId
	 */
	public function removeUser($userId) {
		$userModel = new UserModel($userId);
		$this->users->removeRef($userId, $userModel->projects, $this->id);
		
		// TODO CJH should we really do an auto-write inside this method?
		/*
		$this->write();
		$userModel->write();
		*/
	}

	public function listUsers() {
		$userList = new User_list_projects_model($this->id);
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