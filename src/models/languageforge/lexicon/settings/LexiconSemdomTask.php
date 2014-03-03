<?php

namespace models\languageforge\lexicon\settings;


use models\mapper\MapOf;

class LexiconSemdomTask extends LexiconTask {

	function __construct() {
		$this->language = 'en';
		$this->visibleFields = new MapOf();
		$this->type = LexiconTask::SEMDOM;
		
		// default values
		$this->visibleFields['definition'] = true;
		$this->visibleFields['partOfSpeech'] = true;
		$this->visibleFields['example'] = true;
		$this->visibleFields['translation'] = true;
		parent::__construct();
	}
	
	/**
	 * 
	 * @var string
	 */
	public $language;
	
	/**
	 * 
	 * @var MapOf<boolean>
	 */
	public $visibleFields;
	
	

}

?>
