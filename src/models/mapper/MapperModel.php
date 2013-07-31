<?php

namespace models\mapper;

use libraries\palaso\CodeGuard;

class MapperModel
{
	protected $_mapper;

	protected function __construct($mapper, $id = '') {
		$this->_mapper = $mapper;
		CodeGuard::checkTypeAndThrow($id, 'string');
		if (!empty($id)) {
			$this->read($id);
		}
	}
	
	/**
	 * Reads the model from the mongo collection
	 * @param string $id
	 * @see MongoMapper::read()
	 */
	function read($id) {
		return $this->_mapper->read($this, $id);
	}
	
	/**
	 * Writes the model to the mongo collection
	 * @return string The unique id of the object written
	 * @see MongoMapper::write()
	 */
	function write() {
		CodeGuard::checkTypeAndThrow($this->id, 'models\mapper\Id');
		$this->id->id = $this->_mapper->write($this);
		return $this->id->id;
	}
}

?>