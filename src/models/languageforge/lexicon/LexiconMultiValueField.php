<?php

namespace models\languageforge\lexicon;


use models\mapper\ArrayOf;

class LexiconMultiValueField {
	
	public function __construct() {
		$this->values = new ArrayOf();
	}
	
	public $values;
	
	public function value($value) {
		if ($this->values->count() <= 0 || !array_search($value, $this->values)) {
			$this->values[] = $value;
		}
	}
	
}

?>
