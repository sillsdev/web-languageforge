<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexiconOptionlistConfigObj extends LexiconConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::OPTIONLIST;
		$this->values = new ArrayOf(function($data) {
			return new LexiconOptionListItem('');
		});

		// default values
		$this->label = '';
	}
	
	/**
	 * @var string
	 */
	public $label;
	
	/**
	 * @var ArrayOf
	 */
	public $values;
	
}


?>
