<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;

class LexRoleViewConfig {
	
	public function __construct() {
		$this->fields = new ArrayOf();
		$this->tasks = new ArrayOf();
	}
	
	/**
	 * Include LexiconConfigObj field const if it is visible
	 * @var ArrayOf <string>
	 */
	public $fields;
	
	/**
	 * Include LexiconConfigObj task const if it is visible
	 * @var ArrayOf <string>
	 */
	public $tasks;
	
}

?>
