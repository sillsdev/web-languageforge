<?php
namespace models\mapper;

class Id {
	public $id;
	
	public function __construct($id = null) {
		$this->id = $id;
	}
	
	public static function isEmpty($id) {
		return empty($id) || empty($id->id);
	}
	
	public function __toString() {
		return $this->id;
	}
}

?>