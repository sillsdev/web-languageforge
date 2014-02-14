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


/**
 * List of projects of which a user is a member
 * 
 */
class ProjectList_UserModel extends \models\mapper\MapperListModel
{

	public function __construct() {
		parent::__construct(ProjectModelMongoMapper::instance());
	}
	
	/**
	 * Reads all projects
	 */
	function readAll() {
		$query = array();
		$fields = array('projectname');
		return $this->_mapper->readList($this, $query, $fields);
	}
	
	/**
	 * Reads all projects in which the given $userId is a member.
	 * @param string $userId
	 */
	function readUserProjects($userId) {
		$query = array('users.' . $userId => array('$exists' => true));
		$fields = array('projectname');
		return $this->_mapper->readList($this, $query, $fields);
	}
	

}

?>