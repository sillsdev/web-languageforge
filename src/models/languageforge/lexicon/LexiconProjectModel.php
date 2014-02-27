<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;
use models\languageforge\LfProjectModel;

class LexiconProjectModel extends LfProjectModel {
	public function __construct($id = '') {
		parent::__construct($id);
		$this->appName = LfProjectModel::LEXICON_APP;
		$this->inputSystems = new MapOf(
			function($data) {
				return new InputSystem();
			}
		);
	}
	
	/**
	 * 
	 * @var MapOf<InputSystem>
	 */
	public $inputSystems;
}
?>