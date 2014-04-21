<?php
namespace libraries\lfdictionary\common;

/**
 * A shared pool of named database connections
 * TODO Delete.
 */
class DataConnector {
	
	/**
	 * @var array(DataConnection)
	 */
	private static $_connections = array();
	
	/**
	 * @param string $name
	 * @param string $database
	 * @param string $user
	 * @param string $password
	 * @param string $host
	 * @return DataConnection
	 */
	public static function connect($name = 'lfweb', $database = null, $user = null, $password = null, $host = 'localhost') {
		if (isset(self::$_connections[$name])) {
			return self::$_connections[$name];
		}
		if ($database || $user || $password) {
			self::$_connections[$name] = new DataConnection($database, $user, $password, $host);
			return self::$_connections[$name];
		}
		switch ($name) {
			case 'lfweb':
				self::$_connections[$name] = new DataConnection(DB_NAME, DB_USER, DB_PASS, DB_SERVER);
				break;
			case 'lftest':
				self::$_connections[$name] = new DataConnection(DB_NAME, DB_USER, DB_PASS, DB_SERVER);
				break;
		}
		return self::$_connections[$name];
	}
	
}

?>
