<?php
namespace models\mapper;

use libraries\palaso\CodeGuard;

class ArrayOf extends \ArrayObject {
	
	/**
	 * @param function The function <object> function($data = null) returns an instance of the object.
	 */
	public function __construct($generator = null) {
		$this->_generator = $generator;
	}
	
	/**
	 * @var function The function <object> function($data = null) returns an instance of the object.
	 */
	private $_generator;
	
	private $data; // This is here to force client code using the older implementation to have a fatal error allowing us to identify code that needs upgrading. CP 2013-12
	
	public function generate($data = null) {
		$function = $this->_generator;
		return $function($data);
	}
	
	public function hasGenerator() {
		return $this->_generator != null;
	}
	
	public function offsetGet($index) {
		CodeGuard::checkTypeAndThrow($index, 'integer');
		return parent::offsetGet($index);
	}
	
	public function offsetSet($index, $newval) {
		if ($index != NULL) {
			CodeGuard::checkTypeAndThrow($index, 'integer');
		}
		parent::offsetSet($index, $newval);
	}
	
}

?>
