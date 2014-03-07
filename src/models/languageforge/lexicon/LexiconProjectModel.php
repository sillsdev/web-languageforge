<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\settings\LexiconProjectSettings;

use models\mapper\MapOf;
use models\languageforge\LfProjectModel;

class LexiconProjectModel extends LfProjectModel {
	public function __construct($id = '') {
		$this->appName = LfProjectModel::LEXICON_APP;
		$this->inputSystems = new MapOf(
			function($data) {
				return new InputSystem();
			}
		);
		
		$this->settings = new LexiconProjectSettings();

		// default values
		$this->inputSystems['en'] = new InputSystem('en', 'English', 'en');
		$this->inputSystems['th'] = new InputSystem('th', 'Thai', 'th');

		parent::__construct($id);
	}
	
	/**
	 * 
	 * @var MapOf<InputSystem>
	 */
	public $inputSystems;
	
	/**
	 * 
	 * @var LexiconProjectSettings
	 */
	public $settings;
	
	/**
	 * 
	 * @var string
	 */
	public $liftFilePath;
}
?>