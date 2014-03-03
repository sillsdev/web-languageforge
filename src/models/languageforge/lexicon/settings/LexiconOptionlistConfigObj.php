<?php

namespace models\languageforge\lexicon\settings;

use models\mapper\MapOf;

class LexiconOptionlistConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::OPTIONLIST;
		
		// default values
		$this->label = '';
	}
	
	/**
	 * 
	 * @var string
	 */
	public $label;
	
}


?>
