<?php

namespace models\languageforge\lexicon;

class InputSystem {
	
	public function __construct($tag = 'qaa', $name = '', $abbr = '') {
		$this->tag = $tag;
		$this->abbreviation = $abbr;
		$this->languageName = $name;
	}

    public $abbreviation;

    public $tag; // RFC5646 tag e.g. qaa-x-lang
    
    public $languageName;

}

?>
