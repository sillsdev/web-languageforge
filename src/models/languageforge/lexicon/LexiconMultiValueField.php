<?php

namespace models\languageforge\lexicon;


use models\mapper\ArrayOf;

class LexiconMultiValueField {
	
	public function __construct() {
		$this->values = new ArrayOf();

	}
	
	public $values;
}

?>
