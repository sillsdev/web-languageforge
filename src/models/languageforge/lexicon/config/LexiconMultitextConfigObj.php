<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexiconMultitextConfigObj extends LexiconConfigObj {
	
	public function __construct() {
		$this->type = LexiconConfigObj::MULTITEXT;
		
		// default values
		$this->label = '';
		$this->displayMultiline = false;
		$this->width = 20;
		$this->inputSystems = new ArrayOf();
	}
	
	/**
	 * @var string
	 */
	public $label;
	
	/**
	 * @var int
	 */
	public $width;
	
	/**
	 * @var ArrayOf
	 */
	public $inputSystems;
	
	/**
	 * @var bool
	 */
	public $displayMultiline;
		
}

?>
