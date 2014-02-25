<?php

namespace models\languageforge\lexicon\settings;


use models\mapper\MapOf;

class LexiconSemdomTask extends LexiconTask {

	function __construct() {
		$this->language = 'en';
		$this->visibleFields = new MapOf(
			function($data) {
				return true;
			}
		);
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
