<?php

namespace models;

use models\scriptureforge\SfProjectList_UserModel;

use models\languageforge\LfProjectList_UserModel;

use libraries\shared\Website;

use models\UserModelMongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;
use models\mapper\MongoMapper;
use models\mapper\ReferenceList;

use models\shared\rights\ProjectRoles;

require_once(APPPATH . 'models/ProjectModel.php');

class UserModel extends \models\UserModelBase
{
	
	/**
	 * @param string $id
	 */
	public function __construct($id = '') {
		$this->projects = new ReferenceList();
		$this->setReadOnlyProp('projects');
		parent::__construct($id);
	}
	
	/**
	 *	Removes a user from the collection
	 *  Project references to this user are also removed
	 */
	public function remove() {
		foreach ($this->projects->refs as $id) {
			$project = new ProjectModel($id->asString());
			$project->removeUser($this->id->asString());
			$project->write();
		}
		parent::remove();
	}
	
	public function isMemberOfProject($projectId) {
		foreach ($this->projects->refs as $id) {
			if ($projectId == $id->asString()) {
				return true;
			}
		}
		return false;
	}
			
	
	
	/**
	 *	Adds the user as a member of $projectId
	 *  You must call write() on both the user model and the project model!!!
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
	
	public function listProjects($site) {
		$projectList = new ProjectList_UserModel($site);
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
			array('username' => array('$regex' => '')),
			array('username', 'email', 'name', 'avatar_ref', 'role')
		);
	}
	
}

class UserTypeaheadModel extends \models\mapper\MapperListModel
{
	public function __construct($term, $projectIdToExclude = '')
	{
		$query = array('$or' => array(
						array('name' => array('$regex' => $term, '$options' => '-i')),
						array('username' => array('$regex' => $term, '$options' => '-i')),
						array('email' => array('$regex' => $term, '$options' => '-i')),
				));
		if (!empty($projectIdToExclude)) {
			// Allow $projectIdToExclude to be either an array or a single ID
			if (is_array($projectIdToExclude)) {
				$idsToExclude = $projectIdToExclude;
			} else {
				$idsToExclude = array($projectIdToExclude);
			}
			// If passed string IDs, convert to MongoID objects
			$idsToExclude = array_map(function($id) {
				if (is_string($id)) {
					return MongoMapper::mongoID($id);
				} else {
					return $id;
				}
			}, $idsToExclude);
			$query['projects'] = array('$nin' => $idsToExclude);
		}
		parent::__construct(
				UserModelMongoMapper::instance(),
				$query,
				array('username', 'email', 'name', 'avatarRef')
		);
	}	
}




?>
