<?php
namespace models\mapper;

class Id {
	public $id;
	
	public function __construct($id = null) {
		$this->id = $id;
	}
	
	public function __toString() {
		return $this->id;
	}
}

?>