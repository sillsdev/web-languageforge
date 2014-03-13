<?php

namespace models\languageforge\lexicon;


use models\mapper\ArrayOf;

class LexiconMultiValueField {
	
	public function __construct() {
		$this->values = new ArrayOf();
	}
	
	public $values;
	
	public function value($value) {
		if ($this->values->count() <= 0 || !$this->array_search($value)) {
			$this->values[] = $value;
		}
	}
	
	/**
	 * Return true if needle exists in the data
	 * @param unknown $needle
	 * @return boolean
	 */
	public function array_search($needle) {
		foreach ($this->values as $value) {
			if ($value == $needle) {
				return true;
			}
		}
		return false;
	}
	
}

?>
