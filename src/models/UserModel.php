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

class UserModel extends \models\UserModelBase
{
	
	/**
	 * @param string $id
	 */
	public function __construct($id = '') {
		$this->projects = new ReferenceList();
		parent::__construct($id);
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
	 * @var ReferenceList
	 */
	public $projects;
	
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
