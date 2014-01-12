<?php
namespace models\rights;

use libraries\palaso\CodeGuard;
class Roles {
	
	const SYSTEM_ADMIN  = 'system_admin';
	const PROJECT_ADMIN = 'project_admin';
	const USER 			 = 'user';
	
	/**
	 * @var array
	 */
	private static $_rights;
	
	public static function init() {
		self::$_rights = array();
		
		// ----------------------------------------------------------
		// SITE REALM
		// ----------------------------------------------------------
		// System Admin
		$rights = array();
		self::grantAllOnDomain($rights, Domain::USERS);
		self::grantAllOnDomain($rights, Domain::PROJECTS);
		self::grantAllOnDomain($rights, Domain::TEMPLATES);
		
		self::$_rights[Realm::SITE][Roles::SYSTEM_ADMIN] = $rights;
		
		// User
		$rights = array();
		$rights[] = Domain::USERS + Operation::EDIT_OWN;
		$rights[] = Domain::USERS + Operation::VIEW_OWN;
		$rights[] = Domain::PROJECTS + Operation::VIEW_OWN;
		$rights[] = Domain::TEMPLATES + Operation::VIEW;
		// Should users be able to delete their own user accounts? Probably,
		// but not via the listview -- so we should NOT grant DELETE_OWN here.
		//$rights[] = Domain::USERS + Operation::DELETE_OWN;
		self::$_rights[Realm::SITE][Roles::USER] = $rights;
		
		// ----------------------------------------------------------
		// PROJECT REALM
		// ----------------------------------------------------------
		// Project Member (user)
		$rights = array();
		$rights[] = Domain::PROJECTS + Operation::VIEW;
		$rights[] = Domain::TEXTS + Operation::VIEW;
		$rights[] = Domain::QUESTIONS + Operation::VIEW;
		$rights[] = Domain::ANSWERS + Operation::VIEW;
		$rights[] = Domain::ANSWERS + Operation::VIEW_OWN;
		$rights[] = Domain::ANSWERS + Operation::CREATE;
		$rights[] = Domain::ANSWERS + Operation::EDIT_OWN;
		$rights[] = Domain::ANSWERS + Operation::DELETE_OWN;
		$rights[] = Domain::COMMENTS + Operation::VIEW;
		$rights[] = Domain::COMMENTS + Operation::VIEW_OWN;
		$rights[] = Domain::COMMENTS + Operation::CREATE;
		$rights[] = Domain::COMMENTS + Operation::EDIT_OWN;
		$rights[] = Domain::COMMENTS + Operation::DELETE_OWN;
		
		self::$_rights[Realm::PROJECT][Roles::USER] = $rights;
		
		// Project Manager (project_admin) (everything an user has...plus the following)
		$rights = self::$_rights[Realm::PROJECT][Roles::USER];
		$rights[] = Domain::PROJECTS + Operation::EDIT;
		$rights[] = Domain::TEXTS + Operation::CREATE; 
		$rights[] = Domain::TEXTS + Operation::EDIT;
		$rights[] = Domain::TEXTS + Operation::DELETE;
		$rights[] = Domain::QUESTIONS + Operation::CREATE;
		$rights[] = Domain::QUESTIONS + Operation::EDIT;
		$rights[] = Domain::QUESTIONS + Operation::DELETE;
		$rights[] = Domain::ANSWERS + Operation::EDIT;
		$rights[] = Domain::ANSWERS + Operation::DELETE;
		$rights[] = Domain::COMMENTS + Operation::EDIT;
		$rights[] = Domain::COMMENTS + Operation::DELETE;
		$rights[] = Domain::TAGS + Operation::CREATE;
		$rights[] = Domain::TAGS + Operation::EDIT;
		$rights[] = Domain::TAGS + Operation::DELETE;
		$rights[] = Domain::USERS + Operation::CREATE;
		$rights[] = Domain::USERS + Operation::EDIT;
		$rights[] = Domain::USERS + Operation::DELETE;
		$rights[] = Domain::USERS + Operation::VIEW;
		self::grantAllOnDomain($rights, Domain::TEMPLATES);
		
		self::$_rights[Realm::PROJECT][Roles::PROJECT_ADMIN] = $rights;
		
		// System Admin
		$rights = array();
		self::grantAllOnDomain($rights, Domain::USERS);
		self::grantAllOnDomain($rights, Domain::PROJECTS);
		self::grantAllOnDomain($rights, Domain::TEXTS);
		self::grantAllOnDomain($rights, Domain::QUESTIONS);
		self::grantAllOnDomain($rights, Domain::ANSWERS);
		self::grantAllOnDomain($rights, Domain::COMMENTS);
		self::grantAllOnDomain($rights, Domain::TEMPLATES);
		self::grantAllOnDomain($rights, Domain::TAGS);
		
		self::$_rights[Realm::PROJECT][Roles::SYSTEM_ADMIN] = $rights;
		
// 		var_dump(self::$_rights);
	}

	/**
	 * @param array $rights
	 * @param int $domain
	 */
	private static function grantAllOnDomain(&$rights, $domain) {
		foreach (Operation::$operations as $operation) {
			$rights[] = $domain + $operation;
		}
	}
	
	/**
	 * Returns true if the given $role has the $right in the $realm
	 * @param string $realm
	 * @param string $role
	 * @param int $right
	 * @return bool
	 */
	public static function hasRight($realm, $role, $right) {
		CodeGuard::checkNotFalseAndThrow($realm, 'realm');
		CodeGuard::checkNotFalseAndThrow($role, 'role');
		if (!array_key_exists($realm, self::$_rights)) {
			throw new \Exception("Realm '$realm' does not exist.");
		}
		if (!array_key_exists($role, self::$_rights[$realm])) {
			throw new \Exception("Role '$role' does not exist in the '$realm' realm.");
		}
		$result = in_array($right, self::$_rights[$realm][$role]);
		return $result;
	}
	
	/**
	 * Returns the array of rights for this $role in the given $realm
	 * @param string $realm
	 * @param string $role
	 * @return array
	 */
	public static function getRightsArray($realm, $role) {
		CodeGuard::checkNotFalseAndThrow($realm, 'realm');
		CodeGuard::checkNotFalseAndThrow($role, 'role');
		if (!array_key_exists($realm, self::$_rights)) {
			throw new \Exception("Realm '$realm' does not exist.");
		}
		if (!array_key_exists($role, self::$_rights[$realm])) {
			throw new \Exception("Role '$role' does not exist in the '$realm' realm.");
		}
		return self::$_rights[$realm][$role];
	}
	
}
Roles::init();

?>
