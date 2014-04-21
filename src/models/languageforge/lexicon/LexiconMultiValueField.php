<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexiconMultiValueField {
	
	/**
	 * 
	 * @var ArrayOf
	 */
	public $values;
	
	
	public function __construct($values = array()) {
		$this->values = new ArrayOf();
		$this->values->exchangeArray($values);
	}
	
	public function value($value) {
		if ($this->values->array_search($value) === FALSE) {
			$this->values[] = $value;
		}
	}
}

?>
