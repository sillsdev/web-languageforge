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
		$function = $this->_generator;
		return $function($data);
	}
	
	public function getType() {
		return $this->_type;
	}
	
	public function append($var) {
		$this->data[] = $var;
	}
	
	public function count() {
		return count($this->data);
	}
	
	public function getById($id) {
		if ($this->_type == ArrayOf::OBJECT) {
			try {
				foreach ($this->data as $obj) {
					if ($obj->id == $id) {
						return $obj;
					}
				}
			} catch (Exception $e) {
				// don't throw if $obj->id doesn't exist
			}
		}
		return $this->generate();
	}
}

?>