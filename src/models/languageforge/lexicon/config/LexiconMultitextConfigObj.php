<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexiconMultitextConfigObj extends LexiconConfigObj {
	
	// display mode
	const SINGLE_LINE = 'singleline';
	const MULTI_LINE = 'multiline';
	
	public function __construct($displayMode = self::SINGLE_LINE) {
		$this->type = LexiconConfigObj::MULTITEXT;
		
		// default values
		$this->displayMode = $displayMode;
		$this->label = '';
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
	 * @var string SINGLE_LINE or MULTI_LINE
	 */
	public $displayMode;
	
}

?>
