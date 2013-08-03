<?php

namespace models\mapper;

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
		if (!isset(static::$_pool[$databaseName])) {
			static::$_pool[$databaseName] = static::connectMongo($databaseName);
		}
		return static::$_pool[$databaseName];
	}
	
	/**
	 * @param string $databaseName
	 * @return MongoDB
	 */
	private static function connectMongo($databaseName) {
		if (static::$_mongo == null) {
			static::$_mongo = new \Mongo();
		}
		return static::$_mongo->selectDB($databaseName);
	}
	
	public static function hasDB($databaseName) {
		$databases = static::$_mongo->listDBs();
		$result = array_filter($databases['databases'], function($item) use($databaseName) { return $item['name'] == $databaseName; } );
		return count($result) != 0;
	}
	
}

?>