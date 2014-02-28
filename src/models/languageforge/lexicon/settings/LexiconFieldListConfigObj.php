<?php

namespace models\languageforge\lexicon\settings;

use models\mapper\ArrayOf;

use models\mapper\MapOf;

class LexiconFieldListConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::FIELDLIST;
		$this->fieldOrder = new ArrayOf();
		$this->fields = new MapOf(
			function($data) {
				return new LexiconConfigObj();
			}
		);
	}
	
	public $fieldOrder;
	
	/**
	 * 
	 * @var MapOf<LexiconConfigObj>
	 */
	public $fields;
	
	
}


?>
