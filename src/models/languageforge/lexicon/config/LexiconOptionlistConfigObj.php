<?php

namespace models\languageforge\lexicon\config;

use models\mapper\MapOf;

class LexiconOptionlistConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::OPTIONLIST;
		$this->values = new MapOf();
		
		// default values
		$this->label = '';
	}
	
	/**
	 * @var string
	 */
	public $label;
	
	/**
	 * @var MapOf
	 */
	public $values;
	
}


?>
