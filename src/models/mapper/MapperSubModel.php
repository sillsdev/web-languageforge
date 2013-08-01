<?php

namespace models\mapper;

class MapperSubModel
{
	protected $_mapper;
	
	protected $_rootId;
	protected $_property;

	protected function __construct($mapper, $rootId, $property, $id = NULL) {
		$this->_mapper = $mapper;
		$this->_rootId = $rootId;
		$this->_property = $property;
		if (!empty($id))
		{
			$this->read($id);
		}
	}
	
	/**
	 * Reads the model from the mongo collection
	 * @see MongoMapper::read()
	 */
	function read($id) {
		return $this->_mapper->readSubDocument($this, $this->_rootId, $this->_property, $id);
	}
	
	/**
	 * Writes the model to the mongo collection
	 * @return string The unique id of the object written
	 * @see MongoMapper::write()
	 */
	function write() {
		$this->id = $this->_mapper->writeSubDocument($this, $this->_rootId, $this->_property);
		return $this->id;
	}
	
	public function keyString() {
		return $this->_mapper->makeId();
	}
	
}

?>