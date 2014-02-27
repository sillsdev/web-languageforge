<?php

namespace models\languageforge\lexicon\settings;

use models\mapper\MapOf;

class LexiconFieldListConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = 'fields';
		$this->fieldOrder = array();
		$this->fields = new MapOf(
			function($data) {
				return new Lexicon
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
