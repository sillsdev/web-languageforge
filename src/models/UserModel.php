<?php

namespace models;

require_once(APPPATH . '/models/ProjectModel.php');

class UserModelMongoMapper extends \libraries\sf\MongoMapper
{
	public static function instance()
	{
		static $instance = null;
		if (null === $instance)
		{
			$instance = new UserModelMongoMapper(SF_DATABASE, 'users');
		}
		return $instance;
	}
	
}

class UserModel extends \libraries\sf\MapperModel
{
	public function __construct($id = NULL)
	{
		$this->projects = array();
		parent::__construct(UserModelMongoMapper::instance(), $id);
	}
	
	public static function remove($id)
	{
		UserModelMongoMapper::instance()->remove($id);
	}

	/**
	 * Adds the $projectId as a member of this user.
	 * Note that you still need to call write() to persist the model.
	 * @param string $userId
	 */
	public function _addProject($projectId) {
		assert(is_array($this->projects));
		if (in_array($projectId, $this->projects)) {
			return;
		}
		$this->projects[] = $projectId;
	}
	
	/**
	 * Removes the $projectId from this user.
	 * Note that you still need to call write() to persist the model.
	 * @param string $userId
	 */
	public function _removeProject($projectId) {
		assert(is_array($this->projects));
		if (!in_array($projectId, $this->projects)) {
			return;
// 			throw new \Exception("Project '$projectId' is not a member of user '$this->id'");
		}
		$this->projects = array_diff($this->projects, array($projectId));
	}
	
	public function listProjects() {
		assert(is_array($this->projects));
		$projectList = new ProjectListUsersModel($this->id);
		$projectList->read();
		return $projectList;
	}
	
	public $id;
	
	public $name;
	
	public $username;
	
	public $email;
	
	//public $groups;
	
	public $avatarRef;
	public $avatarColor;

	public $active;
	
	public $created_on;	
	
	public $last_login; // read only field
	
	public $projects;
	
	public $mobile_phone;
	public $communicate_via_email; // bool
	public $communicate_via_sms; // bool
	public $age;
	public $gender;
	public $city;
	public $preferred_bible_version;
	public $religious_affiliation;
	public $study_group;
	public $feedback_group;
}

class UserListModel extends \libraries\sf\MapperListModel
{

	public function __construct()
	{
		parent::__construct(
			UserModelMongoMapper::instance(),
			array('email' => array('$regex' => '')),
			array('username', 'email', 'name', 'avatarRef')
		);
	}
	
}

class UserTypeaheadModel extends \libraries\sf\MapperListModel
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

class User_list_projects_model extends \libraries\sf\MapperListModel
{

	public function __construct($projectId)
	{
		parent::__construct(
				UserModelMongoMapper::instance(),
				array('projects' => array('$in' => array($projectId))),
				array('username', 'email', 'name')
		);
	}

}



?>