<?php
namespace models\shared\rights;

class RolesBase {
	
	/**
	 * @var array
	 */
	protected static $_rights;
	
	/**
	 * Roles subclasses should extend this method
	 */
	public static function init() {
		self::$_rights = array();
	}
	
	/**
	 * @param array $rights
	 * @param int $domain
	 */
	protected static function grantAllOnDomain(&$rights, $domain) {
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
	public static function hasRight($role, $right) {
		CodeGuard::checkNotFalseAndThrow($role, 'role');
		if (!array_key_exists($role, self::$_rights)) {
			throw new \Exception("Role '$role' does not exist");
		}
		$result = in_array($right, self::$_rights[$role]);
		return $result;
	}
	
	/**
	 * Returns the array of rights for this $role in the given $realm
	 * @param string $realm
	 * @param string $role
	 * @return array
	 */
	public static function getRightsArray($role) {
		CodeGuard::checkNotFalseAndThrow($role, 'role');
		if (!array_key_exists($role, self::$_rights)) {
			throw new \Exception("Role '$role' does not exist.");
		}
		return self::$_rights[$role];
	}
	
}

?>