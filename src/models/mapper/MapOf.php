<?php
namespace models\mapper;

class MapOf {
	
	/**
	 * @var array<key, Of>
	 */
	public $data;
	
	/**
	 * @var function The function <object> function($data = null) returns an instance of the object.
	 */
	private $_generator;
	
	/**
	 * @param function The function <object> function($data = null) returns an instance of the object.
	 */
	public function __construct($generator = null) {
		$this->data = array();
		$this->_generator = $generator;
	}
	
	public function generate($data = null) {
		$function = $this->_generator;
		return $function($data);
	}
	
	public function hasGenerator() {
		return $this->_generator != null;
	}
	
	public function count() {
		return count($this->data);
	}
}

?>