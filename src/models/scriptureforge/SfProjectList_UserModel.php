<?php

namespace models\scriptureforge;

use libraries\shared\Website;

use models\ProjectList_UserModel;
use models\ProjectModelMongoMapper;
use libraries\shared\palaso\CodeGuard;
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
class SfProjectList_UserModel extends ProjectList_UserModel
{

	public function __construct() {
		parent::__construct(ProjectModelMongoMapper::instance());
	}
	
	/**
	 * Reads all projects
	 */
	function readAll() {
		$query = array('siteName' => array('$in' => array(Website::SCRIPTUREFORGE)));
		$fields = array('projectname', 'appName', 'themeName', 'siteName');
		$sortFields = array('username' => 1);
		return $this->_mapper->readList($this, $query, $fields, $sortFields);
	}
	
	/**
	 * Reads all projects in which the given $userId is a member.
	 * @param string $userId
	 */
	function readUserProjects($userId) {
		$query = array('users.' . $userId => array('$exists' => true), 'siteName' => array('$in' => array(Website::SCRIPTUREFORGE)));
		$fields = array('projectname', 'appName', 'themeName', 'siteName');
		$sortFields = array('username' => 1);		
		return $this->_mapper->readList($this, $query, $fields, $sortFields);
	}
	

}

?>