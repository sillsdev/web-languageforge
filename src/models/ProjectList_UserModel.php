<?php

namespace models;

use libraries\shared\Website;

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
class ProjectList_UserModel extends \models\mapper\MapperListModel
{
	private $_site;

	public function __construct($site) {
		$this->_site = $site;
		parent::__construct(ProjectModelMongoMapper::instance());
	}
	
	/**
	 * Reads all projects
	 */
	function readAll() {
		$query = array('siteName' => array('$in' => array($this->_site)));
		$fields = array('projectname', 'appName', 'themeName', 'siteName');
		
		return $this->_mapper->readList($this, $query, $fields);
	}
	
	/**
	 * Reads all projects in which the given $userId is a member.
	 * @param string $userId
	 */
	function readUserProjects($userId) {
		$query = array('users.' . $userId => array('$exists' => true), 'siteName' => array('$in' => array($this->_site)));
		$fields = array('projectname', 'appName', 'themeName', 'siteName');
		
		$this->_mapper->readList($this, $query, $fields);
		
		// Default sort list on project names
		usort($this->entries, function ($a, $b) {
			$sortOn = 'projectname';
			if (array_key_exists($sortOn, $a) &&
			array_key_exists($sortOn, $b)){
				return (strtolower($a[$sortOn]) > strtolower($b[$sortOn])) ? 1 : -1;
			} else {
				return 0;
			}
		});
		
		return;
	}


}

?>