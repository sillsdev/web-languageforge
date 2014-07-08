<?php

namespace models\languageforge\lexicon\config;

use models\mapper\MapOf;

class LexRoleViewConfig {
	
	public function __construct() {
		$this->isFieldsVisible = new MapOf();
		$this->isTasksVisible = new MapOf();
	}
	
	/**
	 * key is LexiconConfigObj field const
	 * @var MapOf <boolean>
	 */
	public $isFieldsVisible;
	
	/**
	 * key is LexiconConfigObj task const
	 * @var MapOf <booelan>
	 */
	public $isTasksVisible;
	
}

?>
