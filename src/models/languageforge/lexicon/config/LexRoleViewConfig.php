<?php

namespace models\languageforge\lexicon\config;

use models\mapper\MapOf;

class LexRoleViewConfig {
	
	public function __construct() {
		$this->showFields = new MapOf();
		$this->showTasks = new MapOf();
	}
	
	/**
	 * key is LexiconConfigObj field const
	 * @var MapOf <boolean>
	 */
	public $showFields;
	
	/**
	 * key is LexiconTask const
	 * @var MapOf <booelan>
	 */
	public $showTasks;
	
}

?>
