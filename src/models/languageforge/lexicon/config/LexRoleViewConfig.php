<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexRoleViewConfig {
	
	public function __construct() {
		$this->fields = new MapOf(function($data) {
			return new LexViewFieldConfig();
		});
		$this->showTasks = new MapOf();
	}
	
	/**
	 * key is LexiconConfigObj field const
	 * @var MapOf <LexViewFieldConfig>
	 */
	public $fields;
	
	/**
	 * key is LexiconTask const
	 * @var MapOf <bool>
	 */
	public $showTasks;
	
}

class LexViewFieldConfig {
	
	public function __construct() {
		$this->show = true;
		$this->overrideInputSystems = false;
		$this->inputSystems = new ArrayOf();
	}
	
	/**
	 * @var bool
	 */
	public $show;
	
	/**
	 * @var bool
	 */
	public $overrideInputSystems;
	
	/**
	 * @var ArrayOf
	 */
	public $inputSystems;
	
}

?>
