<?php

namespace models\mapper;

class MapperListModel
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
	protected function __construct($mapper, $query = array(), $fields = array()) {
		$this->_mapper = $mapper;
		$this->_query = $query;
		$this->_fields = $fields;
	}

	function read() {
		return $this->_mapper->readList($this, $this->_query, $this->_fields);
	}
	
	function readAsModels() {
		return $this->_mapper->readListAsModels($this, $this->_query, $this->_fields);
	}

	// TODO Would be nice to deprecate this or at least have it protected not public. Derived models can run their own specific query. CP 2013-11
	function readByQuery($query, $fields = array(), $sortFields = array(), $limit = 0) {
		return $this->_mapper->readList($this,$query, $fields, $sortFields ,$limit);
	}
	
}

?>