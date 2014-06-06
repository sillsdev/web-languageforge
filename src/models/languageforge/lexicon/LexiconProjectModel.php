<?php

namespace models\languageforge\lexicon;

use libraries\shared\LanguageData;
use models\languageforge\lexicon\config\LexConfiguration;
use models\languageforge\LfProjectModel;
use models\mapper\MapOf;

class LexiconProjectModel extends LfProjectModel {
	
	public function __construct($id = '') {
		$this->appName = LfProjectModel::LEXICON_APP;
		$this->rolesClass = 'models\languageforge\lexicon\LexiconRoles';
		$this->inputSystems = new MapOf(
			function($data) {
				return new InputSystem();
			}
		);
		
		$this->config = new LexConfiguration();

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
	 * @var LexConfiguration
	 */
	public $config;
	
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
