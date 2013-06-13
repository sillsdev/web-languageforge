<?php

class MongoStore
{
	/**
	 * @var MongoDB[]
	 */
	private static $_pool = array();
	

	/**
	 * @var Mongo
	 */
	private static $_mongo;
	
	/**
	 * @param string $databaseName
	 * @return MongoDB
	 */
	public static function connect($databaseName) {
		if (!isset(self::$_pool[$databaseName])) {
			self::$_pool[$databaseName] = self::connectMongo($databaseName);
		}
		return self::$_pool[$databaseName];
	}
	
	/**
	 * @param string $databaseName
	 * @return MongoDB
	 */
	private static function connectMongo($databaseName) {
		if (self::$_mongo == null) {
			self::$_mongo = new Mongo();
		}
		return self::$_mongo->selectDB($databaseName);
	}
	
}

?>