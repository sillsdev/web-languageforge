<?php

namespace models\mapper;

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

	public function makeId() {
		$id = new \MongoId();
		return (string)$id;
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
			throw new \Exception("Invalid id '$id' ($type)");
		}
		$data = $this->_collection->findOne(array("_id" => new \MongoId($id)));
		if ($data === NULL)
		{
			throw new \Exception("Could not find id '$id'");
		}
		try {
			$decoder = new JsonDecoder($this->_idKey);
			$decoder->decode($model, $data);
		} catch (\Exception $ex) {
			throw new \Exception("Exception thrown while reading '$id'", $ex->getCode(), $ex);
		}
	}
	
	public function write($model)
	{
		$encoder = new JsonEncoder($this->_idKey);
		$data = $encoder->encode($model);
		return $this->update($this->_collection, $data, $model->id);
	}

	public function readSubDocument($model, $rootId, $property, $id) {
		if (!is_string($rootId) || empty($rootId)) {
			$type = get_class($rootId);
			throw new \Exception("Bad root id '$rootId' ($type)");
		}		
		if (!is_string($id) || empty($id)) {
			$type = get_class($id);
			throw new \Exception("Bad id '$id' ($type)");
		}
		$data = $this->_collection->findOne(array("_id" => new \MongoId($rootId)), array($property . '.' . $id));
		if ($data === NULL)
		{
			throw new \Exception("Could not find $property=$id in $rootId");
		}
		$data = $data[$property][$id];
		$data['_id'] = $id;
		error_log(var_export($data, true));
		$decoder = new JsonDecoder($this->_idKey);
		$decoder->decode($model, $data);
	}
	
	public function writeSubDocument($model, $rootId, $property) {
		$encoder = new JsonEncoder($this->_idKey);
		$data = $encoder->encode($model);
		$idKey = $this->_idKey;
		$id = $model->$idKey;
		if (empty($id)) {
			$id = MongoStore::makeKey($model->keyString());
		}
		$id = $this->updateSubDocument($this->_collection, $data, $rootId, $property, $id);
		return $id;
	}
	
	public function remove($id)
	{
		if (!is_string($id) || empty($id)) {
			throw new \Exception("Invalid id '$id'");
		}
		$result = $this->_collection->remove(
			array('_id' => new \MongoId($id)),
			array('safe' => true)
		);
		return $result['n'];
	}
	
	public function removeSubDocument($rootId, $property, $id) {
		if (!is_string($rootId) || empty($rootId)) {
			throw new \Exception("Invalid rootId '$rootId'");
		}
		if (!is_string($id) || empty($id)) {
			throw new \Exception("Invalid id '$id'");
		}
		$result = $this->_collection->update(
				array('_id' => new \MongoId($rootId)),
				array('$unset' => array($property . '.' . $id => '')),
				array('multiple' => false, 'safe' => true)
		);
		// TODO Have a closer look at $result and throw if things go wrong CP 2013-07
		return $result['ok'] ? $result['n'] : 0;
	}
	
	/**
	 * @param MongoCollection $collection
	 * @param array $data
	 * @param string $id
	 * @return string
	 */
	protected function update($collection, $data, $id)
	{
		if (!is_string($id) && !empty($id)) {
			$type = get_class($id);
			throw new \Exception("Bad id '$id' ($type)");
		}
		if (!$id) {
			$id = NULL;
		}
		$result = $collection->update(
				array('_id' => new \MongoId($id)),
				array('$set' => $data),
				array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
		return isset($result['upserted']) ? $result['upserted'].$id : $id;
	}
	
	/**
	 * @param MongoCollection $collection
	 * @param array $data
	 * @param string $rootId
	 * @param string $property
	 * @param string $id
	 * @return string
	 */
	protected function updateSubDocument($collection, $data, $rootId, $property, $id)
	{
		if (!is_string($rootId)) {
			$type = get_class($rootId);
			throw new \Exception("Bad root id '$rootId' ($type)");
		}		
		if (!is_string($id)) {
			$type = get_class($id);
			throw new \Exception("Bad id '$id' ($type)");
		}
		$result = $collection->update(
				array('_id' => new \MongoId($rootId)),
				array('$set' => array($property . '.' . $id => $data)),
				array('upsert' => false, 'multiple' => false, 'safe' => true)
		);
		// TODO REVIEW Pretty sure this doesn't count as an upsert.  The $rootId document *must* exist therefore isn't an upsert.
		return isset($result['upserted']) ? $result['upserted'].$id : $id;
	}
	

}

?>