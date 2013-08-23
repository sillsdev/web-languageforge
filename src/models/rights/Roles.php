<?php
namespace models\rights;

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
		
		self::$_rights[Realm::SITE][Roles::SYSTEM_ADMIN] = $rights;
		
		// User
		$rights = array();
		$rights[] = Domain::USERS + Operation::EDIT_OWN;
		self::$_rights[Realm::SITE][Roles::USER] = $rights;
		
		// ----------------------------------------------------------
		// PROJECT REALM
		// ----------------------------------------------------------
		// User
		$rights = array();
		$rights[] = Domain::ANSWERS + Operation::CREATE;
		$rights[] = Domain::ANSWERS + Operation::EDIT_OWN;
		$rights[] = Domain::COMMENTS + Operation::CREATE;
		$rights[] = Domain::COMMENTS + Operation::EDIT_OWN;
		
		self::$_rights[Realm::PROJECT][Roles::USER] = $rights;
		
		// Project Admin
		$rights = self::$_rights[Realm::PROJECT][Roles::USER];
		$rights[] = Domain::PROJECTS + Operation::EDIT_OWN;
		$rights[] = Domain::TEXTS + Operation::CREATE; 
		$rights[] = Domain::TEXTS + Operation::EDIT_OTHER;
		$rights[] = Domain::QUESTIONS + Operation::CREATE;
		$rights[] = Domain::QUESTIONS + Operation::EDIT_OTHER;
		$rights[] = Domain::USERS + Operation::CREATE;
		$rights[] = Domain::USERS + Operation::EDIT_OTHER;
		$rights[] = Domain::USERS + Operation::DELETE_OTHER;
		
		self::$_rights[Realm::PROJECT][Roles::PROJECT_ADMIN] = $rights;
		
		// System Admin
		$rights = array();
		self::grantAllOnDomain($rights, Domain::USERS);
		self::grantAllOnDomain($rights, Domain::PROJECTS);
		self::grantAllOnDomain($rights, Domain::TEXTS);
		self::grantAllOnDomain($rights, Domain::QUESTIONS);
		self::grantAllOnDomain($rights, Domain::ANSWERS);
		self::grantAllOnDomain($rights, Domain::COMMENTS);

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
		return self::$_rights[$realm][$role];
	}
	
}
Roles::init();

?>