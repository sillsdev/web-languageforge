<?php

namespace models\shared\rights;

use libraries\shared\palaso\CodeGuard;

class SiteRoles extends RolesBase {
	
	const SYSTEM_ADMIN = 'system_admin';  // highest possible level
	const SITE_MANAGER = 'site_manager';  // intermediate permission level with various management responsibilities like creating projects
	const USER = 'user';
	const NONE = 'none';
	
	
	public static function init() {
		self::$_rights = array();
		
		// User
		$rights = array();
		$rights[] = Domain::USERS + Operation::EDIT_OWN;
		$rights[] = Domain::USERS + Operation::VIEW_OWN;
		$rights[] = Domain::PROJECTS + Operation::VIEW_OWN;
		// Should users be able to delete their own user accounts? Probably,
		// but not via the listview -- so we should NOT grant DELETE_OWN here.
		//$rights[] = Domain::USERS + Operation::DELETE_OWN;
		self::$_rights[self::USER] = $rights;

		// Site Manager (everything the user has, plus some)
		$rights = self::$_rights[self::USER];
		$rights[] = Domain::USERS + Operation::CREATE;
		$rights[] = Domain::USERS + Operation::EDIT;
		$rights[] = Domain::USERS + Operation::VIEW;
		$rights[] = Domain::USERS + Operation::ARCHIVE;
		$rights[] = Domain::PROJECTS + Operation::CREATE;
		$rights[] = Domain::PROJECTS + Operation::EDIT;
		$rights[] = Domain::PROJECTS + Operation::VIEW;
		self::$_rights[self::SITE_MANAGER] = $rights;
		
		// System Admin
		$rights = array();
		self::grantAllOnDomain($rights, Domain::USERS);
		self::grantAllOnDomain($rights, Domain::PROJECTS);
		self::$_rights[self::SYSTEM_ADMIN] = $rights;
	}

	private static $_rights;
	public static function hasRight($role, $right) { return self::_hasRight(self::$_rights, $role, $right); }
	public static function getRightsArray($role) { return self::_getRightsArray(self::$_rights, $role); }
	
	
}
SiteRoles::init();
?>