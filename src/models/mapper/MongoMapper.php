<?php

namespace models\mapper;

use libraries\palaso\CodeGuard;

class MongoMapper
{
	
	const ID_IN_KEY = 0;
	const ID_IN_DOC = 1;
	
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
	protected function __construct($database, $collection, $idKey = 'id') {
		$this->_db = MongoStore::connect($database);
		$this->_collection = $this->_db->$collection;
		$this->_idKey = $idKey;
	}
	
	/**
	 * Private clone to prevent copies of the singleton.
	 */
	private function __clone() {
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
	
	public static function mongoID($id = '') {
		CodeGuard::checkTypeAndThrow($id, 'string');
		if (!empty($id)) {
			return new \MongoId($id);
		}
		return new \MongoId(); 
	}
	
	public function readList($model, $query, $fields = array()) {
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
	public function read($model, $id) {
		CodeGuard::checkTypeAndThrow($id, 'string');
		$data = $this->_collection->findOne(array("_id" => self::mongoID($id)));
		if ($data === NULL) {
			throw new \Exception("Could not find id '$id'");
		}
		try {
			MongoDecoder::decode($model, $data);
		} catch (\Exception $ex) {
			throw new \Exception("Exception thrown while reading '$id'", $ex->getCode(), $ex);
		}
	}
	
	public function readSubDocument($model, $rootId, $property, $id) {
		CodeGuard::checkTypeAndThrow($rootId, 'string');
		CodeGuard::checkTypeAndThrow($id, 'string');
		$data = $this->_collection->findOne(array("_id" => self::mongoID($rootId)), array($property . '.' . $id));
		if ($data === NULL) {
			throw new \Exception("Could not find $property=$id in $rootId");
		}
		$data = $data[$property][$id];
		$data['_id'] = $id;
		error_log(var_export($data, true));
		MongoDecoder::decode($model, $data);
	}
	
	/**
	 * @param object $model
	 * @param string $id
	 * @param int $keyStyle
	 * @param string $rootId
	 * @param string $property
	 * @see ID_IN_KEY
	 * @see ID_IN_DOC
	 * @return string
	 */
	public function write($model, $id, $keyStyle = MongoMapper::ID_IN_KEY, $rootId = '', $property = '') {
		CodeGuard::checkTypeAndThrow($rootId, 'string');
		CodeGuard::checkTypeAndThrow($property, 'string');
		CodeGuard::checkTypeAndThrow($id, 'string');
		$data = MongoEncoder::encode($model); // TODO Take into account key style for stripping key out of the model if needs be
		if (empty($rootId)) {
			// We're doing a root level update, only $model, $id are relevant
			$id = $this->update($this->_collection, $data, $id);
		} else {
			if ($keyStyle == self::ID_IN_KEY) {
				if (empty($id)) {
					$id = MongoStore::makeKey($model->keyString());
				}
				$id = $this->updateSubDocument($data, $id, self::ID_IN_KEY, $rootId, $property);
			} else {
				if (empty($id)) {
					// TODO would be nice if the encode above gave us the id it generated so we could return it to be consistent. CP 2013-08
					$this->appendSubDocument($data, $rootId, $property);
				} else {
					$id = $this->updateSubDocument($data, $id, self::ID_IN_DOC, $rootId, $property);
				}
			}
		}
		return $id;
	}
	
	public function remove($id) {
		CodeGuard::checkTypeAndThrow($id, 'string');
		$result = $this->_collection->remove(
			array('_id' => self::mongoID($id)),
			array('safe' => true)
		);
		return $result['n'];
	}
	
	public function removeSubDocument($rootId, $property, $id) {
		CodeGuard::checkTypeAndThrow($rootId, 'string');
		CodeGuard::checkTypeAndThrow($id, 'string');
		$result = $this->_collection->update(
				array('_id' => self::mongoId($rootId)),
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
	protected function update($collection, $data, $id) {
		CodeGuard::checkTypeAndThrow($id, 'string');
		CodeGuard::checkNullAndThrow($data, 'data');
		$result = $collection->update(
				array('_id' => self::mongoID($id)),
				array('$set' => $data),
				array('upsert' => true, 'multiple' => false, 'safe' => true)
		);
		return isset($result['upserted']) ? (string)$result['upserted'] : $id;
	}
	
	/**
	 * @param array $data
	 * @param string $rootId
	 * @param string $property
	 * @param string $id
	 * @return string
	 */
	protected function updateSubDocument($data, $id, $keyType, $rootId, $property) {
		CodeGuard::checkTypeAndThrow($rootId, 'string');
		CodeGuard::checkTypeAndThrow($id, 'string');
		CodeGuard::checkNullAndThrow($id, 'id');
		if ($keyType == self::ID_IN_KEY) {
			$result = $this->_collection->update(
					array('_id' => self::mongoId($rootId)),
					array('$set' => array($property . '.' . $id => $data)),
					array('upsert' => false, 'multiple' => false, 'safe' => true)
			);
		} else {
			$result = $this->_collection->update(
					array('_id' => self::mongoId($rootId)),
					array('$set' => array($property . '$' . $id => $data)),
					array('upsert' => false, 'multiple' => false, 'safe' => true)
			);
		}
		// TODO REVIEW Pretty sure this doesn't count as an upsert.  The $rootId document *must* exist therefore isn't an upsert.
		// TODO REVIEW Returning anything here is pointless. It will always be the id given, and throw on error.
		return isset($result['upserted']) ? $result['upserted'].$id : $id;
	}
	

}

?>