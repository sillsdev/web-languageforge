<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;
use models\languageforge\LfProjectModel;
use models\languageforge\lexicon\settings\LexiconProjectSettings;
use libraries\shared\LanguageData;

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
	 * @var MapOf <InputSystem>
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
	
	/**
	 * Adds an input system if it doesn't already exist
	 * @param string $tag
	 * @param string $abbr
	 * @param string $name
	 */
	public function addInputSystem($tag, $abbr = '', $name = '') {
		if (! key_exists($tag, $this->inputSystems)) {
			if (! $abbr) {
				$abbr = $tag;
			}
			if (! $name) {
				$name = $tag;
				$languages = new LanguageData();
				$languageCode = $languages->getCode($tag);
				if (key_exists($languageCode, $languages)) {
					$name = $languages[$languageCode]->name;
				}
			}
			$this->inputSystems[$tag] = new InputSystem($tag, $name, $abbr);
		}
	}
	
}

?>
