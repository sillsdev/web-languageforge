<?php

namespace libraries\sf;

if (!defined('SF_DATABASE'))
{
	define('SF_DATABASE', 'scriptureforge');
}

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

class MapperModel /*extends CI_Model*/
{
	protected $_mapper;

	protected function __construct($mapper, $id = NULL)
	{
		$this->_mapper = $mapper;
		if (!empty($id))
		{
			$this->_mapper->read($this, $id);
		}
	}
	
	/**
	 * Reads the model from the mongo collection
	 * @see MongoMapper::read()
	 */
	function read()
	{
		return $this->_mapper->read($this, $this->id);
	}
	
	/**
	 * Writes the model to the mongo collection
	 * @return string The unique id of the object written
	 * @see MongoMapper::write()
	 */
	function write()
	{
		$this->id = $this->_mapper->write($this); 
		return $this->id;
	}
}

class MapperListModel /*extends CI_Model*/
{
	/**
	 * @var int
	 */
	public $count;
	
	/**
	 * @var array
	 */
	public $entries;
	
	/**
	 * @var MongoMapper
	 */
	protected $_mapper;

	/**
	 * @var array
	 */
	protected $_query;

	/**
	 * @var array
	 */
	protected $_fields;
	
	/**
	 * @param MongoMapper $mapper
	 * @param array $query
	 * @param array $fields
	 */
	protected function __construct($mapper, $query, $fields = array())
	{
		$this->_mapper = $mapper;
		$this->_query = $query;
		$this->_fields = $fields;
	}

	function read()
	{
		return $this->_mapper->readList($this, $this->_query, $this->_fields);
	}
	
}

class ReferenceList {
	public $refs;
	
	public function __construct() {
		$this->refs = array();
	}
	
	/**
	 * @param string $theirId - the id of the referent
	 * @param string $theirRefList - the referent's reference list back to us
	 * @param string $myId - the id of the model containing this reference list
	 */
	/*
	public function addRef($theirId, $theirRefList, $myId) {
		$this->_addRef($theirId);
		$theirRefList->_addRef($myId);
	}
	*/
	
	/**
	 * @see addRef - this should only be called by the addRef method of other ReferenceLists
	 * @param string $id
	 */
	public function _addRef($id) {
		if (!in_array($id, $this->refs)) {
			$this->refs[] = $id;
		}
		// TODO log if ref already exists?
	}
	
	/**
	 * @param string $theirId - the id of the referent
	 * @param string $theirRefList - the referent's reference list back to us
	 * @param string $myId - the id of the model containing this reference list
	 */
	/*
	public function removeRef($theirId, $theirRefList, $myId) {
		$this->_removeRef($theirId);
		$theirRefList->_removeRef($myId);
	}
	*/
	
	/**
	 * @see removeRef - this should only be called by the removeRef method of other ReferenceLists
	 * @param string $id
	 */
	public function _removeRef($id) {
		if (in_array($id, $this->refs)) {
			$this->refs = array_diff($this->refs, array($id));
		}
		// TODO Log if ref doesn't exist?
	}
	
	/**
	 * Removes References back to me contained in my own ReferenceList
	 * Note: this calls $model->write() on the models that refer back to me in their ReferenceList
	 * 
	 * @param string $myId - the id of the model containing this reference list
	 * @param string $theirModelName - the name of their model e.g. 'ProjectModel'
	 * @param string $theirRefListName - the property name of the reference list on their model e.g. 'users'
	 */
	/*
	public function removeOtherRefs($myId, $theirModelName, $theirRefListName) {
		foreach ($this->refs as $theirId) {
			$theirModel = new $theirModelName($theirId);
			$theirRefList = $theirModel->$theirRefListName;
			$theirRefList->_removeRef($myId);
			$theirModel->write();
		}
	}
	*/
}

class MongoMapper
{
	/**
	 * @var MongoDB
	 */
	protected $_db;

	/**
	 * @var MongoCollection
	 */
	protected $_collection;
	
	/**
	 * @var string
	 */
	private $_idKey;

	/**
	 * @param string $database
	 * @param string $collection
	 * @param string $idKey defaults to id
	 */
	protected function __construct($database, $collection, $idKey = 'id')
	{
		$this->_db = MongoStore::connect($database);
		$this->_collection = $this->_db->$collection;
		$this->_idKey = $idKey;
	}
	
