<?php

namespace models\languageforge\lexicon\settings;

use models\mapper\MapOf;

class LexiconOptionlistConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::OPTIONLIST;
		$this->values = new MapOf();
		
		// default values
		$this->label = '';
		$this->setReadOnlyProp('values');
	}
	
	/**
	 * 
	 * @var string
	 */
	public $label;
	
	/**
	 * 
	 * @var MapOf<string>
	 */
	public $values;
	
}


?>
