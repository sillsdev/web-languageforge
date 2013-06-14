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

class MapperModel /*extends CI_Model*/
{
	protected $_mapper;

	function __construct($mapper, $id)
	{
		$this->_mapper = $mapper;
		if (!empty($id))
		{
			$this->_mapper->read($this, $id);
		}
	}

	/**
	 * @return string The unique id of the object written
	 */
	function write()
	{
		return $this->_mapper->write($this);
	}

}

class MongoMapper
{
	/**
	 *
	 * @var MongoDB
	 */
	protected $_db;

	/**
	 * @var string
	 */
	private $_idKey;

	/**
	 * @param string $database
	 * @param string $collection
	 * @param string $idKey defaults to id
	 */
	public function __construct($database, $idKey = 'id')
	{
		$this->_db = MongoStore::connect($database);
		$this->_idKey = $idKey;
	}

	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $values
	 */
	public function decode($model, $values)
	{
		$properties = get_object_vars($model);
		$idKey = $this->_idKey;
		// Map the Mongo _id to the property $idKey
		if (array_key_exists($idKey, $properties))
		{
			$model->$idKey = $values['_id'];
			unset($properties[$idKey]);
		}
		foreach ($properties as $key => $value)
		{
			if (!array_key_exists($key, $values))
			{
				// oops // TODO Add to list, throw at end CP 2013-06
				continue;
			}
			$model->$key = $values[$key];
		}
	}

	/**
	 * Sets key/values in the array to the public properties of $model
	 * @param object $model
	 * @return array
	 */
	public function encode($model)
	{
		$data = array();
		$properties = get_object_vars($model);
		$idKey = $this->_idKey;
		// We don't want the 'idKey' in the data so remove that from the properties
		if (array_key_exists($idKey, $properties))
		{
			unset($properties[$idKey]);
		}
		foreach ($properties as $key => $value)
		{
			$data[$key] = $value;
		}
		return $data;
	}

	/**
	 *
	 * @param MongoCollection $collection
	 * @param array $data
	 * @param MongoId $id
	 * @return MongoId
	 */
	protected function update($collection, $data, $id)
	{
		assert($id === NULL || is_a($id, 'MongoId'));
		$result = $collection->update(
				array('_id' => $id),
				$data,
				array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
		return isset($result['upserted']) ? $result['upserted'] : $id;
	}

}

?>