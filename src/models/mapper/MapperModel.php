<?php

namespace models\mapper;

use libraries\shared\palaso\CodeGuard;

class MapperModel
{
	/**
	 * 
	 * @var MongoMapper
	 */
	protected $_mapper;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateModified;
	
	/**
	 * 
	 * @var \DateTime
	 */
	public $dateCreated;

	/**
	 * 
	 * @var array
	 */
	private $_privateProperties;
	
	/**
	 * 
	 * @var array
	 */
	private $_readOnlyProperties;
	
	protected function setReadOnlyProp($propertyName) {
		if (!is_array($this->_readOnlyProperties)) {
			$this->_readOnlyProperties = array();
		}
		if (!in_array($propertyName, $this->_readOnlyProperties)) {
			$this->_readOnlyProperties[] = $propertyName;
		}
	}
	protected function setPrivateProp($propertyName) {
		if (!is_array($this->_privateProperties)) {
			$this->_privateProperties = array();
		}
		if (!in_array($propertyName, $this->_privateProperties)) {
			$this->_privateProperties[] = $propertyName;
		}
	}
	
	public function getReadOnlyProperties() {
		return $this->_readOnlyProperties;
	}
	
	public function getPrivateProperties() {
		return $this->_privateProperties;
	}
	

	/**
	 * 
	 * @param MongoMapper $mapper
	 * @param string $id
	 */
	protected function __construct($mapper, $id = '') {
		$this->_mapper = $mapper;
		$this->dateModified = new \DateTime();
		$this->dateCreated = new \DateTime();
		$this->setReadOnlyProp('dateModified');
		$this->setReadOnlyProp('dateCreated');
		CodeGuard::checkTypeAndThrow($id, 'string');
		if (!empty($id)) {
			$this->read($id);
		}
	}
	
        // TODO Would be nice to deprecate this. Should be removed. Derived models should do their own query, or have methods that do the right query not elsewhere in app code. CP 2013-11
	public function findOneByQuery($query, $fields = array()) {
		return $this->_mapper->findOneByQuery($this, $query, $fields = array());
	}
	
	/**
	 * Reads the model from the mongo collection
	 * @param string $id
	 * @see MongoMapper::read()
	 */
	public function read($id) {
		return $this->_mapper->read($this, $id);
	}
	
	/**
	 * 
	 * @param string $property
	 * @param string $value
	 * @return boolean
	 */
	public function readByProperty($property, $value) {
		return $this->_mapper->readByProperty($this, $property, $value);
	}

	/**
	 * 
	 * @param array $properties
	 * @return boolean
	 */
	public function readByProperties($properties) {
		return $this->_mapper->readByProperties($this, $properties);
	}
	
	/**
	 * Writes the model to the mongo collection
	 * @return string The unique id of the object written
	 * @see MongoMapper::write()
	 */
	public function write() {
		CodeGuard::checkTypeAndThrow($this->id, 'models\mapper\Id');
		$this->dateModified = new \DateTime();
		if (Id::isEmpty($this->id)) {
			$this->dateCreated = new \DateTime();
		}
		$this->id->id = $this->_mapper->write($this, $this->id->id);
		return $this->id->id;
	}
	
	/**
	 * returns true if the Id exists in the collection, false otherwise 
	 * @param string $id
	 * @return bool
	 */
	public function exists($id) {
		$idExists = $this->_mapper->exists($id);
		return $idExists;
	}

	/**
	 * Returns the database name
	 * @return string
	 */
	public function databaseName() {
		return $this->_mapper->databaseName();
	}
}

?>