<?php
namespace models\mapper;

class ArrayOf {
	
	/**
	 * @var array<Of>
	 */
	public $data;
	
	/**
	 * 
	 * @var string
	 */
	private $_type;
	
	/**
	 * @var function The function <object> function($data = null) returns an instance of the object.
	 */
	private $_generator;
	
	const VALUE = 'value';
	const OBJECT = 'object';
	
	/**
	 * @param string Either ArrayOf::VALUE or ArrayOf::OBJECT
	 * @param function The function <object> function($data = null) returns an instance of the object.
	 */
	public function __construct($type, $generator = null) {
		$this->data = array();
		$this->_type = $type;
		$this->_generator = $generator;
	}
	
	public function generate($data = null) {
		return $this->_generator($data);
	}
	
	public function getType() {
		return $this->_type;
	}
	
}

?>