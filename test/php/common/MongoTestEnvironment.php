<?php

class MongoTestEnvironment
{
	
	/**
	 * @var MongoDB
	 */
	private $_db;
	
	public function __construct()
	{
		global $config;
		$this->_db = MongoStore::connect($config['default']['mongo_database']);
	}
	
	public function clean()
	{
		foreach ($this->_db->listCollections() as $collection)
		{
			$collection->drop();
		}
	}
		
}