	/**
	 * Private clone to prevent copies of the singleton.
	 */
	private function __clone()
	{
	}

	/**
	 * Returns the name of the database.
	 * @return string
	 */
	public function databaseName() {
		return (string)$this->_db;
	}
	
	public function readList($model, $query, $fields = array())
	{
		$cursor = $this->_collection->find($query, $fields);
		$model->count = $cursor->count();
		$model->entries = array();
		foreach ($cursor as $item) {
			$id = strval($item['_id']);
			$item[$this->_idKey] = $id;
			unset($item['_id']);
			$model->entries[] = $item;
		}
	}
	
	/**
	 * @param Object $model
	 * @param string $id
	 */
	public function read($model, $id)
	{
		if (!is_string($id) || empty($id)) {
			$type = get_class($id);
			throw new \Exception("Bad id '$id' ($type)");
		}		
		$data = $this->_collection->findOne(array("_id" => new \MongoId($id)));
		if ($data === NULL)
		{
			throw new \Exception("Could not find id '$id'");
		}
		try {
			$this->decode($model, $data);
		} catch (\Exception $ex) {
			throw new \Exception("Exception thrown while reading '$id'", $ex->getCode(), $ex);
		}
	}
	
	public function write($model)
	{
		$data = $this->encode($model);
		return $this->update($this->_collection, $data, $model->id);
	}

	/**
	 * Sets the public properties of $model to values from $values[propertyName]
	 * @param object $model
	 * @param array $data
	 */
	public function decode($model, $data)
	{
		$properties = get_object_vars($model);
		$idKey = $this->_idKey;
		// Map the Mongo _id to the property $idKey
		if (array_key_exists($idKey, $properties))
		{
			$model->$idKey = (string)$data['_id']; // MongoId
			unset($properties[$idKey]);
		}
		foreach ($properties as $key => $value)
		{
			if (!array_key_exists($key, $data))
			{
				// oops // TODO Add to list, throw at end CP 2013-06
				continue;
			}
			if (is_a($value, 'libraries\sf\ReferenceList')) {
				$this->decodeReferenceList($model->$key, $data[$key]);
			} else {
				$model->$key = $data[$key];
			}
		}
	}
	
	/**
	 * Decodes the mongo array into the ReferenceList $model
	 * @param ReferenceList $model
	 * @param array $data
	 * @throws \Exception
	 */
	public function decodeReferenceList($model, $data) {
		$model->refs = array();
		if (array_key_exists('refs', $data)) {
			// This is bogus data who put that here.
			throw new \Exception(
				"Bad refs structure 'refs'"
			);
		}
		$refsArray = $data;
		foreach ($refsArray as $objectId) {
			if (!is_a($objectId, 'MongoId')) {
				throw new \Exception(
					"Invalid type '" . gettype($objectId) . "' in ref collection '$key'"
				);
			}
			array_push( $model->refs, (string)$objectId );
		}
	}

	/**
	 * Sets key/values in the array from the public properties of $model
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
			if (is_a($value, 'libraries\sf\ReferenceList')) {
				$data[$key] = $this->encodeReferenceList($model->$key);
			} else {
				if ($key == 'projects' || $key == 'users') {
					throw new \Exception("Possible bad write of '$key'\n" . var_export($model, true));
				}
				$data[$key] = $value;
			}
		}
		return $data;
	}
	
	public function encodeReferenceList($model) {
		$result = array_map(
			function($id) {
				return new \MongoId($id);
			},
			$model->refs
		);
		return $result;
	}

	public function remove($id)
	{
		if (!is_string($id) || empty($id)) {
			throw new \Exception("Bad id '$id'");
		}
// 		assert(is_string($id) && !empty($id));
		$result = $this->_collection->remove(
			array('_id' => new \MongoId($id)),
			array('safe' => true)
		);
		return $result;
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
		if (!$id) {
			$id = NULL;
		}
		assert($id === NULL || is_string($id));
		$result = $collection->update(
				array('_id' => new \MongoId($id)),
				array('$set' => $data),
				array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
		return isset($result['upserted']) ? $result['upserted'].$id : $id;
	}

}

?>
