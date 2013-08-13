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
		// System Admin has all rights on all operations on all domains
		$rights = array();
		foreach(Domain::$domains as $domain) {
			foreach (Operation::$operations as $operation) {
				$rights[] = $domain + $operation;
			}
		}
		self::$_rights[self::SYSTEM_ADMIN] = $rights;
		
		// User
		$rights = array();
		$rights[] = Domain::USERS + Operation::EDIT_OWN;
		$rights[] = Domain::ANSWERS + Operation::CREATE;
		$rights[] = Domain::ANSWERS + Operation::EDIT_OWN;
		$rights[] = Domain::COMMENTS + Operation::CREATE;
		$rights[] = Domain::COMMENTS + Operation::EDIT_OWN;
		
		self::$_rights[self::USER] = $rights;
		
		// Project Admin
		$rights = self::$_rights[self::USER];
		$rights[] = Domain::PROJECTS + Operation::EDIT_OWN;
		$rights[] = Domain::TEXTS + Operation::CREATE; 
		$rights[] = Domain::TEXTS + Operation::EDIT_OTHER;
		$rights[] = Domain::QUESTIONS + Operation::CREATE;
		$rights[] = Domain::QUESTIONS + Operation::EDIT_OTHER;
		
		self::$_rights[self::PROJECT_ADMIN] = $rights;
		
	}
	
	public static function has($role, $right) {
		return in_array($right, self::$_rights[$role]);
	}
	
}

?>